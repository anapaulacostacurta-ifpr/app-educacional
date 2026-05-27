// binarios.js

let appState = {
    xp: 0,
    currentModule: JSON.parse(localStorage.getItem('edu_bin_mod')) || {
        title: "O que são Binários?",
        text: "Binários são a base da comunicação em redes de computadores. Cada bit (0 ou 1) representa um sinal elétrico."
    },
    currentQuiz: JSON.parse(localStorage.getItem('edu_bin_quiz')) || {
        q: "Como representamos o número 2 em binário?",
        a: "10"
    }
};

let binState = {
    xp: 0,
    quiz: { q: "O número 2 em binário é?", a: "10" }
};


document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('user-display-name').innerText = user.email;
            checkProfileAndRender(user);
        } else {
            window.location.href = "../login/login.html";
        }
    });
});
      
function toggleTeacherView() {
    document.getElementById('view-student').classList.toggle('d-none');
    document.getElementById('view-teacher').classList.toggle('d-none');
}

function renderApp() {
    // Renderiza Conteúdo
    document.getElementById('content-area').innerHTML = `
        <h3 class="h6 fw-bold text-indigo-900">${appState.currentModule.title}</h3>
        <p class="small text-muted">${appState.currentModule.text}</p>
    `;

    // Renderiza Quiz usando suas classes .option
    document.getElementById('quiz-area').innerHTML = `
        <p class="small fw-bold">${appState.currentQuiz.q}</p>
        <div class="quiz-option option" onclick="checkAns(this, '${appState.currentQuiz.a}')">${appState.currentQuiz.a}</div>
        <div class="quiz-option option" onclick="checkAns(this, '01')">01</div>
    `;
}

function checkAns(element, val) {
    if(val === appState.currentQuiz.a) {
        element.classList.add('correct');
        addXP(50);
        alert("Excelente! +50 XP");
    } else {
        element.classList.add('incorrect');
        alert("Ops! Lembre-se: em binário usamos potências de 2.");
    }
}

function addXP(val) {
    appState.xp += val;
    document.getElementById('xp-val').innerText = appState.xp;
    document.getElementById('lvl-val').innerText = Math.floor(appState.xp / 100) + 1;
}

function saveToDatabase() {
    const newMod = {
        title: document.getElementById('input-title').value,
        text: document.getElementById('input-text').value
    };
    const newQuiz = {
        q: document.getElementById('input-q').value,
        a: document.getElementById('input-a').value
    };

    localStorage.setItem('edu_bin_mod', JSON.stringify(newMod));
    localStorage.setItem('edu_bin_quiz', JSON.stringify(newQuiz));
    
    appState.currentModule = newMod;
    appState.currentQuiz = newQuiz;
    
    alert("Dados salvos! Voltando para visão do aluno.");
    renderApp();
    toggleTeacherView();
}

// RESOLVE O ERRO: completeContent is not defined
function completeContent() {
    binState.xp += 20;
    updateXPUI();
    alert("Aula concluída! +20 XP adicionados.");
}

function renderQuiz() {
    const area = document.getElementById('quiz-area');
    area.innerHTML = `
        <p class="small fw-bold">${binState.quiz.q}</p>
        <div class="option mb-2 p-2 border rounded" onclick="check(this, '10')">10</div>
        <div class="option mb-2 p-2 border rounded" onclick="check(this, '01')">01</div>
    `;
}

function check(el, val) {
    if(val === binState.quiz.a) {
        el.classList.add('correct');
        binState.xp += 50;
        updateXPUI();
        alert("Correto! +50 XP");
    } else {
        el.classList.add('incorrect');
    }
}

function updateXPUI() {
    document.getElementById('xp-val').innerText = binState.xp;
    document.getElementById('lvl-val').innerText = Math.floor(binState.xp / 100) + 1;
}

function toggleTeacherView() {
    document.getElementById('view-student').classList.toggle('d-none');
    document.getElementById('view-teacher').classList.toggle('d-none');
}

function saveToDatabase() {
    const q = document.getElementById('in-q').value;
    const a = document.getElementById('in-a').value;
    if(q && a) {
        binState.quiz = { q, a };
        renderQuiz();
        toggleTeacherView();
        alert("Quiz atualizado para a turma!");
    }
}

async function checkProfileAndRender(user) {
    // Simulação de verificação de perfil (Igual à Home)
    const isTeacher = user.email.includes('professor') || user.email.includes('ana');
    
    if (isTeacher) {
        // Mostra visão do professor
        document.getElementById('view-student').classList.add('d-none');
        document.getElementById('view-teacher').classList.remove('d-none');
        document.getElementById('profile-tag').innerText = "PROFESSOR";
    } else {
        // Mostra visão do aluno
        document.getElementById('view-student').classList.remove('d-none');
        document.getElementById('view-teacher').classList.add('d-none');
        document.getElementById('profile-tag').innerText = "ESTUDANTE";
        renderQuiz(); // Carrega o desafio para o aluno
    }
}