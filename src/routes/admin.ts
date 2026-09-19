import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { isApiKeyValid } from '../security/downstream-auth.js';
import { openAiError } from '../openai/errors.js';
import type { ExposedModel } from '../workbuddy/model-catalog.js';
import type { MetricsCollector } from '../observability/metrics.js';
import type { CredentialProvider } from '../workbuddy/auth.js';
import { UpstreamHttpError } from '../workbuddy/client.js';
import { stripBearer } from '../workbuddy/auth.js';
import type { CredentialPool } from '../workbuddy/credential-pool.js';
import { LocalImportError, readLocalWorkBuddyAccounts } from '../workbuddy/local-account-import.js';
import { adminPanelHtml } from './admin-html.js';
import type { OAuthBroker } from '../workbuddy/oauth-broker.js';
import { oauthRoutes } from './oauth.js';

interface AdminOpts {
  apiKey: string;
  models: ExposedModel[];
  metrics: MetricsCollector;
  /** Multi-account pool managed by the panel. */
  pool: CredentialPool;
  oauth: OAuthBroker;
  /** Local WorkBuddy credential file used by the account import endpoint. */
  credentialsPath: string;
  upstreamUrl: string;
  upstreamUa: string;
  startedAt: number;
  version: string;
  /** Verifies a candidate credential against the upstream before adding. */
  verifyCredential: (cred: { accessToken: string; userId: string }) => Promise<void>;
}

/**
 * Admin panel routes. Same bearer auth as the API (the panel stores the key
 * in localStorage after one entry) — no separate auth system to drift.
 *
 *   GET  /admin                    → single-page panel
 *   GET  /admin/api/overview        → stats + catalog + credential/pool status
 *   GET  /admin/api/requests        → recent request log
 *   POST /admin/api/accounts        → verify & add an account to the pool
 *   POST /admin/api/accounts/remove → remove an account by label
 *   GET  /admin/api/strategy        → current scheduling strategy
 *   POST /admin/api/strategy        → set strategy: round-robin | random
 */
