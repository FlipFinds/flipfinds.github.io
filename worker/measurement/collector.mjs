import config from '../../data/measurement.json' with { type: 'json' };

const incrementSql = `INSERT INTO daily_counts(day,event,page,tool,device,detail,total)
  VALUES(?,?,?,?,?,?,1) ON CONFLICT(day,event,page,tool,device,detail)
  DO UPDATE SET total=total+1`;

function valid(data) {
  if (!data || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'detail,device,event,page,tool') return false;
  if (!Object.hasOwn(config.events, data.event) || !config.events[data.event].includes(data.detail)) return false;
  if (!config.pages.includes(data.page) || !config.tools.includes(data.tool) || !['mobile', 'desktop'].includes(data.device)) return false;
  if (data.page !== 'calculator' && data.tool !== 'none') return false;
  if (data.event.startsWith('calculator_') && (data.page !== 'calculator' || data.tool === 'none')) return false;
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = origin === 'https://flipfinds.net' || (env.DEV_ORIGIN && origin === env.DEV_ORIGIN);
    const headers = { 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (!allowed || url.pathname !== '/collect' || url.search) return new Response(null, { status: 404, headers });
    headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers,
      'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (request.method !== 'POST') return new Response(null, { status: 405, headers });
    if (request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1') return new Response(null, { status: 204, headers });
    if (!env.COUNTS || !env.INGEST_LIMIT) return new Response(null, { status: 503, headers });
    try {
      // Shared ingestion limit without an IP-based identifier.
      if (!(await env.INGEST_LIMIT.limit({ key: 'public-site' })).success) return new Response(null, { status: 429, headers });
      if (!request.body || Number(request.headers.get('Content-Length')) > 512) return new Response(null, { status: 400, headers });
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let body = '', bytes = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 512) { await reader.cancel(); return new Response(null, { status: 400, headers }); }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
      let data;
      try { data = JSON.parse(body); } catch { return new Response(null, { status: 400, headers }); }
      if (!valid(data)) return new Response(null, { status: 400, headers });
      const day = new Date().toISOString().slice(0, 10);
      await env.COUNTS.prepare(incrementSql).bind(day, data.event, data.page, data.tool, data.device, data.detail).run();
      return new Response(null, { status: 204, headers });
    } catch { return new Response(null, { status: 503, headers }); }
  },
  async scheduled(_event, env) {
    await env.COUNTS.prepare("DELETE FROM daily_counts WHERE day < date('now','-90 days')").run();
  },
};
