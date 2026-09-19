import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  LocalImportError,
  readLocalWorkBuddyAccounts,
} from '../src/workbuddy/local-account-import.js';
import { CredentialPool } from '../src/workbuddy/credential-pool.js';

const dirs: string[] = [];

async function tempFile(value: unknown): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'wkbdy2api-import-'));
  dirs.push(dir);
  const path = join(dir, 'workbuddy-desktop-ai.info');
  await writeFile(path, typeof value === 'string' ? value : JSON.stringify(value), 'utf8');
  return path;
}

function jwt(sub: string, exp: number, marker = 'a'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub, exp, marker })).toString('base64url');
  return `${header}.${payload}.signature`;
}

function pool(): CredentialPool {
  return new CredentialPool();
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('local WorkBuddy account import', () => {
  const now = Date.UTC(2026, 8, 14);
  const future = Math.floor(now / 1000) + 3600;

  it('imports a valid account without exposing full identity in its note', async () => {
    const token = jwt('user-12345678', future);
    const path = await tempFile({
      account: { uid: 'user-12345678', email: 'private@example.com' },
      auth: { accessToken: token, domain: 'www.workbuddy.ai' },
    });

    const result = await readLocalWorkBuddyAccounts(path, now);

    expect(result.credentials).toHaveLength(1);
    expect(result.issues).toEqual([]);
    expect(result.credentials[0]?.credential).toEqual({
      accessToken: token,
      userId: 'user-12345678',
      domain: 'www.workbuddy.ai',
    });
    expect(result.credentials[0]?.note).not.toContain('private@example.com');
    expect(result.credentials[0]?.note).not.toContain('user-12345678');
    expect(result.credentials[0]?.note).not.toContain(token);
  });

  it('refreshes an existing account instead of duplicating it', async () => {
    const credentials = pool();
    credentials.add({
      accessToken: jwt('same-user', future, 'old'),
      userId: 'same-user',
      domain: 'www.workbuddy.ai',
    });
    const refreshedToken = jwt('same-user', future + 60, 'new');
    credentials.add({
      accessToken: refreshedToken,
      userId: 'same-user',
      domain: 'www.workbuddy.ai',
    });

    expect(credentials.size).toBe(1);
    expect((await credentials.getCredential()).accessToken).toBe(refreshedToken);
  });

  it('imports multiple accounts from allAccounts', async () => {
    const path = await tempFile({
      allAccounts: [
        {
          account: { uid: 'user-a' },
          auth: { accessToken: jwt('user-a', future), domain: 'workbuddy.ai' },
        },
        {
          account: { uid: 'user-b' },
          auth: { accessToken: jwt('user-b', future), domain: 'api.workbuddy.ai' },
        },
      ],
    });

    const result = await readLocalWorkBuddyAccounts(path, now);

    expect(result.credentials).toHaveLength(2);
    expect(result.issues).toEqual([]);
    expect(result.credentials.map(({ credential }) => credential.userId)).toEqual(['user-a', 'user-b']);
  });

  it('rejects an expired token', async () => {
    const path = await tempFile({
      account: { uid: 'expired-user' },
      auth: { accessToken: jwt('expired-user', Math.floor(now / 1000) - 1) },
    });

    const result = await readLocalWorkBuddyAccounts(path, now);

    expect(result.credentials).toEqual([]);
    expect(result.issues).toEqual([
      { code: 'expired', message: 'Account token is expired or has no expiry.' },
    ]);
  });

  it('rejects a JWT whose sub differs from account.uid', async () => {
    const path = await tempFile({
      account: { uid: 'account-user' },
      auth: { accessToken: jwt('token-user', future) },
    });

    const result = await readLocalWorkBuddyAccounts(path, now);

    expect(result.credentials).toEqual([]);
    expect(result.issues).toEqual([
      { code: 'identity_mismatch', message: 'Account identity does not match its token.' },
    ]);
  });

  it('reports a missing credential file without including its path', async () => {
    const missing = join(tmpdir(), `missing-workbuddy-${Date.now()}.info`);

    await expect(readLocalWorkBuddyAccounts(missing, now)).rejects.toMatchObject({
      name: 'LocalImportError',
      code: 'file_not_found',
      message: 'Local WorkBuddy credential file not found.',
    } satisfies Partial<LocalImportError>);
    // The path travels in its own field so the panel can show it deliberately,
    // while the message itself stays free of filesystem details.
    await expect(readLocalWorkBuddyAccounts(missing, now)).rejects.toMatchObject({
      path: missing,
    } satisfies Partial<LocalImportError>);
    const err: unknown = await readLocalWorkBuddyAccounts(missing, now).catch((e: unknown) => e);
    expect((err as LocalImportError).message).not.toContain(missing);
  });

  it('reports malformed JSON as a format error', async () => {
    const path = await tempFile('{not-json');

    await expect(readLocalWorkBuddyAccounts(path, now)).rejects.toMatchObject({
      name: 'LocalImportError',
      code: 'format_error',
      message: 'The credential file is not valid JSON.',
    } satisfies Partial<LocalImportError>);
  });
});
