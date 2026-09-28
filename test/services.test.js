import test from "node:test";
import assert from "node:assert/strict";

import { buildServiceLinks, SERVICES } from "../services.js";

test("builds one URL for every configured service", () => {
  const links = buildServiceLinks("openai/codex");

  assert.equal(links.length, SERVICES.length);
  assert.deepEqual(
    links.map(({ url }) => url),
    [
      "https://gitingest.com/openai/codex",
      "https://gitdiagram.com/openai/codex",
      "https://uithub.com/openai/codex",
      "https://deepwiki.com/openai/codex",
      "https://gitmcp.io/openai/codex",
    ],
  );
});
