import test from "node:test";
import assert from "node:assert/strict";

import { parseGitHubRepository, RepoUrlError } from "../repo-url.js";

test("parses a repository URL", () => {
  assert.deepEqual(parseGitHubRepository("https://github.com/openai/codex"), {
    path: "openai/codex",
    github: "https://github.com/openai/codex",
  });
});

test("parses repository subpages", () => {
  assert.equal(
    parseGitHubRepository("https://github.com/openai/codex/tree/main/docs")
      .path,
    "openai/codex",
  );
});

test("removes a .git suffix", () => {
  assert.equal(
    parseGitHubRepository("https://www.github.com/openai/codex.git").path,
    "openai/codex",
  );
});

test("rejects non-GitHub URLs", () => {
  assert.throws(
    () => parseGitHubRepository("https://example.com/openai/codex"),
    (error) => error instanceof RepoUrlError && error.code === "notGithub",
  );
});

test("rejects profile URLs", () => {
  assert.throws(
    () => parseGitHubRepository("https://github.com/openai"),
    (error) => error instanceof RepoUrlError && error.code === "openRepo",
  );
});

test("rejects reserved GitHub routes", () => {
  for (const url of [
    "https://github.com/features/copilot",
    "https://github.com/orgs/openai",
    "https://github.com/settings/profile",
  ]) {
    assert.throws(
      () => parseGitHubRepository(url),
      (error) => error instanceof RepoUrlError && error.code === "badRepo",
    );
  }
});

test("rejects malformed repository paths", () => {
  for (const url of [
    "not a URL",
    "https://github.com/-invalid/repo",
    "https://github.com/openai/%3Cscript%3E",
  ]) {
    assert.throws(() => parseGitHubRepository(url), RepoUrlError);
  }
});
