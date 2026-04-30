const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

const checks = [
  { name: 'home page', url: `${BASE_URL}/`, method: 'GET', expectStatus: [200] },
  { name: 'tutor page', url: `${BASE_URL}/tutor`, method: 'GET', expectStatus: [200] },
  { name: 'quick-quiz page', url: `${BASE_URL}/quick-quiz`, method: 'GET', expectStatus: [200] },
  { name: 'api ping', url: `${BASE_URL}/api/ping`, method: 'GET', expectStatus: [200] },

  // deterministic API checks that do not require OPENAI_API_KEY
  { name: 'tutor/hint validation', url: `${BASE_URL}/api/tutor/hint`, method: 'POST', body: {}, expectStatus: [400] },
  { name: 'tutor/reflection validation', url: `${BASE_URL}/api/tutor/reflection`, method: 'POST', body: {}, expectStatus: [400] },
  { name: 'tutor/reveal validation', url: `${BASE_URL}/api/tutor/reveal`, method: 'POST', body: {}, expectStatus: [400] },
  { name: 'quick-quiz validation', url: `${BASE_URL}/api/quick-quiz/create`, method: 'POST', body: {}, expectStatus: [400] },
  { name: 'tutor/attempt acceptance', url: `${BASE_URL}/api/tutor/attempt`, method: 'POST', body: { attempt: 'smoke' }, expectStatus: [200] },
];

async function smoke() {
  const results = [];

  for (const check of checks) {
    try {
      const init = { method: check.method, headers: {} };
      if (check.body) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(check.body);
      }

      const response = await fetch(check.url, init);
      const ok = check.expectStatus.includes(response.status);
      const bodyText = ok ? '' : await response.text().catch(() => '');

      results.push({
        check: check.name,
        status: response.status,
        ok,
        error: ok ? '' : `Expected ${check.expectStatus.join('/')} got ${response.status}. ${bodyText.slice(0, 200)}`,
      });
    } catch (error) {
      results.push({
        check: check.name,
        status: 'FETCH_ERR',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.table(results.map(({ check, status, ok }) => ({ check, status, ok })));

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    for (const item of failed) {
      console.error(`✗ ${item.check}: ${item.error}`);
    }
    process.exit(1);
  }

  console.log('✅ Smoke checks passed');
}

smoke();
