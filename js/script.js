// ================= VARIÁVEIS GLOBAIS =================
// Chaves para salvar favoritos e contador de acessos no LocalStorage
const favKey = 'projectFavorites';
const accessKey = 'projectAccessCounts';

// Recupera favoritos e contadores salvos (ou inicializa vazio)
let favorites = JSON.parse(localStorage.getItem(favKey) || '[]');
let accessCounts = JSON.parse(localStorage.getItem(accessKey) || '{}');

// Atalhos para seleção de elementos
const $ = s => document.querySelector(s);
const getCards = () => [...document.querySelectorAll('.project-card')];


// ================= LOADER =================
// Oculta a tela de loading após a página carregar
window.addEventListener('load', () =>
  setTimeout(() => $('#globalLoader').classList.add('hidden'), 500)
);


// ================= TEMA (CLARO / ESCURO) =================
(function () {
  const btn = $('#themeToggle');                        // botão do tema
  const stored = localStorage.getItem('theme');         // tema salvo
  const prefersLight = window.matchMedia('(prefers-color-scheme:light)').matches;

  // Aplica o tema salvo ou detectado
  apply(stored || (prefersLight ? 'light' : 'dark'));

  // Alterna ao clicar no botão
  btn.addEventListener('click', () =>
    apply(document.body.classList.contains('light-mode') ? 'dark' : 'light')
  );

  // Função para aplicar tema
  function apply(t) {
    if (t === 'light') {
      document.body.classList.add('light-mode');
      btn.textContent = '🌞';
    } else {
      document.body.classList.remove('light-mode');
      btn.textContent = '🌙';
    }
    localStorage.setItem('theme', t);
  }
})();


// ================= FAVORITOS =================
// Renderiza o estado de favoritos e adiciona os eventos
function renderFavorites() {
  getCards().forEach(card => {
    const id = card.dataset.id;
    const star = card.querySelector('.fav-btn');
    const isFav = favorites.includes(id);

    // Aplica a aparência do favorito
    star.classList.toggle('active', isFav);
    card.classList.toggle('favorited', isFav);

    // Remove evento antigo (evita duplicidade)
    const clone = star.cloneNode(true);
    star.replaceWith(clone);

    // Evento de clique na estrela
    clone.addEventListener('click', e => {
      e.stopPropagation(); // evita abrir modal
      if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
      } else {
        favorites.push(id);
      }
      localStorage.setItem(favKey, JSON.stringify(favorites));
      renderFavorites();     // re-renderiza
      reorderCards();        // move favoritos para o topo
    });
  });
}


// ================= ORDENAR FAVORITOS NO TOPO =================
function reorderCards() {
  const container = document.querySelector('#projetos'); // contêiner dos cards
  const cards = Array.from(container.querySelectorAll('.project-card'));

  // Ordena: favoritos primeiro
  cards.sort((a, b) => {
    const aFav = favorites.includes(a.dataset.id);
    const bFav = favorites.includes(b.dataset.id);
    return (aFav === bFav) ? 0 : aFav ? -1 : 1;
  });

  // Reanexa na nova ordem
  cards.forEach(c => container.appendChild(c));
}


// ================= CONTADOR DE ACESSOS =================
function initCounts() {
  getCards().forEach(card => {
    const id = card.dataset.id;
    const counter = card.querySelector('.access-count');
    const link = card.querySelector('.access-btn');

    // Garante contador inicial
    if (!accessCounts[id]) accessCounts[id] = 0;

    // Incrementa ao clicar no botão de acesso
    link.addEventListener('click', () => {
      accessCounts[id]++;
      localStorage.setItem(accessKey, JSON.stringify(accessCounts));
      counter.textContent = accessCounts[id];
    });

    // Mostra valor atual
    counter.textContent = accessCounts[id];
  });
}


// ================= MODAL DE DETALHES =================
// Elementos do modal
const detailModal = $('#detailModal');
const closeModalBtn = $('#closeModal');
const modalTitle = $('#modalTitle');
const modalImg = $('#modalImg');
const modalDesc = $('#modalDesc');

// Abre o modal com dados do card clicado
function openModal(card) {
  modalTitle.textContent = card.querySelector('h3').textContent;
  modalDesc.textContent = card.dataset.desc || '';
  modalImg.src = card.dataset.img || ''; // imagem principal (bolinha/fundo)

  detailModal.classList.remove('hidden');
  detailModal.focus(); // acessibilidade
}

// Fecha o modal
closeModalBtn.addEventListener('click', () => {
  detailModal.classList.add('hidden');
});


// ================= HANDLERS (EVENTOS) =================
function attachHandlers() {
  getCards().forEach(card => {
    // Clique abre o modal (exceto clique na estrela)
    card.addEventListener('click', e => {
      if (e.target.classList.contains('fav-btn')) return;
      openModal(card);
    });
  });
}


// ================= PERFORMANCE =================
// Ativa lazy-loading em todas as imagens
function applyLazyLoading() {
  getCards().forEach(card =>
    card.querySelectorAll('img').forEach(img => img.setAttribute('loading', 'lazy'))
  );
}

// Função para evitar buscas a cada tecla (melhora performance)
function debounce(fn, delay = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Busca nos cards conforme digitação
const handleSearch = debounce(q => {
  getCards().forEach(c =>
    c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'
  );
});

// Evento do campo de busca
$('#searchInput').addEventListener('input', e => handleSearch(e.target.value.toLowerCase()));


// ================= STATUS DOS SITES =================
// Verifica status e latência de cada card
async function checkStatus(card) {
  const icon = card.querySelector('[data-icon]');
  const text = card.querySelector('[data-text]');
  const latencyEl = card.querySelector('[data-latency]');
  const lastEl = card.querySelector('[data-last]');
  const url = card.dataset.url;

  icon.textContent = '⏳';
  text.textContent = 'Verificando...';
  latencyEl.textContent = 'Latência: –';

  const start = performance.now();
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    const latency = Math.round(performance.now() - start);
    icon.textContent = '🟢';
    text.textContent = 'Online';
    latencyEl.textContent = `Latência: ${latency} ms`;
  } catch {
    icon.textContent = '🔴';
    text.textContent = 'Offline';
    latencyEl.textContent = 'Latência: –';
  }

  // Atualiza horário da última verificação
  lastEl.textContent = `Última verificação: ${new Date().toLocaleTimeString()}`;
}

// Atualiza todos os cards
function updateAllStatus() { getCards().forEach(checkStatus); }

// Checa a cada 30s e pausa quando a aba não está visível
let statusInterval = setInterval(updateAllStatus, 30000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(statusInterval);
  } else {
    updateAllStatus();
    statusInterval = setInterval(updateAllStatus, 30000);
  }
});


// ================= ACESSIBILIDADE =================
function applyAccessibility() {
  getCards().forEach(c => {
    const img = c.querySelector('img');
    if (img && !img.alt) img.alt = c.querySelector('h3').textContent;
  });

  detailModal.setAttribute('tabindex', '-1');
  closeModalBtn.setAttribute('aria-label', 'Fechar detalhes');
}


// ================= INICIALIZAÇÃO =================
applyAccessibility();    // aplica boas práticas de acessibilidade
applyLazyLoading();      // otimiza imagens
renderFavorites();       // mostra favoritos
reorderCards();          // garante favoritos no topo
initCounts();            // inicia contadores
attachHandlers();        // adiciona eventos
updateAllStatus();       // checa status inicial
