import test from "node:test";
import assert from "node:assert/strict";

import { I18N } from "../i18n.js";
import { buildServiceLinks } from "../services.js";

test("all locales expose the same translation keys", () => {
  const expectedKeys = Object.keys(I18N.en).sort();

  for (const [language, translations] of Object.entries(I18N)) {
    assert.deepEqual(
      Object.keys(translations).sort(),
      expectedKeys,
      `${language} translation keys differ from English`,
    );
  }
});

test("every localized prompt includes every configured service dynamically", () => {
  const links = buildServiceLinks("openai/codex");
  const sources = links.map(({ name, url }) => `${name}: ${url}`).join("\n");

  for (const [language, translations] of Object.entries(I18N)) {
    const prompt = translations.prompt({
      repo: "openai/codex",
      github: "https://github.com/openai/codex",
      sources,
    });

    for (const { url } of links) {
      assert.match(prompt, new RegExp(url.replaceAll("/", "\\/")), language);
    }
    assert.doesNotMatch(prompt, /undefined/, language);
  }
});
