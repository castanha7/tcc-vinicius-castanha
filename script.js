import { auth } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
let currentUser = null;

// INICIALIZAÇÃO & MONITORAMENTO DE SESSÃO REAL DO FIREBASE
document.addEventListener('DOMContentLoaded', () => {
  renderOpportunities(mockOpportunities);
  renderAdminTable(mockOpportunities);
  setupFormListeners();

  // Define o estado inicial exibindo a tela inicial
  window.navigateTo('home');

  // Escuta alterações no estado da autenticação (Persistência Automática)
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI(user);
  });
});

// SISTEMA DE NAVEGAÇÃO DE TELAS (SPA) - CONTROLE DIRETO DE VISIBILIDADE
window.navigateTo = function(viewName, param = null) {
  const views = document.querySelectorAll('.view-section');
  
  // Oculta todas as seções diretamente pelo estilo do elemento
  views.forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
  });

  // Remove destaque visual dos botões de navegação
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-nav'));

  // Exibe a seção alvo
  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
  }

  // Ativa destaque no botão correspondente
  const activeBtn = document.querySelector(`.nav-btn[data-target="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active-nav');
  }

  // Carrega os detalhes do item caso seja a tela de detalhes
  if (viewName === 'details' && param) {
    loadOpportunityDetails(param);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ATUALIZA ELEMENTOS DA INTERFACE CONFORME SESSÃO
function updateAuthUI(user) {
  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  // Suporte aos IDs navUsername e navUserName para evitar quebras
  const navUsername = document.getElementById('navUsername') || document.getElementById('navUserName');
  const mobileNavAuthLabel = document.getElementById('mobileNavAuthLabel');

  if (user) {
    // Usuário Autenticado
    if (guestNav) guestNav.classList.add('hidden');
    if (userNav) userNav.classList.remove('hidden');
    
    const displayName = user.displayName || user.email.split('@')[0];
    if (navUsername) navUsername.textContent = `Olá, ${displayName}`;
    if (mobileNavAuthLabel) mobileNavAuthLabel.textContent = 'Minha Conta';
  } else {
    // Visitante (Deslogado)
    if (guestNav) guestNav.classList.remove('hidden');
    if (userNav) userNav.classList.add('hidden');
    if (mobileNavAuthLabel) mobileNavAuthLabel.textContent = 'Entrar';
  }
}

// CONFIGURAÇÃO DOS FORMULÁRIOS DE AUTENTICAÇÃO REAL
function setupFormListeners() {
  // CADASTRO REAL
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regPasswordConfirm').value;
      const submitBtn = document.getElementById('btnRegisterSubmit') || document.getElementById('btnRegister');

      if (password !== confirmPassword) {
        alert('As senhas digitadas não coincidem.');
        return;
      }

      if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Cadastrando...';
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        alert('Conta criada com sucesso!');
        registerForm.reset();
        window.navigateTo('home');
      } catch (error) {
        alert(translateAuthError(error.code));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Criar conta';
        }
      }
    });
  }

  // LOGIN REAL
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      // Compatibilidade com ID btnLogin e btnLoginSubmit
      const submitBtn = document.getElementById('btnLogin') || document.getElementById('btnLoginSubmit');

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Entrando...';
        }

        await signInWithEmailAndPassword(auth, email, password);
        alert('Login realizado com sucesso!');
        loginForm.reset();
        window.navigateTo('home');
      } catch (error) {
        alert(translateAuthError(error.code));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar';
        }
      }
    });
  }

  // RECUPERAÇÃO DE SENHA REAL
  const resetForm = document.getElementById('resetPasswordForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();

      try {
        await sendPasswordResetEmail(auth, email);
        alert('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
        resetForm.reset();
        window.closeModal('resetPasswordModal');
      } catch (error) {
        alert(translateAuthError(error.code));
      }
    });
  }

  // FORMULÁRIO DUMMY ADMIN
  const dummyAdminForm = document.getElementById('dummyAdminForm');
  if (dummyAdminForm) {
    dummyAdminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('A gravação real no banco ocorrerá nas etapas de CRUD.');
      window.closeModal('opportunityFormModal');
    });
  }
}

// LOGOUT REAL
window.handleLogout = async function() {
  try {
    await signOut(auth);
    alert('Sessão encerrada com sucesso.');
    window.navigateTo('home');
  } catch (error) {
    alert('Erro ao sair da conta: ' + error.message);
  }
};

// TRADUTOR DE ERROS DO FIREBASE AUTHENTICATION
function translateAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta.';
    case 'auth/invalid-email':
      return 'O e-mail informado é inválido.';
    case 'auth/weak-password':
      return 'A senha deve conter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Acesso temporariamente bloqueado devido a muitas tentativas inválidas. Tente novamente mais tarde.';
    default:
      return 'Erro na autenticação: ' + code;
  }
}

// RENDERIZAR CARDS NA TELA INICIAL
function renderOpportunities(data) {
  const container = document.getElementById('opportunitiesGrid');
  const countLabel = document.getElementById('resultsCount');
  
  if (!container || !countLabel) return;

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
        <button class="btn-outline" onclick="window.navigateTo('details', '${item.id}')">Ver Detalhes</button>
        <a href="${item.link}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 0.85rem;">Inscrever-se</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// BUSCA VISUAL
window.handleSearch = function() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = mockOpportunities.filter(item => {
    const matchesCategory = currentCategory === 'todos' || item.category === currentCategory;
    const matchesSearch = item.title.toLowerCase().includes(term) || 
                          item.institution.toLowerCase().includes(term) || 
                          item.description.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  renderOpportunities(filtered);
};

// FILTRO DE CATEGORIAS
window.filterCategory = function(category, buttonEl) {
  currentCategory = category;
  document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');
  window.handleSearch();
};

// CARREGAR TELA DE DETALHES
function loadOpportunityDetails(id) {
  const item = mockOpportunities.find(o => o.id === id);
  const container = document.getElementById('detailsCardContent');

  if (!container) return;

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
      <a href="${item.link}" target="_blank" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 14px; font-size: 1rem;">Acessar Oportunidade (Link Oficial)</a>
      <button class="btn-outline" onclick="window.navigateTo('home')">Voltar</button>
    </div>
  `;
}

// RENDERIZAR TABELA ADMIN
function renderAdminTable(data) {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.institution}</td>
      <td>${item.category}</td>
      <td><span class="badge-active">${item.status}</span></td>
      <td>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="alert('Edição temporária. O CRUD real no banco virá na Etapa 6.')">Editar</button>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: red;" onclick="alert('Exclusão temporária. O CRUD real no banco virá na Etapa 6.')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// MODAL CONTROL
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};