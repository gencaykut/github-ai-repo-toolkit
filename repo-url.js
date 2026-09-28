const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

// GitHub-owned top-level routes that can otherwise look like owner/repository paths.
const RESERVED_ROUTES = new Set([
  "about",
  "account",
  "apps",
  "collections",
  "contact",
  "customer-stories",
  "enterprise",
  "events",
  "explore",
  "features",
  "issues",
  "login",
  "marketplace",
  "new",
  "notifications",
  "orgs",
  "organizations",
  "pricing",
  "pulls",
  "search",
  "security",
  "settings",
  "signup",
  "site",
  "sponsors",
  "topics",
  "trending",
  "users",
]);

const OWNER_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const REPOSITORY_PATTERN = /^[a-z\d._-]{1,100}$/i;

export class RepoUrlError extends Error {
  constructor(code) {
    super(code);
    this.name = "RepoUrlError";
    this.code = code;
  }
}

export function parseGitHubRepository(rawUrl) {
  let url;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new RepoUrlError("badRepo");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    !GITHUB_HOSTS.has(url.hostname.toLowerCase())
  ) {
    throw new RepoUrlError("notGithub");
  }

  let segments;
  try {
    segments = url.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    throw new RepoUrlError("badRepo");
  }

  if (segments.length < 2) {
    throw new RepoUrlError("openRepo");
  }

  const owner = segments[0];
  const repository = segments[1].replace(/\.git$/i, "");

  if (
    RESERVED_ROUTES.has(owner.toLowerCase()) ||
    !OWNER_PATTERN.test(owner) ||
    !REPOSITORY_PATTERN.test(repository)
  ) {
    throw new RepoUrlError("badRepo");
  }

  const path = `${owner}/${repository}`;

  return {
    path,
    github: `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
  };
}
