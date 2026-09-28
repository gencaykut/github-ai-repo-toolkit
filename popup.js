import { parseGitHubRepository, RepoUrlError } from "./repo-url.js";
import { buildServiceLinks, SERVICES } from "./services.js";

const $ = (id) => document.getElementById(id);
const languageScreen = $("languageScreen"),
  mainScreen = $("mainScreen"),
  languageList = $("languageList");
const repoNameEl = $("repoName"),
  copyAllBtn = $("copyAll"),
  copyPromptBtn = $("copyPrompt"),
  servicesEl = $("services"),
  statusEl = $("status");

const I18N = {
  tr: {
    native: "Türkçe",
    hint: "Turkish",
    choose: "Dilini seç",
    chooseSub:
      "Arayüz ve oluşturulan AI analiz promptu seçtiğin dili kullanacak.",
    title: "AI Repo Toolkit",
    sub: "Repo bağlantıları + hazır analiz promptu",
    repo: "Repo",
    detect: "GitHub reposu aranıyor…",
    copyAll: "5 bağlantıyı kopyala",
    copyPrompt: "AI analiz promptunu kopyala",
    copy: "Kopyala",
    open: "Aç",
    ready: "Hazır.",
    notGithub: "Bu sekme GitHub üzerinde değil.",
    openRepo: "Bir GitHub repo sayfası açmalısın.",
    badRepo: "Geçerli bir GitHub repo adresi bulunamadı.",
    noUrl: "Aktif sekmenin adresi okunamadı.",
    notFound: "GitHub reposu bulunamadı",
    allDone: "Tüm bağlantılar panoya kopyalandı.",
    allDoneBtn: "5 bağlantı kopyalandı ✓",
    promptDone: "Hazır AI analiz promptu panoya kopyalandı.",
    promptDoneBtn: "Prompt kopyalandı ✓",
    serviceDone: "{service} bağlantısı kopyalandı.",
    clipErr: "Panoya yazılamadı.",
    language: "Dil",
    prompt: ({ repo, github, map }) =>
      `Aşağıdaki GitHub reposunu teknik olarak analiz et.\n\nRepo: ${repo}\nGitHub: ${github}\n\nKaynaklar:\nGitIngest: ${map.gitingest}\nGitDiagram: ${map.gitdiagram}\nuithub: ${map.uithub}\nDeepWiki: ${map.deepwiki}\nGitMCP: ${map.gitmcp}\n\nBu kaynakları birlikte kullan ve mümkün olduğunda birbirleriyle çapraz doğrula.\n\nÖncelikle:\n1. Projenin ne yaptığını kısa ve net şekilde açıkla.\n2. Genel mimariyi çıkar.\n3. Ana giriş noktalarını ve kritik dosyaları belirle.\n4. Modüllerin birbirleriyle nasıl haberleştiğini açıkla.\n5. Veri/istek akışını baştan sona takip et.\n6. AI, agent, tool, MCP veya otomasyon yapıları varsa özellikle incele.\n7. Önemli fonksiyonları, sınıfları ve servisleri belirt.\n8. Bir özelliği değiştirmek istersem hangi dosyalara dokunmam gerektiğini göster.\n9. Kod ile dokümantasyon arasında çelişki varsa kodu esas al ve çelişkiyi belirt.\n10. Aynı bilgiyi birden fazla kaynak veriyorsa doğruluğunu karşılaştır.\n11. Erişemediğin bir kaynak varsa açıkça söyle; erişmediğin içeriği görmüş gibi davranma.\n12. Emin olmadığın noktaları varsayım olarak açıkça işaretle.\n\nSonunda şu başlıklarla özet ver:\n- Projenin amacı\n- Mimari\n- Kritik dosyalar\n- Çalışma akışı\n- Önemli bağımlılıklar\n- AI / Agent / Tool yapısı\n- Değişiklik yapılacak noktalar\n- Riskler ve dikkat edilmesi gerekenler`,
  },

  en: {
    native: "English",
    hint: "English",
    choose: "Choose your language",
    chooseSub:
      "The interface and generated AI analysis prompt will use the selected language.",
    title: "AI Repo Toolkit",
    sub: "Repo links + ready analysis prompt",
    repo: "Repo",
    detect: "Detecting GitHub repository…",
    copyAll: "Copy 5 links",
    copyPrompt: "Copy AI analysis prompt",
    copy: "Copy",
    open: "Open",
    ready: "Ready.",
    notGithub: "This tab is not on GitHub.",
    openRepo: "Open a GitHub repository page.",
    badRepo: "No valid GitHub repository URL was found.",
    noUrl: "Could not read the active tab URL.",
    notFound: "GitHub repository not found",
    allDone: "All links copied to clipboard.",
    allDoneBtn: "5 links copied ✓",
    promptDone: "AI analysis prompt copied to clipboard.",
    promptDoneBtn: "Prompt copied ✓",
    serviceDone: "{service} link copied.",
    clipErr: "Could not write to clipboard.",
    language: "Language",
    prompt: ({ repo, github, map }) =>
      `Technically analyze the GitHub repository below.\n\nRepo: ${repo}\nGitHub: ${github}\n\nSources:\nGitIngest: ${map.gitingest}\nGitDiagram: ${map.gitdiagram}\nuithub: ${map.uithub}\nDeepWiki: ${map.deepwiki}\nGitMCP: ${map.gitmcp}\n\nUse these sources together and cross-check them whenever possible.\n\nFirst:\n1. Explain briefly and clearly what the project does.\n2. Extract the overall architecture.\n3. Identify the main entry points and critical files.\n4. Explain how modules communicate with each other.\n5. Trace the data/request flow end to end.\n6. Pay special attention to AI, agent, tool, MCP, or automation structures.\n7. Identify important functions, classes, and services.\n8. Show which files should be modified for a feature change.\n9. If code and documentation conflict, prioritize the code and mention the discrepancy.\n10. Compare claims that appear in multiple sources.\n11. Clearly state when a source is inaccessible; never pretend to have read inaccessible content.\n12. Mark uncertain conclusions explicitly as assumptions.\n\nFinish with these headings:\n- Project purpose\n- Architecture\n- Critical files\n- Execution flow\n- Important dependencies\n- AI / Agent / Tool structure\n- Modification points\n- Risks and cautions`,
  },

  de: {
    native: "Deutsch",
    hint: "German",
    choose: "Sprache auswählen",
    chooseSub:
      "Oberfläche und KI-Analyse-Prompt verwenden die gewählte Sprache.",
    title: "AI Repo Toolkit",
    sub: "Repo-Links + fertiger Analyse-Prompt",
    repo: "Repository",
    detect: "GitHub-Repository wird erkannt…",
    copyAll: "5 Links kopieren",
    copyPrompt: "KI-Analyse-Prompt kopieren",
    copy: "Kopieren",
    open: "Öffnen",
    ready: "Bereit.",
    notGithub: "Dieser Tab befindet sich nicht auf GitHub.",
    openRepo: "Öffne eine GitHub-Repository-Seite.",
    badRepo: "Keine gültige GitHub-Repository-URL gefunden.",
    noUrl: "Die URL des aktiven Tabs konnte nicht gelesen werden.",
    notFound: "GitHub-Repository nicht gefunden",
    allDone: "Alle Links wurden kopiert.",
    allDoneBtn: "5 Links kopiert ✓",
    promptDone: "KI-Analyse-Prompt wurde kopiert.",
    promptDoneBtn: "Prompt kopiert ✓",
    serviceDone: "{service}-Link wurde kopiert.",
    clipErr: "Zwischenablage konnte nicht beschrieben werden.",
    language: "Sprache",
    prompt: ({ repo, github, map }) =>
      `Analysiere das folgende GitHub-Repository technisch.\n\nRepo: ${repo}\nGitHub: ${github}\n\nQuellen:\nGitIngest: ${map.gitingest}\nGitDiagram: ${map.gitdiagram}\nuithub: ${map.uithub}\nDeepWiki: ${map.deepwiki}\nGitMCP: ${map.gitmcp}\n\nNutze diese Quellen gemeinsam und gleiche sie nach Möglichkeit miteinander ab.\n\nZuerst:\n1. Erkläre kurz und klar, was das Projekt macht.\n2. Ermittle die Gesamtarchitektur.\n3. Identifiziere die wichtigsten Einstiegspunkte und kritischen Dateien.\n4. Erkläre, wie die Module miteinander kommunizieren.\n5. Verfolge den Daten-/Request-Fluss von Anfang bis Ende.\n6. Untersuche insbesondere AI-, Agent-, Tool-, MCP- und Automatisierungsstrukturen.\n7. Nenne wichtige Funktionen, Klassen und Services.\n8. Zeige, welche Dateien für eine Funktionsänderung angepasst werden müssten.\n9. Bei Widersprüchen zwischen Code und Dokumentation hat der Code Vorrang; nenne den Widerspruch.\n10. Vergleiche Aussagen, die in mehreren Quellen vorkommen.\n11. Sage klar, wenn eine Quelle nicht zugänglich ist; tue niemals so, als hättest du sie gelesen.\n12. Kennzeichne unsichere Punkte ausdrücklich als Annahmen.\n\nFasse am Ende unter diesen Überschriften zusammen:\n- Projektzweck\n- Architektur\n- Kritische Dateien\n- Ablauf\n- Wichtige Abhängigkeiten\n- AI / Agent / Tool-Struktur\n- Änderungsstellen\n- Risiken und Hinweise`,
  },

  es: {
    native: "Español",
    hint: "Spanish",
    choose: "Elige tu idioma",
    chooseSub:
      "La interfaz y el prompt de análisis de IA usarán el idioma seleccionado.",
    title: "AI Repo Toolkit",
    sub: "Enlaces del repo + prompt de análisis listo",
    repo: "Repositorio",
    detect: "Detectando repositorio de GitHub…",
    copyAll: "Copiar 5 enlaces",
    copyPrompt: "Copiar prompt de análisis IA",
    copy: "Copiar",
    open: "Abrir",
    ready: "Listo.",
    notGithub: "Esta pestaña no está en GitHub.",
    openRepo: "Abre una página de repositorio de GitHub.",
    badRepo: "No se encontró una URL válida de repositorio de GitHub.",
    noUrl: "No se pudo leer la URL de la pestaña activa.",
    notFound: "Repositorio de GitHub no encontrado",
    allDone: "Todos los enlaces se copiaron.",
    allDoneBtn: "5 enlaces copiados ✓",
    promptDone: "Prompt de análisis IA copiado.",
    promptDoneBtn: "Prompt copiado ✓",
    serviceDone: "Enlace de {service} copiado.",
    clipErr: "No se pudo escribir en el portapapeles.",
    language: "Idioma",
    prompt: ({ repo, github, map }) =>
      `Analiza técnicamente el siguiente repositorio de GitHub.\n\nRepo: ${repo}\nGitHub: ${github}\n\nFuentes:\nGitIngest: ${map.gitingest}\nGitDiagram: ${map.gitdiagram}\nuithub: ${map.uithub}\nDeepWiki: ${map.deepwiki}\nGitMCP: ${map.gitmcp}\n\nUsa estas fuentes conjuntamente y compáralas siempre que sea posible.\n\nPrimero:\n1. Explica brevemente y con claridad qué hace el proyecto.\n2. Extrae la arquitectura general.\n3. Identifica los principales puntos de entrada y archivos críticos.\n4. Explica cómo se comunican los módulos.\n5. Sigue el flujo de datos/solicitudes de extremo a extremo.\n6. Examina especialmente las estructuras de IA, agentes, tools, MCP y automatización.\n7. Identifica funciones, clases y servicios importantes.\n8. Indica qué archivos deberían modificarse para cambiar una funcionalidad.\n9. Si el código y la documentación se contradicen, prioriza el código e indica la discrepancia.\n10. Compara la información que aparezca en varias fuentes.\n11. Indica claramente si no puedes acceder a una fuente; no finjas haberla leído.\n12. Marca explícitamente como suposiciones los puntos inciertos.\n\nTermina con estos encabezados:\n- Objetivo del proyecto\n- Arquitectura\n- Archivos críticos\n- Flujo de ejecución\n- Dependencias importantes\n- Estructura AI / Agent / Tool\n- Puntos de modificación\n- Riesgos y precauciones`,
  },

  fr: {
    native: "Français",
    hint: "French",
    choose: "Choisissez votre langue",
    chooseSub:
      "L’interface et le prompt d’analyse IA utiliseront la langue sélectionnée.",
    title: "AI Repo Toolkit",
    sub: "Liens du dépôt + prompt d’analyse prêt",
    repo: "Dépôt",
    detect: "Détection du dépôt GitHub…",
    copyAll: "Copier les 5 liens",
    copyPrompt: "Copier le prompt d’analyse IA",
    copy: "Copier",
    open: "Ouvrir",
    ready: "Prêt.",
    notGithub: "Cet onglet n’est pas sur GitHub.",
    openRepo: "Ouvrez une page de dépôt GitHub.",
    badRepo: "Aucune URL de dépôt GitHub valide trouvée.",
    noUrl: "Impossible de lire l’URL de l’onglet actif.",
    notFound: "Dépôt GitHub introuvable",
    allDone: "Tous les liens ont été copiés.",
    allDoneBtn: "5 liens copiés ✓",
    promptDone: "Prompt d’analyse IA copié.",
    promptDoneBtn: "Prompt copié ✓",
    serviceDone: "Lien {service} copié.",
    clipErr: "Impossible d’écrire dans le presse-papiers.",
    language: "Langue",
    prompt: ({ repo, github, map }) =>
      `Analyse techniquement le dépôt GitHub ci-dessous.\n\nRepo : ${repo}\nGitHub : ${github}\n\nSources :\nGitIngest : ${map.gitingest}\nGitDiagram : ${map.gitdiagram}\nuithub : ${map.uithub}\nDeepWiki : ${map.deepwiki}\nGitMCP : ${map.gitmcp}\n\nUtilise ces sources ensemble et recoupe-les autant que possible.\n\nCommence par :\n1. Expliquer brièvement et clairement ce que fait le projet.\n2. Extraire l’architecture générale.\n3. Identifier les principaux points d’entrée et fichiers critiques.\n4. Expliquer comment les modules communiquent entre eux.\n5. Suivre le flux de données/requêtes de bout en bout.\n6. Examiner particulièrement les structures IA, agent, tool, MCP ou d’automatisation.\n7. Identifier les fonctions, classes et services importants.\n8. Montrer quels fichiers modifier pour changer une fonctionnalité.\n9. En cas de conflit entre code et documentation, privilégier le code et signaler l’écart.\n10. Comparer les informations présentes dans plusieurs sources.\n11. Dire clairement lorsqu’une source est inaccessible ; ne jamais prétendre l’avoir lue.\n12. Signaler explicitement les points incertains comme des hypothèses.\n\nTermine avec ces rubriques :\n- Objectif du projet\n- Architecture\n- Fichiers critiques\n- Flux d’exécution\n- Dépendances importantes\n- Structure AI / Agent / Tool\n- Points de modification\n- Risques et précautions`,
  },
};

