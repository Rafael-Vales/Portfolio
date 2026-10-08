import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/check-secrets.mjs");
const localBinary = resolve(".git/tools/gitleaks");
const binary = process.env.GITLEAKS_BIN || (existsSync(localBinary) ? localBinary : "gitleaks");
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "portfolio-secret-guard-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  function git(...args) {
    const result = spawnSync("git", args, { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Security test");
  git("config", "user.email", "security-test@example.invalid");
  writeFileSync(join(cwd, "README.md"), "Safe public content\n");
  git("add", "README.md"); git("commit", "-qm", "Clean baseline");
  const run = () => spawnSync(process.execPath, [script], {
    cwd, encoding: "utf8", env: { ...process.env, GITLEAKS_BIN: binary },
  });
  return { cwd, git, run };
}
function syntheticToken() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "ghp_" + [...randomBytes(36)].map(byte => alphabet[byte % alphabet.length]).join("");
}

test("permite un repositorio limpio", t => {
  const { run } = fixture(t);
  const result = run(); assert.equal(result.status, 0, result.stderr);
});
for (const name of [".env.local", "credentials-production.json", "id_rsa.backup"]) test(`rechaza ${name} aunque no contenga una clave reconocible`, t => {
  const { cwd, git, run } = fixture(t);
  writeFileSync(join(cwd, name), "LOCAL_SETTING=example\n"); git("add", name);
  const result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /Archivos privados versionados/);
});
test("rechaza una credencial sintética en cambios preparados y no revela su valor", t => {
  const { cwd, git, run } = fixture(t); const token = syntheticToken();
  writeFileSync(join(cwd, "sample.ts"), `const token = "${token}";\n`); git("add", "sample.ts");
  const result = run(); assert.equal(result.status, 1);
  assert.equal((result.stdout + result.stderr).includes(token), false);
});
test("rechaza una credencial del historial aunque el archivo haya sido eliminado", t => {
  const { cwd, git, run } = fixture(t); const token = syntheticToken();
  writeFileSync(join(cwd, "sample.ts"), `const token = "${token}";\n`);
  git("add", "sample.ts"); git("commit", "-qm", "Synthetic test credential");
  git("rm", "-q", "sample.ts"); git("commit", "-qm", "Remove test file");
  const result = run(); assert.equal(result.status, 1);
  assert.equal((result.stdout + result.stderr).includes(token), false);
});

test("revisa también secretos borrados en una rama integrada con merge", t => {
  const { cwd, git, run } = fixture(t); const token = syntheticToken();
  git("checkout", "-qb", "feature");
  writeFileSync(join(cwd, "sample.ts"), `const token = "${token}";\n`);
  git("add", "sample.ts"); git("commit", "-qm", "Synthetic branch credential");
  git("rm", "-q", "sample.ts"); git("commit", "-qm", "Remove branch test file");
  git("checkout", "-q", "main"); git("merge", "--no-ff", "-qm", "Integrate feature", "feature");
  const result = run(); assert.equal(result.status, 1);
  assert.equal((result.stdout + result.stderr).includes(token), false);
});
