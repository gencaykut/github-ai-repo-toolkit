import { parseGitHubRepository, RepoUrlError } from "./repo-url.js";
import { buildServiceLinks, SERVICES } from "./services.js";
import { I18N } from "./i18n.js";
import {
  addRepositoryToHistory,
  clearRepositoryHistory,
  getRepositoryHistory,
} from "./history.js";

const $ = (id) => document.getElementById(id);
const languageScreen = $("languageScreen"),
  mainScreen = $("mainScreen"),
  languageList = $("languageList");
const repoNameEl = $("repoName"),
  copyAllBtn = $("copyAll"),
  copyPromptBtn = $("copyPrompt"),
  servicesEl = $("services"),
  statusEl = $("status"),
  historyBtn = $("historyBtn"),
  historyPanel = $("historyPanel"),
  historyList = $("historyList"),
  emptyHistoryEl = $("emptyHistory"),
  clearHistoryBtn = $("clearHistory");

let lang = null,
  repo = null,
  links = [],
  repositoryHistory = [];
const tr = (k) => I18N[lang]?.[k] ?? I18N.en[k] ?? k;
const withServiceCount = (k) =>
  tr(k).replace("{count}", String(SERVICES.length));
function logError(context, error) {
  console.error(`[GitHub AI Repo Toolkit] ${context}`, error);
}
function status(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`.trim();
}
function showLang() {
  mainScreen.classList.add("hidden");
  languageScreen.classList.remove("hidden");
  renderLanguages();
}
function showMain() {
  languageScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
}
function applyText() {
  const L = I18N[lang];
  document.documentElement.lang = lang;
  $("languageHeading").textContent = L.choose;
  $("languageText").textContent = L.chooseSub;
  $("appTitle").textContent = L.title;
  $("appSubtitle").textContent = L.sub;
  $("repoLabel").textContent = L.repo;
  $("privacyNotice").textContent = L.privacy;
  servicesEl.setAttribute("aria-label", L.services);
  $("languageBtn").title = L.language;
  $("languageBtn").setAttribute("aria-label", L.language);
  historyBtn.title = L.history;
  historyBtn.setAttribute("aria-label", L.history);
  $("historyTitle").textContent = L.history;
  clearHistoryBtn.textContent = L.clearHistory;
  emptyHistoryEl.textContent = L.emptyHistory;
  $("serviceCount").textContent = `${SERVICES.length}×`;
  copyAllBtn.textContent = withServiceCount("copyAll");
  copyPromptBtn.textContent = L.copyPrompt;
  renderHistory();
}
function renderLanguages() {
  languageList.replaceChildren();
  Object.entries(I18N).forEach(([code, L]) => {
    const b = document.createElement("button");
    const name = document.createElement("strong");
    const hint = document.createElement("span");
    b.className = "lang-option" + (code === lang ? " active" : "");
    b.type = "button";
    b.setAttribute("aria-pressed", String(code === lang));
    name.textContent = L.native;
    hint.textContent = L.hint;
    b.append(name, hint);
    b.onclick = async () => {
      lang = code;
      await chrome.storage.local.set({ preferredLanguage: code });
      applyText();
      showMain();
      await initRepo();
    };
    languageList.appendChild(b);
  });
}
function renderServices() {
  servicesEl.replaceChildren();
  links.forEach((s) => {
    const row = document.createElement("div");
    row.className = "service";
    const info = document.createElement("div");
    info.className = "service-info";
    const name = document.createElement("span");
    name.className = "service-name";
    name.textContent = s.name;
    const url = document.createElement("span");
    url.className = "service-url";
    url.title = s.url;
    url.textContent = s.url;
    info.append(name, url);
    const c = document.createElement("button");
    c.className = "small-btn";
    c.type = "button";
    c.textContent = tr("copy");
    c.onclick = async () => {
      try {
        await navigator.clipboard.writeText(s.url);
        const saved = await rememberCurrentRepository();
        status(
          saved
            ? tr("serviceDone").replace("{service}", s.name)
            : tr("historyErr"),
          saved ? "ok" : "error",
        );
      } catch (error) {
        logError(`Could not copy ${s.key} URL`, error);
        status(tr("clipErr"), "error");
      }
    };
    const o = document.createElement("button");
    o.className = "small-btn";
    o.type = "button";
    o.textContent = tr("open");
    o.onclick = () => chrome.tabs.create({ url: s.url });
    row.append(info, c, o);
    servicesEl.appendChild(row);
  });
  servicesEl.classList.remove("hidden");
}
function renderHistory() {
  historyList.replaceChildren();
  emptyHistoryEl.classList.toggle("hidden", repositoryHistory.length > 0);
  clearHistoryBtn.disabled = repositoryHistory.length === 0;

  repositoryHistory.forEach((githubUrl) => {
    const item = document.createElement("li");
    item.className = "history-item";

    const url = document.createElement("span");
    url.className = "history-url";
    url.title = githubUrl;
    url.textContent = githubUrl;

    const copy = document.createElement("button");
    copy.className = "small-btn";
    copy.type = "button";
    copy.textContent = tr("copy");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(githubUrl);
        const saved = await rememberRepository(githubUrl);
        status(
          saved ? tr("githubCopied") : tr("historyErr"),
          saved ? "ok" : "error",
        );
      } catch (error) {
        logError("Could not copy a repository from history", error);
        status(tr("clipErr"), "error");
      }
    };

    const open = document.createElement("button");
    open.className = "small-btn";
    open.type = "button";
    open.textContent = tr("open");
    open.onclick = () => chrome.tabs.create({ url: githubUrl });

    item.append(url, copy, open);
    historyList.appendChild(item);
  });
}
async function refreshHistory() {
  try {
    repositoryHistory = await getRepositoryHistory(chrome.storage.local);
    renderHistory();
  } catch (error) {
    logError("Could not load repository history", error);
    repositoryHistory = [];
    renderHistory();
  }
}
async function rememberCurrentRepository() {
  if (!repo) return false;
  return rememberRepository(repo.github);
}
async function rememberRepository(githubUrl) {
  try {
    repositoryHistory = await addRepositoryToHistory(
      chrome.storage.local,
      githubUrl,
    );
    renderHistory();
    return true;
  } catch (error) {
    logError("Could not update repository history", error);
    return false;
  }
}
async function initRepo() {
  repoNameEl.textContent = tr("detect");
  copyAllBtn.disabled = true;
  copyPromptBtn.disabled = true;
  servicesEl.classList.add("hidden");
  status("");
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.url) throw Error(tr("noUrl"));
    repo = parseGitHubRepository(tab.url);
    links = buildServiceLinks(repo.path);
    repoNameEl.textContent = repo.path;
    copyAllBtn.disabled = false;
    copyPromptBtn.disabled = false;
    renderServices();
    status(tr("ready"));
  } catch (e) {
    logError("Could not initialize the active repository", e);
    repo = null;
    links = [];
    repoNameEl.textContent = tr("notFound");
    status(
      e instanceof RepoUrlError ? tr(e.code) : e.message || tr("badRepo"),
      "error",
    );
  }
}
copyAllBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(links.map((x) => x.url).join("\n"));
    const saved = await rememberCurrentRepository();
    copyAllBtn.textContent = withServiceCount("allDoneBtn");
    status(saved ? tr("allDone") : tr("historyErr"), saved ? "ok" : "error");
    setTimeout(
      () => (copyAllBtn.textContent = withServiceCount("copyAll")),
      1500,
    );
  } catch (error) {
    logError("Could not copy all service URLs", error);
    status(tr("clipErr"), "error");
  }
};
copyPromptBtn.onclick = async () => {
  if (!repo) return;
  const sources = links.map(({ name, url }) => `${name}: ${url}`).join("\n");
  try {
    await navigator.clipboard.writeText(
      I18N[lang].prompt({ repo: repo.path, github: repo.github, sources }),
    );
    const saved = await rememberCurrentRepository();
    copyPromptBtn.textContent = tr("promptDoneBtn");
    status(saved ? tr("promptDone") : tr("historyErr"), saved ? "ok" : "error");
    setTimeout(() => (copyPromptBtn.textContent = tr("copyPrompt")), 1500);
  } catch (error) {
    logError("Could not copy the analysis prompt", error);
    status(tr("clipErr"), "error");
  }
};
$("languageBtn").onclick = showLang;
historyBtn.onclick = async () => {
  const willOpen = historyPanel.classList.contains("hidden");
  historyPanel.classList.toggle("hidden", !willOpen);
  historyBtn.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) await refreshHistory();
};
clearHistoryBtn.onclick = async () => {
  try {
    repositoryHistory = await clearRepositoryHistory(chrome.storage.local);
    renderHistory();
    status(tr("historyCleared"), "ok");
  } catch (error) {
    logError("Could not clear repository history", error);
    status(tr("historyErr"), "error");
  }
};
(async () => {
  const saved = await chrome.storage.local.get("preferredLanguage");
  lang = I18N[saved.preferredLanguage] ? saved.preferredLanguage : "en";
  await refreshHistory();
  applyText();
  if (!saved.preferredLanguage) {
    showLang();
  } else {
    showMain();
    await initRepo();
  }
})();
