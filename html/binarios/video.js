// video.js - Lógica de Recompensa de Vídeo

const RECOMPENSA_XP = 10;
const db = firebase.firestore();

/**
 * Registra que o vídeo foi assistido, atribui XP e sincroniza com o Ranking Global.
 */
async function markAsWatched() {
    const user = firebase.auth().currentUser;
    const btn = document.getElementById('btn-mark-watched');
    const feedback = document.getElementById('watched-feedback');

    if (!user) return;

    // 1. Bloqueio de segurança na interface
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> SALVANDO...`;

    try {
        // 2. Busca dados biográficos na coleção 'users'
        const userDoc = await db.collection("users").doc(user.uid).get();
        let userName = "Estudante";
        let userNickname = "Player";

        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData.name || "Estudante";
            userNickname = userData.nickname || userData.name || "Player";
        }

        // 3. Sincroniza com a coleção oficial 'scoreboards'
        await db.collection("scoreboards").doc(user.uid).set({
            uid: user.uid,
            name: userName,
            nickname: userNickname,
            score: firebase.firestore.FieldValue.increment(Number(RECOMPENSA_XP)),
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp(), // Campo padrão temporal
            videoBinariosCompleted: true // Flag de progresso pedagógico
        }, { merge: true });

        // 4. Feedback Visual de Conclusão
        btn.innerHTML = `<i class="fas fa-check-circle me-2"></i> VÍDEO CONCLUÍDO`;
        btn.classList.add('btn-success', 'disabled');
        btn.classList.remove('btn-outline-primary');
        feedback.classList.remove('d-none');
        
        console.log("XP de vídeo aula sincronizado com sucesso para:", userName);

    } catch (error) {
        console.error("Erro ao salvar progresso do vídeo:", error);
        btn.disabled = false;
        btn.innerText = "Tentar novamente";
        alert("Erro de conexão ao salvar seu XP.");
    }
}