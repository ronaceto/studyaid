// tools/full-build.mjs
import { spawn } from "node:child_process";

const RUN = (cmd, args, opts={}) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    p.on("close", (code) => code === 0 ? res() : rej(new Error(`${cmd} ${args.join(" ")} exited ${code}`)));
  });

async function waitFor(url, tries=60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { method: "GET" });
      if (r.ok || r.status === 404) return;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server did not become ready: ${url}`);
}

async function smoke(host) {
  const tests = [
    { name: "home",        url: `${host}/` },
    { name: "quick-quiz",  url: `${host}/quick-quiz` },
    // tutor API stubs (POST)
    { name: "tutor/start",      url: `${host}/api/tutor/start`,      method: "POST", body: {} },
    { name: "tutor/hint",       url: `${host}/api/tutor/hint`,       method: "POST", body: { topic: "test topic" } },
    { name: "tutor/attempt",    url: `${host}/api/tutor/attempt`,    method: "POST", body: { attempt: "2+2=5" } },
    { name: "tutor/reflection", url: `${host}/api/tutor/reflection`, method: "POST", body: { attempt: "answer" } },
    { name: "tutor/reveal",     url: `${host}/api/tutor/reveal`,     method: "POST", body: { prompt: "2+2?" } },
    // add Library page if you have it:
    // { name: "library", url: `${host}/library` },
  ];

  for (const t of tests) {
    const init = t.method === "POST"
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t.body ?? {}) }
      : { method: "GET" };
    const r = await fetch(t.url, init);
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      throw new Error(`${t.name}: ${r.status} ${r.statusText}\n${body.slice(0, 200)}`);
    }
    console.log(`✔ ${t.name}`);
  }
}

(async () => {
  // 1) prisma + build (use ; separators on Windows via shell:true)
  await RUN("npx", ["prisma", "generate"]);
  await RUN("npx", ["prisma", "migrate", "deploy"]);
  await RUN("npm", ["run", "build"]);

  // 2) start server
  const server = spawn("npm", ["start"], { shell: true, stdio: "inherit" });

  try {
    // 3) wait and smoke
    await waitFor("http://localhost:3000");
    await smoke("http://localhost:3000");
    console.log("✅ FULL BUILD + SMOKE PASSED");
    process.exitCode = 0;
  } catch (err) {
    console.error("❌ FULL BUILD FAILED");
    console.error(err?.message || err);
    process.exitCode = 1;
  } finally {
    server.kill("SIGINT");
  }
})();
