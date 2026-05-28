// caca_palavras.js

const gridData = [
    ['Q', 'B', 'I', 'T', 'W', 'B'],
    ['B', 'A', 'K', 'O', 'E', 'A'],
    ['Y', 'X', 'U', 'M', 'R', 'S'],
    ['T', 'S', 'O', 'M', 'A', 'E'],
    ['E', 'Z', 'E', 'R', 'O', 'Y']
];

const targetWords = {
    "BIT":  [[0,1], [0,2], [0,3]],
    "BYTE": [[1,0], [2,0], [3,0], [4,0]],
    "BASE": [[0,5], [1,5], [2,5], [3,5]],
    "SOMA": [[3,1], [3,2], [3,3], [3,4]],
    "ZERO": [[4,1], [4,2], [4,3], [4,4]], 
    "UM":   [[2,2], [2,3]]
};

let selectedCells = [];
let foundWords = [];

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            buildGrid();
        } else {
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }
    });
});    

function buildGrid() {
    const table = document.getElementById("wordsearch-grid");
    let html = "";
    for (let r = 0; r < gridData.length; r++) {
        html += "<tr>";
        for (let c = 0; c < gridData[r].length; c++) {
            html += `<td id="cell-${r}-${c}" class="grid-td" onclick="handleCellClick(${r}, ${c})">${gridData[r][c]}</td>`;
        }
        html += "</tr>";
    }
    table.innerHTML = html;
}

function handleCellClick(r, c) {
    const cellId = `cell-${r}-${c}`;
    const el = document.getElementById(cellId);
    
    // Toggle seleção
    const alreadySelectedIdx = selectedCells.findIndex(item => item.r === r && item.c === c);
    if (alreadySelectedIdx >= 0) {
        selectedCells.splice(alreadySelectedIdx, 1);
        el.classList.remove("selected");
    } else {
        selectedCells.push({ r, c });
        el.classList.add("selected");
    }

    checkWords();
}

function checkWords() {
    for (let word in targetWords) {
        if (foundWords.includes(word)) continue;

        const wordCoords = targetWords[word];
        // Verifica se todas as coordenadas da palavra alvo estão na lista de selecionadas pelo aluno
        const isMatch = wordCoords.every(coord => 
            selectedCells.some(sel => sel.r === coord[0] && sel.c === coord[1])
        );

        if (isMatch) {
            markWordAsFound(word, wordCoords);
        }
    }
}

function markWordAsFound(word, coords) {
    foundWords.push(word);
    
    // Atualiza Visual da Lista
    const badge = document.getElementById(`w-${word}`);
    badge.classList.add("word-found");

    // Fixa as letras no grid
    coords.forEach(c => {
        const el = document.getElementById(`cell-${c[0]}-${c[1]}`);
        el.classList.remove("selected");
        el.classList.add("found");
    });

    // Limpa seleção temporária
    selectedCells = [];

    // Fim de jogo?
    if (foundWords.length === Object.keys(targetWords).length) {
        document.getElementById("game-feedback").classList.remove("d-none");
        saveXP(20);
    }
}

async function saveXP(amount) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();

    try {
        // 1. Busca os dados de perfil para manter o ranking consistente
        const userDoc = await db.collection("users").doc(user.uid).get();
        let userName = "Estudante";
        let userNickname = "Player";

        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData.name || "Estudante";
            userNickname = userData.nickname || userData.name || "Player";
        }

        // 2. Grava/Incrementa na coleção scoreboards
        await db.collection("scoreboards").doc(user.uid).set({
            uid: user.uid,
            name: userName,
            nickname: userNickname,
            // Incrementa o score atual com o novo valor (ex: +20)
            score: firebase.firestore.FieldValue.increment(Number(amount)),
            // Alinhado com seu requisito anterior
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`🎉 Sucesso: +${amount} XP adicionados ao scoreboard.`);

    } catch (error) {
        console.error("Erro ao sincronizar XP do Caça-palavras:", error);
    }
}