import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manifest and package versions stay aligned", async () => {
  const [manifestText, packageText] = await Promise.all([
    readFile(new URL("../manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  const packageJson = JSON.parse(packageText);

  assert.equal(manifest.version, packageJson.version);
});

test("every declared icon exists", async () => {
  const manifestText = await readFile(
    new URL("../manifest.json", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(manifestText);

  await Promise.all(
    Object.values(manifest.icons).map((path) =>
      readFile(new URL(`../${path}`, import.meta.url)),
    ),
  );
});
