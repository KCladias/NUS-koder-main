// Data og state
let nusData = [];
let codeIndex = new Map();
let childrenIndex = new Map();
let searchIndex = [];

let state = {
    mode: 'intro',
    searchQuery: '',
    selectedPath: [],
    selectedCode: null,
    showAllResults: false,
    copied: false
};

// Søkealiaser
const searchAliases = {
    "it": ["informasjonsteknologi", "datateknologi", "informatikk", "data"],
    "ai": ["kunstig intelligens", "maskinlæring", "artificial intelligence"],
    "ml": ["maskinlæring", "kunstig intelligens", "machine learning"],
    "ikt": ["informasjonsteknologi", "datateknologi"],
    "data": ["datateknologi", "informatikk", "dataingeniør", "data science"],
    "økonomi": ["bedriftsøkonomi", "økonomi og administrasjon", "finans", "økonomisk"],
    "helse": ["sykepleie", "medisin", "pleie", "helsefag"],
    "bachelor": ["bachelorgrad", "treårig", "lavere nivå"],
    "master": ["mastergrad", "toårig", "høyere nivå"],
    "sykepleier": ["sykepleie", "sykepleiefag"],
    "lege": ["medisin", "medisinske"],
    "lærer": ["lærerutdanning", "grunnskolelærer", "pedagogikk"],
    "ingeniør": ["ingeniørutdanning", "sivilingeniør", "dataingeniør"],
    "jus": ["juridiske", "rettsvitenskapelige", "juss"],
    "psykologi": ["psykologiske", "psykolog"],
    "phd": ["ph.d", "forskerutdanning", "doktorgrad"],
    "vgs": ["videregående"],
};

const levelLabels = {
    1: "Utdanningsnivå",
    2: "Fagfelt",
    3: "Faggruppe",
    4: "Utdanningsgruppe",
    5: "Utdanning"
};

