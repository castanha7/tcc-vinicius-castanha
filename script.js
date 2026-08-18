// BANCO DADOS TEMPORÁRIOS DE DEMONSTRAÇÃO
const mockOpportunities = [
  {
    id: "1",
    title: "Curso de Introdução à Programação Web",
    institution: "Escola de Tecnologia e Futuro",
    category: "cursos",
    location: "Centro - Araucária",
    period: "Início em 10/09/2026",
    status: "ativa",
    link: "https://exemplo.com/curso-programacao",
    description: "Aprenda HTML, CSS e JavaScript do zero com aulas práticas semanais. Curso voltado para iniciantes em busca do primeiro emprego na área de tecnologia."
  },
  {
    id: "2",
    title: "Oficina de Fotografia Urbana",
    institution: "Coletivo Cultural de Araucária",
    category: "oficinas",
    location: "Parque Cachoeira",
    period: "Acontece no Sábado das 14h às 17h",
    status: "ativa",
    link: "https://exemplo.com/oficina-fotografia",
    description: "Oficina prática de fotografia utilizando smartphones. Gratuita e aberta para todas as idades. Traga seu aparelho e aprenda técnicas de enquadramento e iluminação."
  },
  {
    id: "3",
    title: "Projeto Horta Comunitária e Sustentabilidade",
    institution: "ONG Verde Vida",
    category: "projetos",
    location: "Bairro Campina da Barra",
    period: "Inscrições Abertas",
    status: "ativa",
    link: "https://exemplo.com/horta-comunitaria",
    description: "Atividades de voluntariado e aprendizado prático sobre cultivo orgânico, compostagem e preservação ambiental na comunidade."
  },
  {
    id: "4",
    title: "Feira de Inovação e Carreiras 2026",
    institution: "Associação Comercial",
    category: "eventos",
    location: "Auditório Central",
    period: "Dia 25/09/2026",
    status: "ativa",
    link: "https://exemplo.com/feira-inovacao",
    description: "Palestras, networking e mentoria gratuita para jovens ingressantes no mercado de trabalho. Vagas para entrevistas no local."
  }
];

let currentCategory = 'todos';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  renderOpportunities(mockOpportunities);
  renderAdminTable(mockOpportunities);
});

// SISTEMA DE NAVEGAÇÃO DE TELAS (SPA)
function navigateTo(viewName, param = null) {
  // 1. Esconde todas as seções
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => view.classList.remove('active'));

  // 2. Remove destaque de todos os botões do menu
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-nav'));

  // 3. Exibe a tela selecionada
  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.classList.add('active');
  }

  // 4. Marca o botão de navegação ativo se houver
  const activeBtn = document.querySelector(`.nav-btn[data-target="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active-nav');
  }

  // 5. Trata chamadas específicas
  if (viewName === 'details' && param) {
    loadOpportunityDetails(param);
  }

  // Rola a página para o topo ao trocar de tela
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// RENDERIZAR CARDS NA TELA INICIAL
function renderOpportunities(data) {
  const container = document.getElementById('opportunitiesGrid');
  const countLabel = document.getElementById('resultsCount');
  
  container.innerHTML = '';
  countLabel.textContent = `Exibindo ${data.length} oportunidade(s)`;

  if (data.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Nenhuma oportunidade encontrada com esses critérios.</p>`;
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <span class="card-tag">${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-institution">📍 ${item.institution} • ${item.location}</p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${item.description.substring(0, 85)}...</p>
      </div>
      <div class="card-footer">
        <button class="btn-outline" onclick="navigateTo('details', '${item.id}')">Ver Detalhes</button>
        <a href="${item.link}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 0.85rem;">Inscrever-se</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// BUSCA VISUAL
function handleSearch() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = mockOpportunities.filter(item => {
    const matchesCategory = currentCategory === 'todos' || item.category === currentCategory;
    const matchesSearch = item.title.toLowerCase().includes(term) || 
                          item.institution.toLowerCase().includes(term) || 
                          item.description.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  renderOpportunities(filtered);
}

// FILTRO DE CATEGORIAS
function filterCategory(category, buttonEl) {
  currentCategory = category;
  document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');
  handleSearch();
}

// CARREGAR TELA DE DETALHES
function loadOpportunityDetails(id) {
  const item = mockOpportunities.find(o => o.id === id);
  const container = document.getElementById('detailsCardContent');

  if (!item) {
    container.innerHTML = `<p>Oportunidade não encontrada.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="details-header">
      <span class="card-tag">${item.category}</span>
      <h1 style="margin: 10px 0; font-size: 1.8rem;">${item.title}</h1>
      <p style="color: var(--text-muted); font-size: 1.1rem;">Oferecido por: <strong>${item.institution}</strong></p>
    </div>

    <div class="details-meta-grid">
      <div class="meta-item">
        <strong>Localização</strong>
        <span>📍 ${item.location}</span>
      </div>
      <div class="meta-item">
        <strong>Período / Data</strong>
        <span>📅 ${item.period}</span>
      </div>
      <div class="meta-item">
        <strong>Status</strong>
        <span class="badge-active">${item.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="details-description">
      <h3 style="margin-bottom: 10px;">Sobre esta oportunidade</h3>
      <p>${item.description}</p>
    </div>

    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
      <a href="${item.link}" target="_blank" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 14px; font-size: 1rem;">AcessAR Oportunidade (Link Oficial)</a>
      <button class="btn-outline" onclick="navigateTo('home')">Voltar</button>
    </div>
  `;
}

// RENDERIZAR TABELA ADMIN
function renderAdminTable(data) {
  const tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = '';

  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.institution}</td>
      <td>${item.category}</td>
      <td><span class="badge-active">${item.status}</span></td>
      <td>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="alert('Edição visual temporária. O CRUD real no banco virá na Etapa 6.')">Editar</button>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: red;" onclick="alert('Exclusão visual temporária. O CRUD real no banco virá na Etapa 6.')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// VALIDAÇÃO E ENVIO TEMPORÁRIO DE CADASTRO
function handleDummyRegister(event) {
  event.preventDefault();
  const pass = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('regPasswordConfirm').value;

  if (pass !== confirmPass) {
    alert('Erro: As senhas digitadas não coincidem!');
    return;
  }

  alert('Cadastro simulado com sucesso! Na Etapa 3 este cadastro será salvo via Autenticação real.');
  navigateTo('login');
}

// ENVIOS TEMPORÁRIOS DIVERSOS
function handleDummyAuth(event, message) {
  event.preventDefault();
  alert(message);
  navigateTo('home');
}

function handleDummySubmit(event, message) {
  event.preventDefault();
  alert(message);
  closeModal('opportunityFormModal');
}

// MODAL ADMIN
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}