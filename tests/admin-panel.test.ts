import { Window, type HTMLInputElement, type HTMLButtonElement, type HTMLSelectElement } from 'happy-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminPanelHtml } from '../src/routes/admin-html.js';

const windows: Window[] = [];
afterEach(async () => { await Promise.all(windows.splice(0).map((w) => w.happyDOM.close())); });
const overview = {
  version: 'test', credential: { ok: false, source: 'not configured', detail: '' },
  upstream: { url: 'https://www.workbuddy.ai/v2/chat/completions', user_agent: 'WorkBuddy/2.137.1' },
  models: [{ id: 'deepseek-v4.1-flash', x_workbuddy: { name: 'Deepseek', credits: 'x0.00', context_window: { defaultLength: 300000, supportedLengths: [300000, 1000000] } } }], pool: { size: 0, strategy: 'round-robin', context_window: null, accounts: [] },
  stats: { uptime_ms: 0, total_requests: 0, total_errors: 0, error_rate: 0, p95_ms: null, per_model: [], tokens: { prompt: 0, completion: 0 } },
};

async function panel(popupBlocked = false, context: { saved: Record<string, number>; fail?: boolean; delay?: Promise<void> } = { saved: { 'deepseek-v4.1-flash': 300000 } }) {
  const w = new Window({ url: 'http://127.0.0.1:7891/admin' });
  windows.push(w);
  let completed = false;
  const fetchFn = vi.fn(async (path: string, init?: RequestInit) => {
    let body: unknown;
    if (path.endsWith('/oauth/start')) body = { id: 'test-transaction', authorization_url: 'https://www.workbuddy.ai/login?state=secret-in-memory', status: 'pending' };
    else if (path.endsWith('/status')) { completed = true; body = { id: 'test-transaction', status: 'completed', account_label: '#1' }; }
    else if (path.endsWith('/context-window')) {
      if (context.delay) await context.delay;
      if (context.fail) return { ok: false, status: 500, json: async () => ({ error: { message: 'Disk unavailable' } }) } as Response;
      const change = JSON.parse(String(init?.body));
      context.saved[change.model_id] = change.context_window;
      body = { ok: true, ...change };
    }
    else if (path.endsWith('/overview')) body = { ...overview, pool: { ...overview.pool, context_window: { ...context.saved }, ...(completed ? { size: 1, accounts: [{ label: '#1', note: 'Account', ok: true, detail: '网页登录' }] } : {}) } };
    else throw new Error('unexpected local request');
    return { ok: true, status: 200, json: async () => body } as Response;
  });
  w.fetch = fetchFn as never;
  const popup = { opener: null, closed: false, document: new Window().document, location: { replace: vi.fn() }, close: vi.fn() };
  w.open = vi.fn(() => popupBlocked ? null : popup) as never;
  w.document.write(adminPanelHtml());
  const script = w.document.querySelector('script')!.textContent!;
  // Script tags are inert in this test; evaluate only the page's own trusted code.
  w.eval(script);
  const input = w.document.querySelector('#key-input') as unknown as HTMLInputElement;
  input.value = 'test-only-admin-key';
  (w.document.querySelector('#key-submit') as unknown as HTMLButtonElement).click();
  await vi.waitFor(() => expect(w.document.querySelector('#main h2')?.textContent).toBe('Overview'));
  (w.document.querySelector('[data-view="upstream"]') as unknown as HTMLButtonElement).click();
  return { w, fetchFn, popup };
}

