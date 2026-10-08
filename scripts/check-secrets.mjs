import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function git(...args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error("No se pudo inspeccionar el repositorio.");
    process.exit(1);
  }
  return result.stdout;
}

const privateFile = /(?:^|\/)(?:\.env(?:\..*)?|id_(?:rsa|ed25519|ecdsa)[^/]*|credentials(?:[^/]*\.json)?|service[-_]?account[^/]*\.json)$|\.(?:pem|key|p12|pfx|keystore)$/i;
const blocked = git("ls-files", "-z").split("\0").filter(file => file && privateFile.test(file));
if (blocked.length) {
  console.error("Archivos privados versionados: quitarlos del índice antes de subir:");
  for (const file of blocked) console.error(`- ${file}`);
  process.exit(1);
}
if (process.argv.includes("--files-only")) process.exit(0);

const localBinary = resolve(git("rev-parse", "--git-common-dir").trim(), "tools", "gitleaks");
const binary = process.env.GITLEAKS_BIN || (existsSync(localBinary) ? localBinary : "gitleaks");
for (const args of [
  ["git", "--log-opts=--all", "--redact=100", "--no-banner"],
  ["git", "--pre-commit", "--staged", "--redact=100", "--no-banner"],
]) {
  const result = spawnSync(binary, args, { stdio: "inherit" });
  if (result.error) {
    console.error("Gitleaks no está disponible. Instalá Gitleaks 8.30.1 o indicá GITLEAKS_BIN. Ver README.");
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}
