import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ARMAZENAMENTO EM MEMÓRIA DAS OPORTUNIDADES VINDAS DO FIRESTORE
let opportunitiesData = [];
let currentCategory = 'todos';
let currentUser = null;

// INICIALIZAÇÃO & MONITORAMENTO DE SESSÃO E BANCO DE DADOS
document.addEventListener('DOMContentLoaded', async () => {
  setupFormListeners();
  window.navigateTo('home');

  // Carrega os dados reais do Firestore
  await fetchOpportunities();

  // Escuta alterações no estado da autenticação (Persistência Automática)
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI(user);
  });
});

// BUSCA DADOS DA COLEÇÃO 'opportunities' NO FIRESTORE
async function fetchOpportunities() {
  const container = document.getElementById('opportunitiesGrid');
  const countLabel = document.getElementById('resultsCount');

  if (container) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Carregando oportunidades...</p>`;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "opportunities"));
    opportunitiesData = [];

    querySnapshot.forEach((doc) => {
      opportunitiesData.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderOpportunities(opportunitiesData);
    renderAdminTable(opportunitiesData);
  } catch (error) {
    console.error("Erro ao buscar dados do Firestore:", error);
    if (container) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Não foi possível carregar as oportunidades no momento.</p>`;
    }
    if (countLabel) {
      countLabel.textContent = "Exibindo 0 oportunidade(s)";
    }
  }
}

// SISTEMA DE NAVEGAÇÃO DE TELAS (SPA) - CONTROLE DIRETO DE VISIBILIDADE
window.navigateTo = function(viewName, param = null) {
  const views = document.querySelectorAll('.view-section');
  
  views.forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
  });

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-nav'));

  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
  }

  const activeBtn = document.querySelector(`.nav-btn[data-target="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active-nav');
  }

  if (viewName === 'details' && param) {
    loadOpportunityDetails(param);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ATUALIZA ELEMENTOS DA INTERFACE CONFORME SESSÃO
function updateAuthUI(user) {
  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  const navUsername = document.getElementById('navUsername') || document.getElementById('navUserName');
  const mobileNavAuthLabel = document.getElementById('mobileNavAuthLabel');

  if (user) {
    if (guestNav) guestNav.classList.add('hidden');
    if (userNav) userNav.classList.remove('hidden');
    
    const displayName = user.displayName || user.email.split('@')[0];
    if (navUsername) navUsername.textContent = `Olá, ${displayName}`;
    if (mobileNavAuthLabel) mobileNavAuthLabel.textContent = 'Minha Conta';
  } else {
    if (guestNav) guestNav.classList.remove('hidden');
    if (userNav) userNav.classList.add('hidden');
    if (mobileNavAuthLabel) mobileNavAuthLabel.textContent = 'Entrar';
  }
}

// CONFIGURAÇÃO DOS FORMULÁRIOS DE AUTENTICAÇÃO REAL
function setupFormListeners() {
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

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
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
        <span class="card-tag">${item.category || 'geral'}</span>
        <h3 class="card-title">${item.title || 'Sem título'}</h3>
        <p class="card-institution">📍 ${item.institution || 'Instituição não informada'} • ${item.location || 'Local não informado'}</p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${(item.description || '').substring(0, 85)}...</p>
      </div>
      <div class="card-footer">
        <button class="btn-outline" onclick="window.navigateTo('details', '${item.id}')">Ver Detalhes</button>
        <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 0.85rem;">Inscrever-se</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// BUSCA VISUAL
window.handleSearch = function() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = opportunitiesData.filter(item => {
    const matchesCategory = currentCategory === 'todos' || item.category === currentCategory;
    const matchesSearch = (item.title || '').toLowerCase().includes(term) || 
                          (item.institution || '').toLowerCase().includes(term) || 
                          (item.description || '').toLowerCase().includes(term);
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
  const item = opportunitiesData.find(o => o.id === id);
  const container = document.getElementById('detailsCardContent');

  if (!container) return;

  if (!item) {
    container.innerHTML = `<p style="padding: 20px; text-align: center;">Oportunidade não encontrada.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="details-header">
      <span class="card-tag">${item.category || 'geral'}</span>
      <h1 style="margin: 10px 0; font-size: 1.8rem;">${item.title || 'Sem título'}</h1>
      <p style="color: var(--text-muted); font-size: 1.1rem;">Oferecido por: <strong>${item.institution || 'Não informado'}</strong></p>
    </div>

    <div class="details-meta-grid">
      <div class="meta-item">
        <strong>Localização</strong>
        <span>📍 ${item.location || 'Não informada'}</span>
      </div>
      <div class="meta-item">
        <strong>Período / Data</strong>
        <span>📅 ${item.period || 'Não informado'}</span>
      </div>
      <div class="meta-item">
        <strong>Status</strong>
        <span class="badge-active">${(item.status || 'Ativa').toUpperCase()}</span>
      </div>
    </div>

    <div class="details-description">
      <h3 style="margin-bottom: 10px;">Sobre esta oportunidade</h3>
      <p>${item.description || 'Sem descrição detalhada.'}</p>
    </div>

    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
      <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 14px; font-size: 1rem;">Acessar Oportunidade (Link Oficial)</a>
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
      <td><strong>${item.title || 'Sem título'}</strong></td>
      <td>${item.institution || 'Não informada'}</td>
      <td>${item.category || 'geral'}</td>
      <td><span class="badge-active">${item.status || 'ativa'}</span></td>
      <td>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="alert('Edição temporária. O CRUD real no banco virá na próxima etapa.')">Editar</button>
        <button class="btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: red;" onclick="alert('Exclusão temporária. O CRUD real no banco virá na próxima etapa.')">Excluir</button>
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