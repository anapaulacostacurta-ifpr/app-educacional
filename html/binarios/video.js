// video.js - Lógica de Recompensa de Vídeo

const RECOMPENSA_XP = 10;
const db = firebase.firestore();

function markAsWatched() {
    const user = firebase.auth().currentUser;
    const btn = document.getElementById('btn-mark-watched');
    const feedback = document.getElementById('watched-feedback');

    if (!user) return;

    // 1. Desabilita o botão para evitar cliques múltiplos
    btn.disabled = true;
    btn.innerText = "Sincronizando XP...";

    // 2. Registra o progresso no Firestore (Coleção scoreboards)
    db.collection("scoreboards").doc(user.uid).set({
        score: firebase.firestore.FieldValue.increment(RECOMPENSA_XP),
        lastVideoWatched: firebase.firestore.FieldValue.serverTimestamp(),
        videoBinariosCompleted: true
    }, { merge: true }).then(() => {
        // 3. Feedback Visual de Sucesso
        btn.innerHTML = `<i class="fas fa-check"></i> VÍDEO CONCLUÍDO`;
        btn.classList.add('watched', 'disabled');
        feedback.classList.remove('d-none');
        
        console.log("XP de vídeo aula sincronizado com sucesso.");
    }).catch(error => {
        console.error("Erro ao salvar progresso:", error);
        btn.disabled = false;
        btn.innerText = "Tentar novamente";
    });
}