// quiz.js - Lógica de Desafios e Puzzles

// Lista de UIDs das questões (Adicione os IDs do seu Firestore aqui)
const questionIds = ['72ALJlqfXNsgrB10TgKn', '0pfahasf6Q8Bs660sgCH']; 

let questionsData = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) loadAllQuestions();
    });
});

async function loadAllQuestions() {
    const db = firebase.firestore();
    try {
        const promises = questionIds.map(id => db.collection('questions').doc(id).get());
        const snapshots = await Promise.all(promises);
        
        questionsData = snapshots.map(doc => ({ id: doc.id, ...doc.data() }));
        
        renderQuestion();
        
        document.getElementById('loader').classList.add('d-none');
        document.getElementById('quiz-container').classList.remove('d-none');
    } catch (err) {
        console.error("Erro ao carregar questões:", err);
    }
}

function renderQuestion() {
    const q = questionsData[currentIndex];
    
    document.getElementById('lvl-tag').innerText = `NÍVEL ${q.level}`;
    document.getElementById('points-val').innerText = q.points;
    document.getElementById('pre-text-val').innerText = q.pre_text;
    document.getElementById('question-text-val').innerText = q.text;
    document.getElementById('current-idx').innerText = currentIndex + 1;
    document.getElementById('total-idx').innerText = questionsData.length;

    // Warning dinâmico
    const warningEl = document.getElementById('warning-val');
    if (q.warning) {
        warningEl.querySelector('span').innerText = q.warning;
        warningEl.classList.remove('d-none');
    } else {
        warningEl.classList.add('d-none');
    }

    // Limpa campos
    document.getElementById('user-answer').value = "";
    document.getElementById('feedback').classList.add('d-none');
    document.getElementById('btn-submit').disabled = false;
}

function validatePuzzle() {
    const q = questionsData[currentIndex];
    const userAnswer = document.getElementById('user-answer').value;
    const feedback = document.getElementById('feedback');
    const btn = document.getElementById('btn-submit');

    if (!userAnswer) return alert("Por favor, digite uma resposta!");

    feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

    // Nota: Certifique-se de que o campo 'answer' exista no Firestore com o valor decimal correto
    if (userAnswer == q.answer) {
        feedback.innerText = `🎉 Resposta Correta! Você ganhou ${q.points} XP.`;
        feedback.classList.add('alert-success');
        btn.disabled = true;
        
        updateXP(q.points);

        // Avança para a próxima se existir
        if (currentIndex < questionsData.length - 1) {
            setTimeout(() => {
                currentIndex++;
                renderQuestion();
            }, 3000);
        }
    } else {
        feedback.innerText = `❌ Incorreto! Você perdeu ${q.lose_points} XP pela tentativa. Revise os bits!`;
        feedback.classList.add('alert-danger');
        updateXP(-q.lose_points);
    }
}

function updateXP(val) {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    
    // Atualiza o scoreboard do aluno
    db.collection("scoreboards").doc(user.uid).set({
        score: firebase.firestore.FieldValue.increment(val),
        lastChallenge: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}