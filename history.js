import { parseGitHubRepository } from "./repo-url.js";

export const HISTORY_KEY = "repositoryHistory";
export const MAX_HISTORY_ITEMS = 10;

function normalizeRepositoryUrl(value) {
  if (typeof value !== "string") return null;

  try {
    return parseGitHubRepository(value).github;
  } catch {
    return null;
  }
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeRepositoryUrl).filter(Boolean))].slice(
    0,
    MAX_HISTORY_ITEMS,
  );
}

export async function getRepositoryHistory(storage) {
  const stored = await storage.get(HISTORY_KEY);
  return normalizeHistory(stored[HISTORY_KEY]);
}

export async function addRepositoryToHistory(storage, githubUrl) {
  const normalizedUrl = normalizeRepositoryUrl(githubUrl);
  if (!normalizedUrl) return getRepositoryHistory(storage);

  const current = await getRepositoryHistory(storage);
  const updated = [
    normalizedUrl,
    ...current.filter((item) => item !== normalizedUrl),
  ].slice(0, MAX_HISTORY_ITEMS);

  await storage.set({ [HISTORY_KEY]: updated });
  return updated;
}

export async function clearRepositoryHistory(storage) {
  await storage.set({ [HISTORY_KEY]: [] });
  return [];
}
