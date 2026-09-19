import { Window, type HTMLInputElement, type HTMLButtonElement, type HTMLSelectElement } from 'happy-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminPanelHtml } from '../src/routes/admin-html.js';

const windows: Window[] = [];
afterEach(async () => { await Promise.all(windows.splice(0).map((w) => w.happyDOM.close())); });

const models = [
  {
    id: 'deepseek-v4.1-flash',
    x_workbuddy: {
      name: 'Deepseek',
      credits: 'x0.00',
      context_window: { defaultLength: 300000, supportedLengths: [300000, 1000000] },
    },
  },
  {
    id: 'gpt-6-astra',
    x_workbuddy: {
      name: 'Astra',
      credits: 'x1.00',
      context_window: { defaultLength: 400000, supportedLengths: [400000, 1000000] },
    },
  },
];

const base = {
  version: 'test',
  credential: { ok: true, source: 'pool', detail: '' },
  upstream: { url: 'https://www.workbuddy.ai/v2/chat/completions', user_agent: 'WorkBuddy/2.137.1' },
  models,
  pool: { size: 0, strategy: 'round-robin', context_window: {}, accounts: [] },
  stats: { uptime_ms: 0, total_requests: 0, total_errors: 0, error_rate: 0, p95_ms: null, per_model: [], tokens: { prompt: 0, completion: 0 } },
};

async function openModelsView() {
  const w = new Window({ url: 'http://127.0.0.1:8787/admin' });
  windows.push(w);
  const saved: Record<string, number> = {};
  const fetchFn = vi.fn(async (path: string, init?: RequestInit) => {
    if (path.endsWith('/overview')) {
      const body = { ...base, pool: { ...base.pool, context_window: { ...saved } } };
      return { ok: true, status: 200, json: async () => body } as Response;
    }
    if (path.endsWith('context-window') && init?.method === 'POST') {
      const payload = JSON.parse(String(init.body));
      saved[payload.model_id] = payload.context_window;
      return { ok: true, status: 200, json: async () => ({ ok: true, model_id: payload.model_id, context_window: payload.context_window }) } as Response;
    }
    if (path.endsWith('context-window')) {
      return { ok: true, status: 200, json: async () => ({ context_windows: { ...saved } }) } as Response;
    }
    throw new Error('unexpected local request: ' + path);
  });
  w.fetch = fetchFn as never;
  w.document.write(adminPanelHtml());
  // Script tags are inert in this test; evaluate only the page's own trusted code.
  w.eval(w.document.querySelector('script')!.textContent!);
  const input = w.document.querySelector('#key-input') as unknown as HTMLInputElement;
  input.value = 'test-only-admin-key';
  (w.document.querySelector('#key-submit') as unknown as HTMLButtonElement).click();
  await vi.waitFor(() => expect(w.document.querySelector('#main .section')).not.toBeNull());
  (w.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
  await vi.waitFor(() => expect(w.document.querySelector('.context-select')).not.toBeNull());
  return { w, saved };
}

function pick(w: Window, model: string, value: string) {
  const select = w.document.querySelector(`select[data-context-model="${model}"]`) as unknown as HTMLSelectElement;
  if (!select) throw new Error('no select for ' + model);
  select.value = value;
  select.dispatchEvent(new w.Event('change'));
  return select;
}

describe('per-model context selection', () => {
  it('saves the choice for a model id containing a dot', async () => {
    const { w, saved } = await openModelsView();
    pick(w, 'deepseek-v4.1-flash', '1000000');
    await vi.waitFor(() => expect(saved['deepseek-v4.1-flash']).toBe(1000000));
    await vi.waitFor(() => expect(w.document.getElementById('context-save-state-deepseek-v4.1-flash')?.textContent).toBe('Saved · applies to all accounts'));
  });

  it('saves the choice for a model id without a dot', async () => {
    const { w, saved } = await openModelsView();
    pick(w, 'gpt-6-astra', '1000000');
    await vi.waitFor(() => expect(saved['gpt-6-astra']).toBe(1000000));
  });

  it('keeps the saved choice after the view is rebuilt', async () => {
    const { w } = await openModelsView();
    pick(w, 'deepseek-v4.1-flash', '1000000');
    await vi.waitFor(() => expect(w.document.getElementById('context-save-state-deepseek-v4.1-flash')?.textContent).toBe('Saved · applies to all accounts'));
    (w.document.querySelector('[data-view="overview"]') as unknown as HTMLButtonElement).click();
    (w.document.querySelector('[data-view="models"]') as unknown as HTMLButtonElement).click();
    await vi.waitFor(() => expect(w.document.querySelector('.context-select')).not.toBeNull());
    const select = w.document.querySelector('select[data-context-model="deepseek-v4.1-flash"]') as unknown as HTMLSelectElement;
    expect(select.value).toBe('1000000');
  });
});
