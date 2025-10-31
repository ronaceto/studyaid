const checks = [
  // Pages (expect 200 or 404 if private—adjust to your realities)
  { name: "home page", url: "http://localhost:3000/", method: "GET", expectStatus: [200] },
  // Add other public pages you already have:
  // { name: "library", url: "http://localhost:3000/library", method:"GET", expectStatus:[200] },

  // APIs — use *dummy payloads* that won't mutate important data
  { name: "tutor/start", url: "http://localhost:3000/api/tutor/start", method: "POST",
    body: { userId: "smoke-user" }, expectStatus: [200, 201] },

  { name: "tutor/hint", url: "http://localhost:3000/api/tutor/hint", method: "POST",
    body: { sessionId: "smoke-session", topic: "Pythagorean theorem" }, expectStatus: [200, 201] },

  { name: "tutor/attempt", url: "http://localhost:3000/api/tutor/attempt", method: "POST",
    body: { sessionId: "smoke-session", attempt: "My attempt" }, expectStatus: [200, 201] },

  { name: "tutor/reflection", url: "http://localhost:3000/api/tutor/reflection", method: "POST",
    body: { sessionId: "smoke-session" }, expectStatus: [200, 201, 400] }, // allow 400 if no attempt found

  { name: "tutor/reveal", url: "http://localhost:3000/api/tutor/reveal", method: "POST",
    body: { sessionId: "smoke-session", prompt: "Solve x+2=5" }, expectStatus: [200, 201] },

    { name: "quick-quiz/create", url: "http://localhost:3000/api/quick-quiz/create",
    method: "POST", body: { topic: "Lord of the Flies", count: 1 }, expectStatus: [200] },

  // If Quick Quiz endpoints already exist, include them; otherwise comment out:
  // { name: "quick-quiz/create", url: "http://localhost:3000/api/quick-quiz/create", method: "POST",
  //   body: { topic: "Lord of the Flies", count: 1, type: "mc" }, expectStatus: [200,201] },

  { name: "quick-quiz/create", url: "http://localhost:3000/api/quick-quiz/create",
    method: "POST", body: { topic: "Lord of the Flies", count: 1 }, expectStatus: [200] },
];

export default async function smoke() {
  const results = [];
  for (const c of checks) {
    try {
      const init = { method: c.method, headers: {} };
      if (c.body) {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(c.body);
      }
      const res = await fetch(c.url, init);
      const ok = c.expectStatus.includes(res.status);
      let error = null;
      if (!ok) {
        const text = await res.text().catch(() => "");
        error = `Unexpected ${res.status}. Body: ${text?.slice(0, 300)}`;
      }
      results.push({ name: c.name, status: res.status, ok, error });
    } catch (e) {
      results.push({ name: c.name, status: "FETCH_ERR", ok: false, error: e?.message ?? String(e) });
    }
  }
  console.table(results.map(r => ({ check: r.name, status: r.status, ok: r.ok })));
  return results;
}
