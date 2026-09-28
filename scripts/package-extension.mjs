import { execFile } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const archiveName = `github-ai-repo-toolkit-v${packageJson.version}.zip`;
const archivePath = new URL(archiveName, dist);

const runtimeFiles = [
  "manifest.json",
  "popup.html",
  "popup.css",
  "popup.js",
  "i18n.js",
  "repo-url.js",
  "services.js",
  "LICENSE",
  "assets/icons",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await execFileAsync("zip", ["-r", archivePath.pathname, ...runtimeFiles], {
  cwd: root,
});

console.log(`Created dist/${archiveName}`);
