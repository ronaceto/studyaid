import { spawn } from "child_process";

const run = (cmd, args, opts={}) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
    p.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`)));
  });

(async () => {
  try {
    // 1) Prisma: format/validate/generate
    await run("npm", ["run", "regen"]);

    // 2) TypeScript type-check (fast fail)
    await run("npm", ["run", "typecheck"]);

    // 3) Next.js production build
    await run("npm", ["run", "build"]);

    // 4) Start the prod server in background
    const server = spawn("npm", ["run", "start"], { shell: process.platform === "win32" });
    server.stdout.on("data", d => process.stdout.write(d));
    server.stderr.on("data", d => process.stderr.write(d));

    // 5) Wait until the server is listening
    const waitFor = async (tries = 60) => {
      const delay = (ms) => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < tries; i++) {
        try {
          const res = await fetch("http://localhost:3000");
          if (res.ok || res.status === 404) return;
        } catch {}
        await delay(500);
      }
      throw new Error("Server did not become ready on :3000");
    };
    await waitFor();

    // 6) Smoke-test your important routes/APIs
    const { default: smoke } = await import("./smoke.mjs");
    const summary = await smoke();

    // 7) Stop server
    if (process.platform === "win32") {
      spawn("taskkill", ["/F", "/PID", String(server.pid)], { shell: true });
    } else {
      server.kill("SIGTERM");
    }

    // 8) Evaluate smoke result
    const failed = summary.filter(s => !s.ok);
    if (failed.length) {
      console.error("\nSMOKE FAILURES:");
      for (const f of failed) {
        console.error(`- ${f.name}: ${f.status} ${f.error ?? ""}`);
      }
      process.exit(1);
    } else {
      console.log("\n✅ All smoke checks passed.");
      process.exit(0);
    }
  } catch (err) {
    console.error("\n❌ FULL BUILD FAILED");
    console.error(err?.stack ?? err);
    process.exit(1);
  }
})();
