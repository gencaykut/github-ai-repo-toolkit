import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { JSDOM } from "jsdom";

const flushTasks = () => new Promise((resolve) => setTimeout(resolve, 0));

test("popup initializes, localizes, copies, and reports clipboard errors", async () => {
  const html = await readFile(
    new URL("../popup.html", import.meta.url),
    "utf8",
  );
  const dom = new JSDOM(html, { url: "https://extension.test" });
  const clipboardWrites = [];
  const createdTabs = [];
  const storageWrites = [];
  const storageData = { preferredLanguage: "en" };
  let rejectClipboard = false;

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText(value) {
        if (rejectClipboard) throw new Error("Clipboard unavailable");
        clipboardWrites.push(value);
      },
    },
  });
  globalThis.chrome = {
    storage: {
      local: {
        async get(key) {
          return { [key]: storageData[key] };
        },
        async set(value) {
          storageWrites.push(value);
          Object.assign(storageData, value);
        },
      },
    },
    tabs: {
      async query() {
        return [{ url: "https://github.com/openai/codex/tree/main" }];
      },
      create(value) {
        createdTabs.push(value);
      },
    },
  };

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await import(`../popup.js?test=${Date.now()}`);
    await flushTasks();

    assert.equal(document.documentElement.lang, "en");
    assert.equal(
      document.querySelector("#repoName").textContent,
      "openai/codex",
    );
    assert.equal(document.querySelectorAll(".service").length, 5);
    assert.match(
      document.querySelector("#privacyNotice").textContent,
      /publicly/,
    );
    assert.equal(
      document.querySelector("#status").getAttribute("aria-live"),
      "polite",
    );

    document.querySelector("#copyAll").click();
    await flushTasks();
    assert.equal(clipboardWrites.at(-1).split("\n").length, 5);
    assert.deepEqual(storageData.repositoryHistory, [
      "https://github.com/openai/codex",
    ]);

    document.querySelector("#historyBtn").click();
    await flushTasks();
    assert.equal(
      document.querySelector("#historyBtn").getAttribute("aria-expanded"),
      "true",
    );
    assert.equal(document.querySelectorAll(".history-item").length, 1);
    assert.equal(
      document.querySelector(".history-url").textContent,
      "https://github.com/openai/codex",
    );

    document.querySelector(".history-item .small-btn").click();
    await flushTasks();
    assert.equal(clipboardWrites.at(-1), "https://github.com/openai/codex");

    document.querySelector("#copyPrompt").click();
    await flushTasks();
    assert.match(clipboardWrites.at(-1), /GitIngest: https:\/\/gitingest\.com/);
    assert.match(clipboardWrites.at(-1), /GitMCP: https:\/\/gitmcp\.io/);

    document.querySelector("#clearHistory").click();
    await flushTasks();
    assert.deepEqual(storageData.repositoryHistory, []);
    assert.equal(document.querySelectorAll(".history-item").length, 0);

    document.querySelector(".service .small-btn:last-child").click();
    assert.deepEqual(createdTabs.at(-1), {
      url: "https://gitingest.com/openai/codex",
    });

    document.querySelector("#languageBtn").click();
    assert.equal(document.querySelectorAll(".lang-option").length, 5);
    document.querySelector(".lang-option").click();
    await flushTasks();
    assert.deepEqual(storageWrites.at(-1), { preferredLanguage: "tr" });
    assert.equal(document.documentElement.lang, "tr");

    rejectClipboard = true;
    document.querySelector(".service .small-btn").click();
    await flushTasks();
    assert.equal(document.querySelector("#status").className, "status error");
    assert.equal(
      document.querySelector("#status").textContent,
      "Panoya yazılamadı.",
    );
  } finally {
    console.error = originalConsoleError;
    dom.window.close();
    delete globalThis.chrome;
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.navigator;
  }
});
