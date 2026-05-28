const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    // Garante que o Firebase está inicializado antes de buscar
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadLeaderboard();
            loadPerformanceMetrics();
        }
    });
});

/**
 * 1. Carrega o Ranking de Líderes (Top 10)
 * Ordenado por Score (Pontos)
 */
async function loadLeaderboard() {
    const rankingBody = document.getElementById("ranking-body");

    // Placeholder de carregamento
    rankingBody.innerHTML = `<tr><td colspan="3" class="text-center opacity-50">Sincronizando...</td></tr>`;

    db.collection("scoreboards")
        .orderBy("score", "desc")
        .limit(10)
        .get()
        .then((querySnapshot) => {
            let html = "";
            let pos = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Estilo para o Top 3
                const rowClass = pos <= 3 ? "table-warning fw-bold" : "";
                const medal = pos === 1 ? "🥇" : (pos === 2 ? "🥈" : (pos === 3 ? "🥉" : pos + "°"));

                html += `
                    <tr class="${rowClass}">
                        <td>${medal}</td>
                        <td>${data.nickname || data.name || "Jogador"}</td>
                        <td class="text-end text-success font-monospace">${data.score || 0} 🪙</td>
                    </tr>`;
                pos++;
            });

            rankingBody.innerHTML = html || `<tr><td colspan="3" class="text-center">Sem dados.</td></tr>`;
        })
        .catch((error) => {
            console.error("Erro ao carregar ranking:", error);
            rankingBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Erro de conexão.</td></tr>`;
        });
}

/**
 * 2. Carrega a Precisão da Turma
 * Mostra a porcentagem de acertos de cada aluno
 */
async function loadPerformanceMetrics() {

    const performanceList = document.getElementById("performance-list");

    performanceList.innerHTML = `<p class="text-center opacity-50">Calculando métricas...</p>`;

    db.collection("scoreboards")
        .orderBy("name", "asc")
        .get()
        .then((querySnapshot) => {
            let html = '<div class="list-group list-group-flush">';

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const acc = data.accuracy || 0;
                
                // Define cor baseada no desempenho (Learning Analytics)
                let barColor = "bg-danger";
                if (acc >= 70) barColor = "bg-success";
                else if (acc >= 50) barColor = "bg-warning";

                html += `
                    <div class="list-group-item border-0 px-0 pb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="fw-bold text-dark">${data.name || "Estudante"}</span>
                            <span class="badge ${barColor} text-white">${acc}% acerto</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${barColor}" role="progressbar" style="width: ${acc}%"></div>
                        </div>
                    </div>`;
            });

            html += '</div>';
            performanceList.innerHTML = html || `<p class="text-center">Nenhum dado analítico.</p>`;
        })
        .catch((error) => {
            console.error("Erro ao carregar performance:", error);
            performanceList.innerHTML = `<p class="text-center text-danger small">Erro ao carregar métricas.</p>`;
        });
}