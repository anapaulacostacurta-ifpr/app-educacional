// jogo.js - Lógica da Missão Prática Binária

let db = firebase.firestore();
let currentUser = null;
let currentTargetDecimal = 0;
let phase = 1;
let phase_total = 10;
let coins = 0;
let totalAttempts = 0;
let correctAttempts = 0;

// Inicializa Autenticação
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        //loadPlayerProgress();
        while (phase <=phase_total){
            generateNewChallenge();
        }
    } else {
        window.location.href = "../login/login.html";
    }
});

function loadPlayerProgress() {
    db.collection("scoreboards").doc(currentUser.uid).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            coins = data.score || 0;
            phase = data.phasesCompleted || 1;
            document.getElementById("player-coins").innerText = coins;
            document.getElementById("current-phase").innerText = phase;
        }
    });
}

function toggleBit(bitId) {
    const btn = document.getElementById(bitId);
    if (btn.innerText === "0") {
        btn.innerText = "1";
        btn.classList.replace("btn-outline-dark", "btn-dark");
    } else {
        btn.innerText = "0";
        btn.classList.replace("btn-dark", "btn-outline-dark");
    }
    updatePreview();
}

function updatePreview() {
    const b3 = document.getElementById("bit3").innerText;
    const b2 = document.getElementById("bit2").innerText;
    const b1 = document.getElementById("bit1").innerText;
    const b0 = document.getElementById("bit0").innerText;
    
    const binaryStr = b3 + b2 + b1 + b0;
    const decimalVal = parseInt(binaryStr, 2);

    document.getElementById("binary-preview").innerText = binaryStr;
    document.getElementById("decimal-preview").innerText = decimalVal;
}

function generateNewChallenge() {
    // Reseta botões
    ['bit3', 'bit2', 'bit1', 'bit0'].forEach(id => {
        const btn = document.getElementById(id);
        btn.innerText = "0";
        btn.classList.remove("btn-dark");
        btn.classList.add("btn-outline-dark");
    });
    
    // Aumenta dificuldade baseada na fase
    let max = phase <= 3 ? 7 : 15; 
    currentTargetDecimal = Math.floor(Math.random() * max) + 1;
    
    document.getElementById("decimal-target").innerText = currentTargetDecimal;
    updatePreview();
}

function checkAnswer() {
    totalAttempts++;
    const currentDecimalPreview = parseInt(document.getElementById("decimal-preview").innerText);
    const feedback = document.getElementById("game-feedback");
    
    feedback.classList.remove("d-none", "alert-success", "alert-danger");

    if (currentDecimalPreview === currentTargetDecimal) {
        correctAttempts++;
        coins += 10; 
        phase++; 
        
        feedback.innerHTML = `<strong>🎉 Acertou!</strong> Você decodificou o número. <br>+10 Moedas adicionadas!`;
        feedback.className = "alert alert-success mt-3 p-3 d-block";
        
        document.getElementById("player-coins").innerText = coins;
        document.getElementById("current-phase").innerText = phase;

        saveScoreboardData();
        setTimeout(generateNewChallenge, 2000);
    } else {
        feedback.innerHTML = `<strong>❌ Incorreto!</strong> Lembre-se: o 1º bit vale 1, o 2º vale 2, o 3º vale 4 e o 4º vale 8.`;
        feedback.className = "alert alert-danger mt-3 p-3 d-block";
    }
}

function saveScoreboardData() {
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
    
    // Sincroniza com a coleção scoreboard usada no ranking
    db.collection("scoreboards").doc(currentUser.uid).set({
        score: coins,
        phasesCompleted: phase,
        accuracy: accuracy,
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}