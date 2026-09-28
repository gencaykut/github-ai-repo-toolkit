export const SERVICES = Object.freeze([
  { key: "gitingest", name: "GitIngest", baseUrl: "https://gitingest.com" },
  { key: "gitdiagram", name: "GitDiagram", baseUrl: "https://gitdiagram.com" },
  { key: "uithub", name: "uithub", baseUrl: "https://uithub.com" },
  { key: "deepwiki", name: "DeepWiki", baseUrl: "https://deepwiki.com" },
  { key: "gitmcp", name: "GitMCP", baseUrl: "https://gitmcp.io" },
]);

export function buildServiceLinks(repositoryPath) {
  const encodedPath = repositoryPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return SERVICES.map((service) => ({
    ...service,
    url: `${service.baseUrl}/${encodedPath}`,
  }));
}
