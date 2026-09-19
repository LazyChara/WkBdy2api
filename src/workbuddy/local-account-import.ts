import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { stripBearer, type WorkBuddyCredential } from './auth.js';

const DEFAULT_DOMAIN = 'www.workbuddy.ai';

const accountSchema = z.object({
  uid: z.string().min(1),
  email: z.string().optional(),
  auth: z.unknown().optional(),
}).passthrough();

const authSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  domain: z.string().optional(),
}).passthrough();

type Candidate = {
  account: unknown;
  auth: unknown;
};

export type LocalImportIssueCode =
  | 'format_error'
  | 'expired'
  | 'identity_mismatch'
  | 'invalid_domain';

export type LocalImportIssue = {
  code: LocalImportIssueCode;
  message: string;
};

export type LocalImportResult = {
  credentials: Array<{ credential: WorkBuddyCredential; note: string }>;
  issues: LocalImportIssue[];
};

export class LocalImportError extends Error {
  constructor(
    readonly code: 'file_not_found' | 'format_error' | 'read_error',
    message: string,
    readonly path?: string,
  ) {
    super(message);
    this.name = 'LocalImportError';
  }
}

export async function readLocalWorkBuddyAccounts(
  path: string,
  now = Date.now(),
): Promise<LocalImportResult> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new LocalImportError('file_not_found', 'Local WorkBuddy credential file not found.', path);
    }
    throw new LocalImportError('read_error', 'Cannot read the local WorkBuddy credential file.', path);
  }

  let document: unknown;
  try {
    document = JSON.parse(raw);
  } catch {
    throw new LocalImportError('format_error', 'The credential file is not valid JSON.', path);
  }

  const candidates = collectCandidates(document);
  if (candidates.length === 0) {
    throw new LocalImportError('format_error', 'No recognizable account structure in the credential file.', path);
  }

  const credentials: LocalImportResult['credentials'] = [];
  const issues: LocalImportIssue[] = [];

  for (const candidate of candidates) {
    const account = accountSchema.safeParse(candidate.account);
    const auth = authSchema.safeParse(candidate.auth);
    if (!account.success || !auth.success) {
      issues.push({ code: 'format_error', message: 'Account is missing required fields.' });
      continue;
    }

    const token = stripBearer(auth.data.accessToken);
    const payload = parseJwtPayload(token);
    if (!payload) {
      issues.push({ code: 'format_error', message: 'Account token is malformed.' });
      continue;
    }
    if (payload.sub !== account.data.uid) {
      issues.push({ code: 'identity_mismatch', message: 'Account identity does not match its token.' });
      continue;
    }
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= now) {
      issues.push({ code: 'expired', message: 'Account token is expired or has no expiry.' });
      continue;
    }

    const domain = auth.data.domain ?? DEFAULT_DOMAIN;
    if (!isAllowedDomain(domain)) {
      issues.push({ code: 'invalid_domain', message: 'Account domain is not allowed.' });
      continue;
    }

    credentials.push({
      credential: { accessToken: token, userId: account.data.uid, domain },
      note: buildSafeNote(account.data.email, account.data.uid),
    });
  }

  return { credentials, issues };
}

function collectCandidates(document: unknown): Candidate[] {
  if (!document || typeof document !== 'object') return [];
  const root = document as Record<string, unknown>;
  const candidates: Candidate[] = [];

  if (root.account && root.auth) {
    candidates.push({ account: root.account, auth: root.auth });
  }

  for (const key of ['accounts', 'allAccounts']) {
    const value = root[key];
    const entries = Array.isArray(value)
      ? value
      : value && typeof value === 'object'
        ? Object.values(value as Record<string, unknown>)
        : [];
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const record = entry as Record<string, unknown>;
      candidates.push({
        account: record.account ?? entry,
        auth: record.auth ?? root.auth,
      });
    }
  }

  return candidates;
}

function parseJwtPayload(token: string): { sub?: unknown; exp?: unknown } | undefined {
  const parts = token.split('.');
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1] ?? '', 'base64url').toString('utf8'));
    return payload && typeof payload === 'object' ? payload : undefined;
  } catch {
    return undefined;
  }
}

function isAllowedDomain(domain: string): boolean {
  const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] ?? '';
  return normalized === 'workbuddy.ai' || normalized.endsWith('.workbuddy.ai');
}

function buildSafeNote(email: string | undefined, uid: string): string {
  const uidSuffix = uid.slice(-4);
  if (!email || !email.includes('@')) return `Local file · UID …${uidSuffix}`;
  const domain = email.slice(email.lastIndexOf('@') + 1);
  return `Local file · …@${domain} · UID …${uidSuffix}`;
}