let lang = null,
  repo = null,
  links = [];
const tr = (k) => I18N[lang]?.[k] ?? I18N.en[k] ?? k;
const withServiceCount = (k) => tr(k).replace("5", String(SERVICES.length));
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
  $("languageBtn").title = L.language;
  $("serviceCount").textContent = `${SERVICES.length}×`;
  copyAllBtn.textContent = withServiceCount("copyAll");
  copyPromptBtn.textContent = L.copyPrompt;
}
function renderLanguages() {
  languageList.replaceChildren();
  Object.entries(I18N).forEach(([code, L]) => {
    const b = document.createElement("button");
    const name = document.createElement("strong");
    const hint = document.createElement("span");
    b.className = "lang-option" + (code === lang ? " active" : "");
    b.type = "button";
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
        status(tr("serviceDone").replace("{service}", s.name), "ok");
      } catch {
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
    copyAllBtn.textContent = withServiceCount("allDoneBtn");
    status(tr("allDone"), "ok");
    setTimeout(
      () => (copyAllBtn.textContent = withServiceCount("copyAll")),
      1500,
    );
  } catch {
    status(tr("clipErr"), "error");
  }
};
copyPromptBtn.onclick = async () => {
  if (!repo) return;
  const map = Object.fromEntries(links.map((x) => [x.key, x.url]));
  try {
    await navigator.clipboard.writeText(
      I18N[lang].prompt({ repo: repo.path, github: repo.github, map }),
    );
    copyPromptBtn.textContent = tr("promptDoneBtn");
    status(tr("promptDone"), "ok");
    setTimeout(() => (copyPromptBtn.textContent = tr("copyPrompt")), 1500);
  } catch {
    status(tr("clipErr"), "error");
  }
};
$("languageBtn").onclick = showLang;
(async () => {
  const saved = await chrome.storage.local.get("preferredLanguage");
  lang = I18N[saved.preferredLanguage] ? saved.preferredLanguage : "en";
  applyText();
  if (!saved.preferredLanguage) {
    showLang();
  } else {
    showMain();
    await initRepo();
  }
})();
