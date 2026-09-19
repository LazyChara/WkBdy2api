import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { CredentialPool } from '../src/workbuddy/credential-pool.js';
import { WorkBuddyClient } from '../src/workbuddy/client.js';
import { createMetrics } from '../src/observability/metrics.js';

const KEY = 'test-only-oauth-admin-key';
const apps: FastifyInstance[] = [];
afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });

function setup() {
  const pool = new CredentialPool();
  const fetchFn = vi.fn(async () => new Response(JSON.stringify({ code: 0, data: { authUrl: 'https://www.workbuddy.ai/login?state=official-secret', state: 'official-secret' } })));
  const client = new WorkBuddyClient({ credentials: pool, userAgent: 'WorkBuddy/2.137.1', upstreamUrl: 'https://www.workbuddy.ai/v2/chat/completions', fetchFn: async () => { throw new Error('no chat allowed'); } });
  const app = buildApp({ apiKey: KEY, pool, client, models: [], metrics: createMetrics(), upstreamUrl: 'https://www.workbuddy.ai/v2/chat/completions', upstreamUa: 'WorkBuddy/2.137.1', version: 'test', startedAt: Date.now(), oauthOptions: { fetchFn, pollIntervalMs: 60_000 } });
  apps.push(app);
  const headers = { authorization: `Bearer ${KEY}`, origin: 'https://gateway.example', host: 'gateway.example' };
  return { app, headers, fetchFn };
}

describe('OAuth management endpoints', () => {
  it('requires the admin bearer and a same-origin browser to create a transaction', async () => {
    const { app, headers, fetchFn } = setup();
    expect((await app.inject({ method: 'POST', url: '/admin/api/oauth/start', headers: { origin: headers.origin, host: headers.host }, payload: {} })).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/admin/api/oauth/start', headers: { ...headers, origin: 'https://attacker.example' }, payload: {} })).statusCode).toBe(403);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('issues HttpOnly cookie, binds status/cancel to it and hides official state', async () => {
    const { app, headers } = setup();
    const start = await app.inject({ method: 'POST', url: '/admin/api/oauth/start', headers, payload: {} });
    expect(start.statusCode).toBe(200);
    const setCookie = String(start.headers['set-cookie']);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Strict');
    expect(setCookie).toContain('Secure');
    expect(start.headers['cache-control']).toBe('no-store');
    const id = start.json().id;
    const cookie = setCookie.split(';')[0]!;
    expect((await app.inject({ url: `/admin/api/oauth/${id}/status`, headers })).statusCode).toBe(404);
    const status = await app.inject({ url: `/admin/api/oauth/${id}/status`, headers: { ...headers, cookie } });
    expect(status.json().status).toBe('pending');
    expect(status.body).not.toContain('official-secret');
    expect(status.body).not.toContain('authorization_url');
    const cancel = await app.inject({ method: 'POST', url: `/admin/api/oauth/${id}/cancel`, headers: { ...headers, cookie } });
    expect(cancel.statusCode).toBe(200);
    expect(cancel.json().status).toBe('cancelled');
  });

  it('serves sign-in and import buttons, never token input fields', async () => {
    const { app } = setup();
    const panel = await app.inject('/admin');
    expect(panel.body).toContain('id="oauth-start"');
    expect(panel.body).toContain('id="local-import"');
    expect(panel.body).not.toContain('id="login-token"');
    expect(panel.body).not.toContain(KEY);
  });
});
