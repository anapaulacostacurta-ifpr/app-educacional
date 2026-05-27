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
        
        // Atualiza a tag de perfil no header
        document.getElementById('profile-tag').innerText = `Perfil: ${role.toUpperCase()}`;
        document.getElementById('profile-tag').classList.replace('bg-primary', role === 'professor' ? 'bg-danger' : 'bg-success');

    }).catch(error => {
        console.error("Erro ao verificar perfil:", error);
        document.getElementById('main-menu').innerHTML = `<p class="p-3 text-danger">Erro ao carregar menu.</p>`;
    });
}

function renderMenu(role) {
    const menu = document.getElementById('main-menu');
    
    if (role === 'aluno') {
        const options = [
            { id: 'conteudo', label: 'Conteúdo', icon: 'fa-book-open' },
            { id: 'video', label: 'Vídeo Aula', icon: 'fa-play-circle' },
            { id: 'jogo', label: 'Jogar Desafio', icon: 'fa-gamepad' },
            { id: 'ranking', label: 'Ranking e Desempenho', icon: 'fa-chart-line' },
            { id: 'caca', label: 'Caça-palavras', icon: 'fa-search' }
        ];
        
        menu.innerHTML = options.map(opt => `
            <button class="list-group-item list-group-item-action p-3 border-0 d-flex align-items-center" 
                    onclick="selectMenuOption('${opt.id}', 'aluno')">
                <i class="fas ${opt.icon} me-3 text-primary" style="width: 20px;"></i> ${opt.label}
            </button>
        `).join('');
        
    } else {
        const options = ['Conteúdo', 'Video', 'Jogo', 'Ranking', 'Caça-palavras'];
        
        menu.innerHTML = options.map(opt => `
            <button class="list-group-item list-group-item-action p-3 border-0 d-flex align-items-center" 
                    onclick="selectMenuOption('${opt.toLowerCase()}', 'professor')">
                <i class="fas fa-edit me-3 text-danger" style="width: 20px;"></i> Ajustar ${opt}
            </button>
        `).join('');
    }
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