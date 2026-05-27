// home.js

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyUserProfile(user);
        } else {
            // Se não houver usuário, o auth-guard já deve tratar, 
            // mas mantemos o fallback absoluto como você definiu
            window.location.href = `${location.origin}/projetoGamificaEduk/html/login/login.html`;
        }
    });
});

async function verifyUserProfile(user) {
    // Aqui você deve buscar no seu Firestore se o usuário é 'professor' ou 'aluno'
    // Exemplo: const profile = await userService.getProfile(user.uid);
    
    // Simulação para teste (troque manualmente para testar as duas visões)
    const userRole = (user.email.includes('professor') || user.email.includes('ana')) ? 'professor' : 'aluno';
    
    renderMenu(userRole);
    document.getElementById('profile-tag').innerText = `Perfil: ${userRole.toUpperCase()}`;
    document.getElementById('content-display').innerHTML = `<h3>Bem-vindo, ${user.email.split('@')[0]}!</h3><p>Selecione uma opção no menu ao lado.</p>`;
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
            <button class="btn btn-outline-primary text-start p-3 option shadow-sm" onclick="loadContent('${opt.id}', 'aluno')">
                <i class="fas ${opt.icon} me-2"></i> ${opt.label}
            </button>
        `).join('');
        
    } else {
        const options = ['Conteúdo', 'Video', 'Jogo', 'Ranking', 'Caça-palavras'];
        
        menu.innerHTML = options.map(opt => `
            <button class="btn btn-outline-danger text-start p-3 option shadow-sm" onclick="loadContent('${opt.toLowerCase()}', 'professor')">
                <i class="fas fa-edit me-2"></i> Ajustar ${opt}
            </button>
        `).join('');
    }
}

function loadContent(type, role) {
    const display = document.getElementById('content-display');
    
    if (role === 'aluno') {
        switch(type) {
            case 'conteudo':
                display.innerHTML = `<h4>Módulo 1: Redes de Computadores</h4><hr class="colorgraph"><p>Inicie sua jornada pelos conceitos fundamentais...</p><button class="btn btn-success" onclick="window.location.href='../binarios/binarios.html'">Abrir Tópico 1</button>`;
                break;
            case 'ranking':
                display.innerHTML = `<h4>Seu Desempenho</h4><hr class="colorgraph"><div class="alert alert-info">Carregando dados do servidor...</div>`;
                break;
            default:
                display.innerHTML = `<h4>Módulo: ${type.toUpperCase()}</h4><hr class="colorgraph"><p>Conteúdo em desenvolvimento.</p>`;
        }
    } else {
        display.innerHTML = `
            <h4>Gestão: ${type.toUpperCase()}</h4>
            <hr class="colorgraph">
            <div class="mb-3">
                abel class="form-label">Atualizar material de ${type}:</label>
                <textarea class="form-control" rows="5" placeholder="Insira o novo texto ou link aqui..."></textarea>
            </div>
            <button class="btn btn-primary" onclick="alert('Conteúdo atualizado no Firebase!')">Salvar Alterações</button>
        `;
    }
}