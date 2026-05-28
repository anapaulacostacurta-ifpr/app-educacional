// quiz.js - Lógica de Puzzles com Respostas em Coleção Separada

const questionIds = ['72ALJlqfXNsgrB10TgKn', '0pfahasf6Q8Bs660sgCH']; 

let questionsData = [];
let currentIndex = 0;
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) loadFullChallenge();
    });
});

/**
 * Busca o Enunciado (questions) e a Resposta (puzzles)
 */
async function loadFullChallenge() {
    try {
        const fullDataPromises = questionIds.map(async (id) => {
            // 1. Busca o enunciado
            const qDoc = await db.collection('questions').doc(id).get();
            const qData = qDoc.data();

            // 2. Busca a resposta na coleção 'puzzles' onde question_id é igual ao ID da questão
            const pQuery = await db.collection('puzzles').where('question_id', '==', id).limit(1).get();
            
            let answer = null;
            if (!pQuery.empty) {
                answer = pQuery.docs[0].data().answer; // Coleta o campo "26", por exemplo
            }

            return { 
                id, 
                ...qData, 
                correctAnswer: answer 
            };
        });

        questionsData = await Promise.all(fullDataPromises);
        
        renderQuestion();
        
        document.getElementById('loader').classList.add('d-none');
        document.getElementById('quiz-container').classList.remove('d-none');
    } catch (err) {
        console.error("Erro ao carregar desafio completo:", err);
    }
}

function renderQuestion() {
    const q = questionsData[currentIndex];
    if(!q) return;

    // Preenchimento dos campos do HTML
    document.getElementById('lvl-tag').innerText = `NÍVEL ${q.level || 1}`;
    document.getElementById('points-val').innerText = q.points || 0;
    document.getElementById('pre-text-val').innerText = q.pre_text || "";
    document.getElementById('question-text-val').innerText = q.text || "";
    document.getElementById('current-idx').innerText = currentIndex + 1;
    document.getElementById('total-idx').innerText = questionsData.length;

    const warningEl = document.getElementById('warning-val');
    if (q.warning) {
        warningEl.querySelector('span').innerText = q.warning;
        warningEl.classList.remove('d-none');
    } else {
        warningEl.classList.add('d-none');
    }

    // Reset de Interface
    document.getElementById('user-answer').value = "";
    document.getElementById('feedback').classList.add('d-none');
    document.getElementById('btn-submit').disabled = false;
}

function validatePuzzle() {
    const q = questionsData[currentIndex];
    const userAnswer = document.getElementById('user-answer').value.trim();
    const feedback = document.getElementById('feedback');
    const btn = document.getElementById('btn-submit');

    if (!userAnswer) return alert("Por favor, digite uma resposta!");

    feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

    // Compara com a resposta vinda da coleção 'puzzles'
    if (userAnswer === q.correctAnswer) {
        feedback.innerHTML = `<strong>🎉 Porta Correta!</strong> Você decifrou o enigma e ganhou ${q.points} XP.`;
        feedback.className = "alert alert-success mb-4 d-block";
        btn.disabled = true;
        
        updateScoreboard(q.points);

        // Avança para a próxima se houver
        if (currentIndex < questionsData.length - 1) {
            setTimeout(() => {
                currentIndex++;
                renderQuestion();
            }, 3000);
        }
    } else {
        feedback.innerHTML = `<strong>❌ Porta Errada!</strong> O sistema de segurança bloqueou o acesso. Você perdeu ${q.lose_points} XP.`;
        feedback.className = "alert alert-danger mb-4 d-block";
        updateScoreboard(-q.lose_points);
    }
}

/**
 * Sincroniza o resultado do Quiz/Puzzle com a coleção principal de ranking.
 * Garante que todos os campos obrigatórios (uid, name, nickname) sejam preenchidos.
 */
async function updateScoreboard(val) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();

    try {
        // 1. Coleta dados de perfil na coleção 'users' para evitar nomes em branco no ranking
        const userDoc = await db.collection("users").doc(user.uid).get();
        let userName = "Estudante";
        let userNickname = "Player";

        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData.name || "Estudante";
            userNickname = userData.nickname || userData.name || "Player";
        }

        // 2. Sincroniza com a coleção principal 'scoreboards'
        await db.collection("scoreboards").doc(user.uid).set({
            uid: user.uid,
            name: userName,
            nickname: userNickname,
            // Soma o XP (positivo ou negativo) de forma segura no servidor
            score: firebase.firestore.FieldValue.increment(Number(val)),
            // Define o timestamp da última jogada/atividade
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
            // Campo específico para rastreio de puzzles (opcional)
            lastPuzzleSolved: firebase.firestore.FieldValue.serverTimestamp() 
        }, { merge: true });

        console.log(`✅ Scoreboard atualizado: ${val > 0 ? '+' : ''}${val} XP para o aluno.`);

    } catch (error) {
        console.error("Erro ao atualizar o scoreboard no Quiz:", error);
    }
}