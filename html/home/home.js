// home.js

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyUserProfile(user);
        } else {
            // Fallback caso o auth-guard não intercepte
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }

      
    });
});

async function verifyUserProfile(user) {
    console.log("Verificando perfil do usuário:", user.uid); // Veja se aparece no console (F12)
    userService.findByUid(user.uid).then(userData => {
        console.log("Dados do Firestore:", userData); // Veja se o perfil é 'host' ou 'player'
        const role = userData.profile === "host" ? 'professor' : 'aluno';
        renderMenu(role);
        
        const nameUserElement = document.getElementById("nameUser");
        const avatarUserElement = document.getElementById("avatarUser");
        if (nameUserElement) {
          nameUserElement.textContent = userData.nickname;
        }
        if (avatarUserElement) {
          const avatarPath = `${location.origin}/app-educacional/assets/img/perfil/${userData.avatar}.png`;
          avatarUserElement.innerHTML = `
            <img 
              src="${avatarPath}" 
              class="img-fluid rounded-circle img-thumbnail" 
              alt="Avatar de ${userData.nickname}" 
              width="50" 
              height="50"
            />`;
        }
    }).catch(error => {
        console.error("Erro ao verificar perfil:", error);
        document.getElementById('main-menu').innerHTML = `<p class="p-3 text-danger">Erro ao carregar menu.</p>`;
    });
}

function renderMenu(role) {
    const menu = document.getElementById('main-menu');
    
    if (role === 'aluno') {
        const options = role === 'aluno' ? [
        { id: 'conteudo', label: 'Conteúdo', icon: 'fa-book-open' },
        { id: 'video', label: 'Vídeo Aula', icon: 'fa-play-circle' },
        { id: 'quiz', label: 'Quiz', icon: 'fa-quiz' },
        { id: 'jogo', label: 'Jogar Desafio', icon: 'fa-gamepad' },
        { id: 'caca_palavras', label: 'Caça-Palavras', icon: 'fa-search' },
        { id: 'ranking', label: 'Ranking', icon: 'fa-chart-line' },
        { id: 'sair', label: 'Sair', icon: 'fa-sign-out-alt' }
        ] : ['Conteúdo', 'Video', 'Quiz', 'Jogo', 'Caça-Palavras', 'Ranking', 'Sair'];
        
        menu.innerHTML = options.map(opt => {
            const id = typeof opt === 'string' ? opt.toLowerCase() : opt.id;
            const label = typeof opt === 'string' ? `Ajustar ${opt}` : opt.label;
            const icon = typeof opt === 'string' ? 'fa-edit' : opt.icon;
            
            return `
                <button class="list-group-item list-group-item-action p-3 border-0 d-flex align-items-center" 
                        onclick="openModule('${id}', '${role}')">
                    <i class="fas ${icon} me-3 ${role === 'aluno' ? 'text-primary' : 'text-danger'}"></i> ${label}
                </button>
            `;
        }).join('');
    }
}

function openModule(id, role) {
    // Fecha o menu lateral
    const instance = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasMenu'));
    if(instance) instance.hide();

    if (id === 'sair') {
        if (confirm("Deseja sair?")) logout();
        return;
    }

    const iframe = document.getElementById('content-iframe');
    // Define o caminho do arquivo: ex: ../binarios/binarios.html
    // Ajuste aqui para o nome real dos seus arquivos de conteúdo
    var page = `../binarios/conteudo.html`;
    if (id === 'ranking'){
        page = `../${id}/${id}.html`;
        iframe.src = page;
        return;
    }else{
        page = role === 'professor' ? `../${id}/ajustar_${id}.html` : `../binarios/${id}.html`;
    }
    iframe.src = page;
}

// Fecha o menu lateral e carrega o conteúdo
function selectMenuOption(id, role) {
    const offcanvasElement = document.getElementById('offcanvasMenu');
    const instance = bootstrap.Offcanvas.getInstance(offcanvasElement);
    if(instance) instance.hide();

    loadContent(id, role);
}

function loadContent(type, role) {
    const display = document.getElementById('content-display');
    
    if (role === 'aluno') {
        switch(type) {
            case 'conteudo':
                display.innerHTML = `
                    <h2 class="h4 fw-bold">Módulo 1: Introdução a Redes</h2>
                    <hr class="colorgraph">
                    <p class="text-muted">Explore os fundamentos de redes de computadores.</p>
                    <button class="btn btn-success" onclick="window.location.href='../binarios/binarios.html'">
                        <i class="fas fa-external-link-alt me-2"></i> Abrir Lição: Números Binários
                    </button>
                `;
                break;
            case 'ranking':
                display.innerHTML = `
                    <h2 class="h4 fw-bold">Ranking Global IFPR</h2>
                    <hr class="colorgraph">
                    <div class="alert alert-info">Sincronizando placares com o servidor...</div>
                `;
                break;
            case 'sair':
                // Chama a função logout() importada do seu arquivo logout.js
                if (confirm("Deseja realmente sair do GamificaEduk?")) {
                    logout(); 
                }
            default:
                display.innerHTML = `
                    <h2 class="h4 fw-bold">${type.toUpperCase()}</h2>
                    <hr class="colorgraph">
                    <div class="text-center py-4">
                        <i class="fas fa-tools fa-2x mb-3 text-secondary"></i>
                        <p>O conteúdo de <b>${type}</b> está em fase de preparação.</p>
                    </div>
                `;
        }
    } else {
        // VISÃO DO PROFESSOR (AJUSTES)
        display.innerHTML = `
            <h2 class="h4 fw-bold text-danger">Gestão de Módulo: ${type.toUpperCase()}</h2>
            <hr class="colorgraph">
            <div class="mb-4">
                abel class="form-label fw-bold">Texto ou Link do Material:</label>
                <textarea id="teacher-input" class="form-control" rows="6" placeholder="Insira o conteúdo atualizado aqui..."></textarea>
            </div>
            <div class="d-grid gap-2">
                <button class="btn btn-primary btn-lg" onclick="saveAjuste('${type}')">
                    <i class="fas fa-save me-2"></i> SALVAR NO BANCO DE DADOS
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="location.reload()">Cancelar</button>
            </div>
        `;
    }
}

function saveAjuste(type) {
    const data = document.getElementById('teacher-input').value;
    alert(`Sucesso! O material de ${type.toUpperCase()} foi atualizado no Firebase.`);
    // Aqui você implementaria: db.collection('contents').doc(type).update({ text: data });
}

function logout() {
  firebase.auth().signOut()
    .then(() => {
      // Redirecionamento absoluto baseado na origem atual do site
      const loginUrl = `${location.origin}/app-educacional/html/login/login.html`;
      console.log("Logout realizado com sucesso.");
      window.location.href = loginUrl;
    })
    .catch(error => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout! Tente novamente.");
    });
}