describe('embedded OAuth panel interactions', () => {
  it('unlocks without reload, opens OAuth, and updates only account rows on completion', async () => {
    const { w, fetchFn, popup } = await panel();
    const section = w.document.querySelector('#main .section');
    const note = w.document.querySelector('#oauth-note') as unknown as HTMLInputElement;
    note.value = 'keep my note'; note.focus();
    (w.document.querySelector('#oauth-start') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(popup.location.replace).toHaveBeenCalledWith('https://www.workbuddy.ai/login?state=secret-in-memory'));
    await vi.waitFor(() => expect(w.document.querySelector('#oauth-status')?.textContent).toContain('Signed in'), { timeout: 3000 });
    await vi.waitFor(() => expect(w.document.querySelector('#acct-rows')?.textContent).toContain('#1'));
    expect(w.document.querySelector('#main .section')).toBe(section);
    expect(w.document.querySelector('#oauth-note')).toBe(note);
    expect(note.value).toBe('keep my note');
    expect(w.localStorage.length).toBe(1);
    expect(w.localStorage.getItem('wkb2api-admin-key')).toBe('test-only-admin-key');
    expect(fetchFn.mock.calls.filter(([p]) => p.endsWith('/oauth/start'))).toHaveLength(1);
  });

  it('renders Credits price and selectable global context tiers', async () => {
    const { w } = await panel();
    (w.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
    const selector = w.document.querySelector('.context-select') as unknown as HTMLSelectElement;
    expect(selector).not.toBeNull();
    expect(selector.options.length).toBe(2);
    expect(selector.value).toBe('300000');
    expect(w.document.body.textContent).toContain('x0.00 Credits');
  });
  it('saves a dotted model ID, survives navigation and reload without browser preferences', async () => {
    const context = { saved: { 'deepseek-v4.1-flash': 300000 } as Record<string, number> };
    const { w, fetchFn } = await panel(false, context);
    (w.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
    const select = w.document.querySelector('.context-select') as unknown as HTMLSelectElement;
    select.value = '1000000';
    select.dispatchEvent(new w.Event('change'));
    await vi.waitFor(() => expect(w.document.getElementById('context-save-state-deepseek-v4.1-flash')?.textContent).toContain('Saved'));
    expect(fetchFn.mock.calls.find(([path]) => path.endsWith('/context-window'))?.[1]?.body).toBe(JSON.stringify({ model_id: 'deepseek-v4.1-flash', context_window: 1000000 }));
    for (const view of ['overview', 'models']) (w.document.querySelector('[data-view="' + view + '"]') as unknown as HTMLButtonElement).click();
    expect((w.document.querySelector('.context-select') as unknown as HTMLSelectElement).value).toBe('1000000');
    const reloaded = (await panel(false, context)).w;
    (reloaded.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
    expect((reloaded.document.querySelector('.context-select') as unknown as HTMLSelectElement).value).toBe('1000000');
    expect(w.localStorage.getItem('wkb2api-model-context')).toBeNull();
  });

  it('rolls back failed saves and preserves the server value', async () => {
    const context = { saved: { 'deepseek-v4.1-flash': 300000 } as Record<string, number>, fail: true };
    const { w } = await panel(false, context);
    (w.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
    const select = w.document.querySelector('.context-select') as unknown as HTMLSelectElement;
    select.value = '1000000'; select.dispatchEvent(new w.Event('change'));
    await vi.waitFor(() => expect(select.disabled).toBe(false));
    expect(select.value).toBe('300000');
    expect(w.document.getElementById('context-save-state-deepseek-v4.1-flash')?.textContent).toContain('Save failed');
    expect(context.saved).toEqual({ 'deepseek-v4.1-flash': 300000 });
  });

  it('offers a safe explicit link if the browser blocks the new tab', async () => {
    const { w } = await panel(true);
    (w.document.querySelector('#oauth-start') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('#oauth-link')?.hasAttribute('hidden')).toBe(false));
    expect(w.document.querySelector('#oauth-link')?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(w.document.querySelector('#oauth-status')?.textContent).toContain('click the link below');
  });
  it('defaults to English and switches EN/RU/ZH with persistence', async () => {
    const { w } = await panel();
    (w.document.querySelector('[data-view="overview"]') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('#toolbar-title')?.textContent).toBe('Overview'));
    expect(w.document.documentElement.lang).toBe('en');
    (w.document.querySelector('.lang-btn[data-lang="ru"]') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('#toolbar-title')?.textContent).toBe('Обзор'));
    expect(w.document.documentElement.lang).toBe('ru');
    (w.document.querySelector('.lang-btn[data-lang="zh"]') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('#toolbar-title')?.textContent).toBe('概览'));
    (w.document.querySelector('.lang-btn[data-lang="en"]') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('#toolbar-title')?.textContent).toBe('Overview'));
    expect(w.localStorage.getItem('wkb2api-lang')).toBe('en');
  });

});