// Ikoner (SVG) — aria-hidden på alle (WCAG 1.1.1)
const icons = {
    graduationCap: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    search: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    layers: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
    chevronRight: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    arrowLeft: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
    x: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    copy: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    checkCircle: `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
};

// Hjelpefunksjoner
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[æ]/g, 'ae')
        .replace(/[ø]/g, 'o')
        .replace(/[å]/g, 'a');
}

// Kunngjør til skjermlesere (WCAG 4.1.3)
function announce(message) {
    const el = document.getElementById('status-announcer');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = message; }, 50);
}

// Oppdater sidetittel dynamisk (WCAG 2.4.2)
function updateTitle(pageTitle) {
    document.title = pageTitle ? `${pageTitle} – NUS-kode Velger` : 'NUS-kode Velger';
}

// Flytt fokus til overskrift etter sideskifte (WCAG 2.4.3)
function focusHeading() {
    setTimeout(() => {
        const heading = document.querySelector('#app h1, #app h2');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
        }
    }, 50);
}

function buildIndices() {
    codeIndex = new Map(nusData.map(item => [item.code, item]));
    childrenIndex = new Map();
    nusData.forEach(item => {
        const parent = item.parentCode || '__root__';
        if (!childrenIndex.has(parent)) childrenIndex.set(parent, []);
        childrenIndex.get(parent).push(item);
    });
    searchIndex = nusData.map(item => ({
        ...item,
        searchText: normalizeText(item.name),
        normalizedName: item.name.toLowerCase()
    }));
}

function getChildren(parentCode) {
    return childrenIndex.get(parentCode || '__root__') || [];
}

function buildPath(code) {
    const path = [];
    let current = codeIndex.get(code);
    while (current) {
        path.push(current);
        current = codeIndex.get(current.parentCode);
    }
    return path.reverse();
}

function search(query) {
    if (!query.trim() || query.length < 2) return [];
    const cleanedQuery = query.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
    const normalizedQuery = normalizeText(cleanedQuery);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

    const expandedWordsPerQuery = queryWords.map(word => {
        const expanded = new Set([word]);
        const aliasTerms = searchAliases[word];
        if (aliasTerms) aliasTerms.forEach(t => expanded.add(normalizeText(t)));
        return Array.from(expanded);
    });

    const wordBoundaryRegexes = queryWords.map(word =>
        new RegExp(`(^|[^a-z])${word}([^a-z]|$)`)
    );

    const scored = searchIndex
        .map(item => {
            let score = 0;
            const searchText = item.searchText;
            const normalizedName = item.normalizedName;

            if (item.code === cleanedQuery) score += 1000;
            if (item.code.startsWith(cleanedQuery.replace(/\s+/g, ''))) score += 500;

            const allWordsMatch = expandedWordsPerQuery.every(expandedTerms =>
                expandedTerms.some(term => searchText.includes(term))
            );

            if (!allWordsMatch && score < 500) return { item, score: 0 };

            if (allWordsMatch) {
                score += 200;
                queryWords.forEach((word, i) => {
                    if (searchText.includes(word)) {
                        score += 100;
                        if (wordBoundaryRegexes[i].test(searchText)) score += 50;
                    }
                });
                expandedWordsPerQuery.forEach((expandedTerms, idx) => {
                    const originalWord = queryWords[idx];
                    expandedTerms.forEach(term => {
                        if (term !== originalWord && searchText.includes(term)) score += 10;
                    });
                });
            }

            if (score > 0 && item.level === 5) score += 100;
            if (normalizedName.includes('uspesifisert')) score -= 50;
            if (normalizedName.includes('utgått')) score -= 100;

            return { item, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.map(({ item }) => item);
}

// Render
function render() {
    const app = document.getElementById('app');
    switch (state.mode) {
        case 'intro':  app.innerHTML = renderIntro();  break;
        case 'search': app.innerHTML = renderSearch(); setupSearchListeners(); setupListNavigation(); break;
        case 'browse': app.innerHTML = renderBrowse(); setupListNavigation(); setupBrowseNavigation(); break;
        case 'result': app.innerHTML = renderResult(); break;
    }
}

function renderIntro() {
    updateTitle('');
    return `
        <div>
            <h1 style="font-size:1.75rem; font-weight:700; margin-bottom:0.375rem;">Finn din NUS-kode</h1>
            <p class="text-muted mb-6">Søk blant ${nusData.length.toLocaleString('nb-NO')} koder fra Norsk standard for utdanningsgruppering</p>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
                <button onclick="goToSearch()" class="option-btn">
                    <span class="option-icon" aria-hidden="true">${icons.search}</span>
                    <span class="option-text">
                        <span class="option-title">Søk etter utdanning</span>
                        <span class="option-desc">Skriv inn utdanningsnavn, forkortelse eller kode</span>
                    </span>
                    <span class="option-arrow" aria-hidden="true">${icons.chevronRight}</span>
                </button>

                <button onclick="goToBrowse()" class="option-btn">
                    <span class="option-icon" aria-hidden="true">${icons.layers}</span>
                    <span class="option-text">
                        <span class="option-title">Bla gjennom kategorier</span>
                        <span class="option-desc">Naviger steg for steg gjennom hierarkiet</span>
                    </span>
                    <span class="option-arrow" aria-hidden="true">${icons.chevronRight}</span>
                </button>
            </div>

            <p class="text-muted text-small" style="margin-top:2rem;">Kilde: SSB – Norsk standard for utdanningsgruppering (NUS2000)</p>
        </div>
    `;
}

function renderSearch() {
    updateTitle('Søk etter utdanning');
    const results = search(state.searchQuery);
    const displayedResults = state.showAllResults ? results : results.slice(0, 10);

    let resultsHtml = '';
    if (state.searchQuery.length >= 2) {
        if (results.length > 0) {
            const countText = results.length === 1
                ? '1 treff'
                : `${results.length} treff${!state.showAllResults && results.length > 10 ? ' (viser 10)' : ''}`;
            resultsHtml = `
                <p class="text-muted text-small mb-3" aria-live="polite" aria-atomic="true">${countText}</p>
                <ul role="list" class="result-list scrollable" aria-label="Søkeresultater">
                    ${displayedResults.map(item => `
                        <li>
                            <button onclick="selectFromSearch('${item.code}')" class="result-item-btn">
                                <span class="level-badge level-${item.level}" aria-hidden="true">${item.level}</span>
                                <span class="item-body">
                                    <span class="item-name">${escapeHtml(item.name)}</span>
                                    <span class="item-meta">
                                        <span class="item-code">${item.code}</span>
                                        <span aria-hidden="true">·</span>
                                        <span>${levelLabels[item.level]}</span>
                                    </span>
                                </span>
                                <span class="item-arrow" aria-hidden="true">${icons.chevronRight}</span>
                            </button>
                        </li>
                    `).join('')}
                    ${!state.showAllResults && results.length > 10 ? `
                        <li>
                            <button onclick="showAllResults()" class="show-all-btn">
                                Vis alle ${results.length} resultater
                            </button>
                        </li>
                    ` : ''}
                </ul>
            `;
        } else {
            resultsHtml = `
                <div class="empty-state" role="status">
                    <p>Ingen resultater for «${escapeHtml(state.searchQuery)}»</p>
                    <p>Prøv et annet søkeord eller bla gjennom kategorier</p>
                </div>
            `;
        }
    } else {
        resultsHtml = `
            <div style="padding:2rem 0;">
                <p class="text-muted text-small mb-3">Prøv å søke på:</p>
                <div class="flex-wrap-gap">
                    ${['sykepleie', 'informatikk', 'økonomi', 'lærer', 'ingeniør', 'master', 'phd'].map(term => `
                        <button onclick="setSearchQuery('${term}')" class="chip">${term}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div>
            <button onclick="reset()" class="btn btn-ghost mb-4">
                ${icons.arrowLeft}
                <span>Tilbake</span>
            </button>

            <h1 style="font-size:1.5rem; font-weight:700; margin-bottom:0.25rem;">Søk etter utdanning</h1>
            <p class="text-muted text-small mb-4" id="search-hint">Skriv minst 2 tegn for å søke</p>

            <div role="search" aria-label="Søk etter NUS-kode" class="mb-4">
                <label for="searchInput" class="sr-only">Søk etter utdanning</label>
                <div class="search-wrap">
                    <span class="search-icon" aria-hidden="true">${icons.search}</span>
                    <input
                        id="searchInput"
                        type="search"
                        value="${escapeHtml(state.searchQuery)}"
                        placeholder="F.eks. sykepleie, informatikk, master..."
                        aria-describedby="search-hint"
                        class="search-input"
                        maxlength="200"
                        autocomplete="off"
                        autocorrect="off"
                        spellcheck="false"
                    />
                    ${state.searchQuery ? `
                        <button onclick="clearSearch()" aria-label="Tøm søkefeltet" class="btn-icon clear-btn">
                            ${icons.x}
                        </button>
                    ` : ''}
                </div>
            </div>

            ${resultsHtml}
        </div>
    `;
}

function renderBrowse() {
    const currentLevel = state.selectedPath.length > 0 ? state.selectedPath[state.selectedPath.length - 1] : null;
    const children = getChildren(currentLevel?.code || '');
    const relevantChildren = children
        .filter(c => c.level > 0)
        .sort((a, b) => a.code.localeCompare(b.code));

    const pageTitle = currentLevel ? currentLevel.name : 'Bla gjennom kategorier';
    updateTitle(pageTitle);

    const headingText = currentLevel
        ? `Velg ${levelLabels[currentLevel.level + 1]?.toLowerCase() || 'utdanning'}`
        : 'Velg utdanningsnivå';

    let breadcrumbHtml = '';
    if (state.selectedPath.length > 0) {
        breadcrumbHtml = `
            <nav aria-label="Brødsmule" class="mb-4">
                <ol class="breadcrumb">
                    ${state.selectedPath.map((item, index) => `
                        <li style="display:flex;align-items:center;gap:0.25rem;">
                            ${index > 0 ? `<span class="breadcrumb-sep" aria-hidden="true">${icons.chevronRight}</span>` : ''}
                            <button
                                onclick="goToPathIndex(${index})"
                                class="breadcrumb-btn"
                                ${index === state.selectedPath.length - 1 ? 'aria-current="page"' : ''}
                            >
                                ${escapeHtml(item.name)}
                            </button>
                        </li>
                    `).join('')}
                </ol>
            </nav>
        `;
    }

    return `
        <div>
            <button onclick="goBack()" class="btn btn-ghost mb-4">
                ${icons.arrowLeft}
                <span>${state.selectedPath.length > 0 ? 'Tilbake' : 'Start på nytt'}</span>
            </button>

            ${breadcrumbHtml}

            <h1 style="font-size:1.5rem; font-weight:700; margin-bottom:0.2rem;">${headingText}</h1>
            ${currentLevel ? `<p class="text-muted text-small mb-4" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(currentLevel.name)}</p>` : '<div class="mb-4"></div>'}

            <ul role="list" class="result-list scrollable" aria-label="${headingText}" style="max-height:65vh;">
                ${relevantChildren.length > 0 ? relevantChildren.map(item => {
                    const itemChildren = getChildren(item.code);
                    const isLeaf = item.level === 5 || itemChildren.length === 0;
                    const ariaLabel = isLeaf
                        ? `${item.name}, kode ${item.code}`
                        : `${item.name}, kode ${item.code}, ${itemChildren.length} underkategorier`;
                    return `
                        <li>
                            <button
                                onclick="selectFromBrowse('${item.code}')"
                                class="result-item-btn"
                                aria-label="${escapeHtml(ariaLabel)}"
                            >
                                <span class="level-badge level-${item.level}" aria-hidden="true">
                                    ${isLeaf ? icons.graduationCap : item.level}
                                </span>
                                <span class="item-body" aria-hidden="true">
                                    <span class="item-name">${escapeHtml(item.name)}</span>
                                    <span class="item-meta">
                                        <span class="item-code">${item.code}</span>
                                        ${!isLeaf ? `<span aria-hidden="true">·</span><span>${itemChildren.length} valg</span>` : ''}
                                    </span>
                                </span>
                                <span class="item-arrow" aria-hidden="true">${icons.chevronRight}</span>
                            </button>
                        </li>
                    `;
                }).join('') : `
                    <li class="empty-state"><p>Ingen underkategorier funnet</p></li>
                `}
            </ul>
        </div>
    `;
}

function renderResult() {
    const item = state.selectedCode;
    if (!item) return '';
    updateTitle(`${item.code} – ${item.name}`);

    return `
        <div>
            <button onclick="reset()" class="btn btn-ghost mb-4">
                ${icons.arrowLeft}
                <span>Nytt søk</span>
            </button>

            <h1 class="sr-only">Resultat: ${escapeHtml(item.name)}</h1>

            <div class="card mb-4">
                <div class="result-code-box">
                    <div>
                        <p class="result-label" id="nus-label">NUS-kode</p>
                        <p class="result-code" aria-labelledby="nus-label">${item.code}</p>
                    </div>
                    <button
                        onclick="copyCode()"
                        aria-label="${state.copied ? 'Kopiert!' : 'Kopier NUS-kode'}"
                        aria-pressed="${state.copied}"
                        class="btn-icon"
                        style="${state.copied ? 'color:var(--success);background:var(--success-light);' : ''}"
                    >
                        ${state.copied ? icons.checkCircle : icons.copy}
                    </button>
                </div>
                <p class="result-name">${escapeHtml(item.name)}</p>
            </div>

            <section aria-labelledby="hierarchy-heading" class="card">
                <p id="hierarchy-heading" class="text-muted text-small mb-3">Hierarki</p>
                <ol class="hierarchy-list" aria-label="Utdanningshierarki">
                    ${state.selectedPath.map((p, idx) => `
                        <li class="hierarchy-item${idx === state.selectedPath.length - 1 ? ' is-selected' : ''}">
                            <span class="h-code">${p.code}</span>
                            <span class="h-sep" aria-hidden="true">│</span>
                            <span>${escapeHtml(p.name)}</span>
                        </li>
                    `).join('')}
                </ol>
            </section>
        </div>
    `;
}

// Event handlers
function goToSearch() {
    state.mode = 'search';
    state.searchQuery = '';
    render();
    setTimeout(() => document.getElementById('searchInput')?.focus(), 50);
}

function goToBrowse() {
    state.mode = 'browse';
    state.selectedPath = [];
    render();
}

function reset() {
    state = { mode: 'intro', searchQuery: '', selectedPath: [], selectedCode: null, showAllResults: false, copied: false };
    render();
    focusHeading();
}

function goBack() {
    if (state.selectedPath.length > 0) {
        state.selectedPath = state.selectedPath.slice(0, -1);
        render();
    } else {
        reset();
    }
}

function goToPathIndex(index) {
    state.selectedPath = state.selectedPath.slice(0, index + 1);
    render();
}

function setSearchQuery(query) {
    state.searchQuery = query;
    state.showAllResults = false;
    render();
    document.getElementById('searchInput')?.focus();
}

function clearSearch() {
    state.searchQuery = '';
    state.showAllResults = false;
    render();
    document.getElementById('searchInput')?.focus();
}

function showAllResults() {
    state.showAllResults = true;
    render();
    setTimeout(() => {
        document.querySelector('.result-list button.result-item-btn')?.focus();
    }, 50);
    announce(`Viser alle ${search(state.searchQuery).length} resultater`);
}

function selectFromSearch(code) {
    const item = codeIndex.get(code);
    if (item) {
        state.selectedCode = item;
        state.selectedPath = buildPath(code);
        state.mode = 'result';
        render();
        announce(`Valgt: ${item.name}, NUS-kode ${item.code}`);
    }
}

function selectFromBrowse(code) {
    const item = codeIndex.get(code);
    if (item) {
        const children = getChildren(code);
        const isLeaf = item.level === 5 || children.length === 0;
        state.selectedPath = [...state.selectedPath, item];
        if (isLeaf) {
            state.selectedCode = item;
            state.mode = 'result';
            announce(`Valgt: ${item.name}, NUS-kode ${item.code}`);
        } else {
            announce(`${item.name}. ${children.length} underkategorier tilgjengelig.`);
        }
        render();
    }
}

async function copyCode() {
    if (state.selectedCode) {
        try {
            await navigator.clipboard.writeText(state.selectedCode.code);
            state.copied = true;
            render();
            announce('Kode kopiert til utklippstavlen');
            setTimeout(() => { state.copied = false; render(); }, 2000);
        } catch (e) {
            announce('Kunne ikke kopiere kode');
            console.error('Kunne ikke kopiere:', e);
        }
    }
}

function setupListNavigation() {
    // Lytteren lever på #app og delegeres — overlever re-render
}

function setupBrowseNavigation() {
    setTimeout(() => {
        document.querySelector('.result-list button.result-item-btn')?.focus();
    }, 50);
}

function setupSearchListeners() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            document.querySelector('.result-list button.result-item-btn')?.focus();
        }
    });
    input.addEventListener('input', (e) => {
        const selStart = e.target.selectionStart;
        const selEnd = e.target.selectionEnd;
        state.searchQuery = e.target.value;
        state.showAllResults = false;
        render();
        const newInput = document.getElementById('searchInput');
        if (newInput) {
            newInput.focus();
            newInput.setSelectionRange(selStart, selEnd);
        }
        clearTimeout(setupSearchListeners._timer);
        setupSearchListeners._timer = setTimeout(() => {
            if (state.searchQuery.length >= 2) {
                const results = search(state.searchQuery);
                announce(results.length === 0
                    ? `Ingen resultater for ${state.searchQuery}`
                    : `${results.length} treff`
                );
            }
        }, 600);
    });
}