export function adminRoutes(app: FastifyInstance, opts: AdminOpts): void {
  // Panel HTML itself is served without the key so the browser can load the
  // page; every data call behind /admin/api requires it.
  app.get('/admin', async (_req, reply) => {
    reply.header('content-type', 'text/html; charset=utf-8');
    reply.header('cache-control', 'no-store');
    return adminPanelHtml();
  });

  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.url.startsWith('/admin/api/')) return;
    const header = req.headers.authorization;
    const provided = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!isApiKeyValid(provided, opts.apiKey)) {
      return reply.code(401).send(openAiError(401, 'invalid_api_key', 'Invalid or missing API key.').body);
    }
  });

  void app.register(oauthRoutes, { prefix: '/admin/api/oauth', broker: opts.oauth });

  app.get('/admin/api/overview', async () => {
    const stats = opts.metrics.snapshot();
    const accounts = opts.pool.list();
    const credential = {
      source: opts.pool.describe(),
      ok: accounts.some((account) => account.ok),
      detail: accounts.length ? '账号池状态；请求时检查令牌有效期。' : '账号池为空，请从面板登录。',
    };
    return {
      version: opts.version,
      started_at: opts.startedAt,
      stats,
      models: opts.models,
      credential,
      pool: {
        size: opts.pool.size,
        strategy: opts.pool.strategyName,
        context_window: opts.pool.contextWindowSettings,
        accounts: opts.pool.list(),
      },
      upstream: { url: opts.upstreamUrl, user_agent: opts.upstreamUa },
    };
  });

  app.get('/admin/api/requests', async () => {
    return { recent: opts.metrics.snapshot().recent };
  });

  const accountSchema = z.object({
    token: z.string().min(20, 'token too short to be real'),
    user_id: z.string().min(1).optional(),
    note: z.string().max(64).optional(),
    domain: z.string().optional(),
  });

  // Add an account: verify against the upstream first, then pool it.
  app.post('/admin/api/accounts', async (req, reply) => {
    const parsed = accountSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const err = openAiError(400, 'invalid_request', first ? `${first.path.join('.')}: ${first.message}` : 'Invalid account body.');
      return reply.code(err.statusCode).send(err.body);
    }
    const { token, user_id, note } = parsed.data;
    const domain = parsed.data.domain ?? 'www.workbuddy.ai';
    // user_id is optional: derive it from the JWT `sub` claim when absent
    // (verified: account.uid === JWT sub). This makes adding an account a
    // single paste. The value is surface-proofed below — never echoed back.
    let effectiveUserId = user_id;
    if (!effectiveUserId) {
      try {
        effectiveUserId = jwtSub(stripBearer(token));
      } catch {
        /* not a parseable JWT — let credential verification report it */
      }
    }
    if (!effectiveUserId) {
      const e = openAiError(400, 'invalid_request', 'user_id is required (token is not a JWT with a sub claim).');
      return reply.code(e.statusCode).send(e.body);
    }
    try {
      await opts.verifyCredential({ accessToken: stripBearer(token), userId: effectiveUserId });
    } catch (err) {
      const detail =
        err instanceof UpstreamHttpError
          ? `upstream rejected the token (HTTP ${err.status}${err.upstreamMessage ? `: ${err.upstreamMessage.slice(0, 120)}` : ''})`
          : 'could not reach the upstream to verify this token';
      const e = openAiError(401, 'upstream_authentication_error', detail);
      return reply.code(e.statusCode).send(e.body);
    }
    const account = await opts.pool.add({ accessToken: token, userId: effectiveUserId, domain }, note);
    return reply.code(200).send({ ok: true, label: account.label, pool_size: opts.pool.size });
  });

  app.post('/admin/api/accounts/import-local', async (_req, reply) => {
    try {
      const result = await readLocalWorkBuddyAccounts(opts.credentialsPath);
      const before = opts.pool.size;
      for (const { credential, note } of result.credentials) {
        await opts.pool.add(credential, note);
      }
      return reply.code(200).send({
        ok: true,
        imported: opts.pool.size - before,
        accepted: result.credentials.length,
        issues: result.issues,
        pool_size: opts.pool.size,
      });
    } catch (err) {
      if (err instanceof LocalImportError) {
        // Machine-readable code + resolved path: the panel explains the failure
        // in its own language instead of echoing this English string back.
        const status = err.code === 'file_not_found' ? 404 : 400;
        return reply.code(status).send({
          error: {
            message: err.message,
            type: 'invalid_request_error',
            param: err.path ?? null,
            code: `local_import_${err.code}`,
          },
        });
      }
      const error = openAiError(500, 'internal_error', 'Could not import local WorkBuddy accounts.');
      return reply.code(error.statusCode).send(error.body);
    }
  });

  app.post('/admin/api/accounts/remove', async (req, reply) => {
    const parsed = z.object({ label: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      const err = openAiError(400, 'invalid_request', 'label is required.');
      return reply.code(err.statusCode).send(err.body);
    }
    const removed = await opts.pool.remove(parsed.data.label);
    return reply.code(removed ? 200 : 404).send({ ok: removed, pool_size: opts.pool.size });
  });

  const contextSchema = z.object({ model_id: z.string().min(1), context_window: z.number().int().positive().nullable() });
  app.get('/admin/api/context-window', async () => ({ context_windows: opts.pool.contextWindowSettings }));
  app.post('/admin/api/context-window', async (req, reply) => {
    const parsed = contextSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = openAiError(400, 'invalid_request', 'context_window must be a positive integer or null.');
      return reply.code(err.statusCode).send(err.body);
    }
    const model = opts.models.find((entry) => entry.id === parsed.data.model_id);
    if (!model) return reply.code(404).send(openAiError(404, 'model_not_found', 'Model not found.').body);
    const lengths = model.x_workbuddy.context_window?.supportedLengths ?? [];
    if (parsed.data.context_window !== null && !lengths.includes(parsed.data.context_window)) {
      return reply.code(400).send(openAiError(400, 'invalid_request', 'Choose a context window supported by this model.', 'context_window').body);
    }
    await opts.pool.setContextWindow(model.id, parsed.data.context_window ?? undefined);
    return reply.code(200).send({ ok: true, model_id: parsed.data.model_id, context_window: opts.pool.getContextWindow(parsed.data.model_id) ?? null });
  });

  const strategySchema = z.object({ strategy: z.enum(['round-robin', 'random']) });
  app.get('/admin/api/strategy', async () => ({ strategy: opts.pool.strategyName, pool_size: opts.pool.size }));
  app.post('/admin/api/strategy', async (req, reply) => {
    const parsed = strategySchema.safeParse(req.body);
    if (!parsed.success) {
      const err = openAiError(400, 'invalid_request', "strategy must be 'round-robin' or 'random'.");
      return reply.code(err.statusCode).send(err.body);
    }
    await opts.pool.setStrategy(parsed.data.strategy);
    return reply.code(200).send({ ok: true, strategy: opts.pool.strategyName });
  });
}

/** Extract the `sub` claim from a JWT token — the userId used for X-User-Id. */
function jwtSub(token: string): string | undefined {
  const parts = token.split('.');
  if (parts.length !== 3 || !token.startsWith('eyJ')) return undefined;
  const payload = JSON.parse(Buffer.from(parts[1] ?? '', 'base64url').toString('utf8'));
  return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : undefined;
}

/** Safe token description: scheme + shape + expiry only. No value material. */
function describeToken(token: string): string {
  const parts = token.split('.');
  if (parts.length === 3 && token.startsWith('eyJ')) {
    let exp: string | null = null;
    try {
      const payloadPart = parts[1] ?? '';
      const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
      if (typeof payload.exp === 'number') {
        const d = new Date(payload.exp * 1000);
        const days = Math.round((d.getTime() - Date.now()) / 86_400_000);
        exp = days > 0 ? `valid ~${days} more days` : `expired ${-days} days ago`;
      }
    } catch {
      /* opaque JWT payload — fine */
    }
    return `JWT (RS256), ${token.length} chars${exp ? `, ${exp}` : ''}`;
  }
  return `opaque token, ${token.length} chars`;
}
