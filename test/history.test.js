import test from "node:test";
import assert from "node:assert/strict";

import {
  addRepositoryToHistory,
  clearRepositoryHistory,
  getRepositoryHistory,
  HISTORY_KEY,
  MAX_HISTORY_ITEMS,
} from "../history.js";

function createStorage(initialValue = {}) {
  const data = { ...initialValue };
  return {
    data,
    async get(key) {
      return { [key]: data[key] };
    },
    async set(value) {
      Object.assign(data, value);
    },
  };
}

test("stores only canonical GitHub repository URLs", async () => {
  const storage = createStorage();

  await addRepositoryToHistory(
    storage,
    "https://github.com/openai/codex/tree/main",
  );
  await addRepositoryToHistory(storage, "https://example.com/openai/codex");

  assert.deepEqual(await getRepositoryHistory(storage), [
    "https://github.com/openai/codex",
  ]);
});

test("deduplicates, moves recent repositories first, and limits the list", async () => {
  const storage = createStorage();

  for (let index = 0; index < MAX_HISTORY_ITEMS + 2; index += 1) {
    await addRepositoryToHistory(
      storage,
      `https://github.com/example/repository-${index}`,
    );
  }
  await addRepositoryToHistory(
    storage,
    "https://github.com/example/repository-5",
  );

  const history = await getRepositoryHistory(storage);
  assert.equal(history.length, MAX_HISTORY_ITEMS);
  assert.equal(history[0], "https://github.com/example/repository-5");
  assert.equal(history.at(-1), "https://github.com/example/repository-2");
});

test("filters invalid stored values and clears history", async () => {
  const storage = createStorage({
    [HISTORY_KEY]: [
      "not a URL",
      null,
      "https://github.com/openai/codex",
      "https://github.com/openai/codex/issues",
    ],
  });

  assert.deepEqual(await getRepositoryHistory(storage), [
    "https://github.com/openai/codex",
  ]);
  assert.deepEqual(await clearRepositoryHistory(storage), []);
  assert.deepEqual(await getRepositoryHistory(storage), []);
});