function initKeyboardNavigation() {
    document.getElementById('app').addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        const list = document.querySelector('.result-list');
        if (!list) return;
        const buttons = Array.from(list.querySelectorAll('button.result-item-btn'));
        if (!buttons.length) return;
        const idx = buttons.indexOf(document.activeElement);
        if (idx === -1) return; // fokus er ikke i listen
        e.preventDefault();
        if (e.key === 'ArrowDown') {
            buttons[idx + 1]?.focus();
        } else {
            buttons[idx - 1]?.focus();
        }
    });
}

// ── Hent NUS-data fra SSB KLASS API (klassifikasjon 36) ──
// Transformer KLASS API-respons til appens interne format
function transformKlassData(klassCodes) {
    return klassCodes.map(item => ({
        code: item.code,
        parentCode: item.parentCode || '',
        level: item.level,
        name: item.name
    }));
}

async function fetchFromSSB() {
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = `https://data.ssb.no/api/klass/v1/classifications/36/codes.json?from=${today}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`SSB API svarte med status ${response.status}`);
    }
    const json = await response.json();
    if (!json.codes || !Array.isArray(json.codes)) {
        throw new Error('Uventet dataformat fra SSB API');
    }
    return transformKlassData(json.codes);
}

async function fetchFromStaticFile() {
    const response = await fetch('./data/nus-data.json');
    if (!response.ok) {
        throw new Error(`Kunne ikke laste lokal fil (status ${response.status})`);
    }
    return await response.json();
}

async function init() {
    try {
        // Forsøk å hente levende data fra SSB KLASS API
        nusData = await fetchFromSSB();
        console.info('NUS-data hentet fra SSB KLASS API');
    } catch (apiError) {
        console.warn('Kunne ikke hente fra SSB API, faller tilbake til lokal fil:', apiError.message);
        try {
            // Fallback til statisk JSON-fil
            nusData = await fetchFromStaticFile();
            console.info('NUS-data hentet fra lokal fil (fallback)');
        } catch (fileError) {
            document.getElementById('app').innerHTML = `
                <div role="alert" style="text-align:center;padding:3rem 1rem;color:var(--error);">
                    <p style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">Kunne ikke laste data</p>
                    <p class="text-small">${escapeHtml(fileError.message)}</p>
                </div>
            `;
            return;
        }
    }
    buildIndices();
    initKeyboardNavigation();
    render();
}

init();