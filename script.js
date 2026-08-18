// DADOS TEMPORÁRIOS DE DEMONSTRAÇÃO (SERÃO SUBSTITUÍDOS PELO FIRESTORE)
const mockOpportunities = [
  {
    id: "1",
    title: "Curso de Introdução à Programação Web",
    institution: "Escola de Tecnologia e Futuro",
    category: "cursos",
    location: "Centro",
    status: "ativa",
    link: "https://exemplo.com/curso-programacao",
    description: "Aprenda HTML, CSS e JavaScript do zero com aulas práticas semanais."
  },
  {
    id: "2",
    title: "Oficina de Fotografia Urbana",
    institution: "Coletivo Cultural de Araucária",
    category: "oficinas",
    location: "Parque Cachoeira",
    status: "ativa",
    link: "https://exemplo.com/oficina-fotografia",
    description: "Oficina prática de fotografia utilizando smartphones. Gratuita e aberta ao público."
  },
  {
    id: "3",
    title: "Projeto Horta Comunitária e Sustentabilidade",
    institution: "ONG Verde Vida",
    category: "projetos",
    location: "Bairro Campina da Barra",
    status: "ativa",
    link: "https://exemplo.com/horta-comunitaria",
    description: "Atividades de voluntariado e aprendizado sobre cultivo orgânico e preservação."
  },
  {
    id: "4",
    title: "Feira de Inovação e Carreiras 2026",
    institution: "Associação Comercial",
    category: "eventos",
    location: "Auditório Central",
    status: "ativa",
    link: "https://exemplo.com/feira-inovacao",
    description: "Palestras, networking e mentoria gratuita para jovens ingressantes no mercado."
  }
];

let currentCategory = 'todos';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  renderOpportunities(mockOpportunities);
  renderAdminTable(mockOpportunities);
});

// RENDERIZAR CARDS
function renderOpportunities(data) {
  const container = document.getElementById('opportunitiesGrid');
  const countLabel = document.getElementById('resultsCount');
  
  container.innerHTML = '';
  countLabel.textContent = `Exibindo ${data.length} oportunidade(s)`;

  if (data.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Nenhuma oportunidade encontrada.</p>`;
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
        <p style="font-size: 0.9rem; color: var(--text-muted);">${item.description.substring(0, 80)}...</p>
      </div>
      <div class="card-footer">
        <button class="btn-outline" onclick="openDetails('${item.id}')">Ver Detalhes</button>
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
  
  // Atualiza botões ativos
  document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');

  handleSearch();
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
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem;">Editar</button>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: red;">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// CONTROLE DE NAVEGAÇÃO DE VIEWS
function switchView(view) {
  const heroSection = document.querySelector('.hero-section');
  const oppSection = document.querySelector('.opportunities-section');
  const adminView = document.getElementById('adminView');

  if (view === 'admin') {
    heroSection.classList.add('hidden');
    oppSection.classList.add('hidden');
    adminView.classList.remove('hidden');
  } else {
    heroSection.classList.remove('hidden');
    oppSection.classList.remove('hidden');
    adminView.classList.add('hidden');
  }
}

// CONTROLE DE MODAIS
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openDetails(id) {
  const item = mockOpportunities.find(o => o.id === id);
  if (!item) return;

  const content = document.getElementById('detailsContent');
  content.innerHTML = `
    <span class="card-tag">${item.category}</span>
    <h2 style="margin: 10px 0;">${item.title}</h2>
    <p style="color: var(--text-muted); margin-bottom: 15px;"><strong>Instituição:</strong> ${item.institution}</p>
    <p style="color: var(--text-muted); margin-bottom: 15px;"><strong>Local:</strong> ${item.location}</p>
    <p style="margin-bottom: 20px;">${item.description}</p>
    <a href="${item.link}" target="_blank" class="btn-primary btn-full" style="text-align: center; text-decoration: none; display: block;">AcessAR Link Oficial de Inscrição</a>
  `;
  openModal('detailsModal');
}

// TRATAMENTO TEMPORÁRIO DE FORMULÁRIOS
function handleFormSubmit(event, successMessage) {
  event.preventDefault();
  alert(successMessage);
  // Fecha qualquer modal aberto
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
