const contentIds = ['PzGOAbkw0oZGIwF49RLk', 'uUIao08orXzvdoQivSY2', 'dqnJeS6JVHHutuQwak37'];
let totalXP = 0;
const completedTasks = new Set(); // Para evitar ganhar pontos 2x no mesmo card

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyContents();
        } else {
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }
    });
});

async function verifyContents() {
    const db = firebase.firestore();
    const container = document.getElementById('cards-container');
    
    try {
        const promises = contentIds.map(id => db.collection('contents').doc(id).get());
        const snapshots = await Promise.all(promises);
        
        container.innerHTML = ""; // Limpa container

        snapshots.forEach((doc) => {
            if (!doc.exists) return;
            const d = doc.data();
            const id = doc.id;

            // Template do Card Individual
            container.innerHTML += `
                <div class="card card-custom p-4 bg-white" id="card-${id}">
                    <!-- Header -->
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary-subtle text-primary px-2 py-1" style="font-size: 0.6rem;">NÍVEL ${d.level || 1}</span>
                        <span class="text-success fw-bold small"><i class="fas fa-star me-1"></i>+${d.points} XP</span>
                    </div>

                    <!-- Resumo (Sempre visível) -->
                    <h2 class="h5 fw-bold text-dark mb-1">${d.title}</h2>
                    <p class="text-muted small mb-3">${d.curiosity}</p>

                    <!-- Botão Expansão -->
                    <div class="d-flex gap-2" id="actions-${id}">
                        <button class="btn btn-outline-primary btn-round px-3" onclick="toggleCard('${id}', true)" id="btn-expand-${id}">
                            Ver detalhes <i class="fas fa-chevron-down ms-1"></i>
                        </button>
                    </div>

                    <!-- Conteúdo Detalhado (Oculto por padrão) -->
                    <div class="details-wrapper" id="details-${id}">
                        <span class="section-label">💡 Você sabia?</span>
                        <p class="text-secondary small mb-3">${d.did_you_know}</p>

                        <span class="section-label">✍️ Explicação Técnica</span>
                        <div class="text-dark small mb-3" style="line-height: 1.5;">${d.tip}</div>

                        <span class="section-label">🔍 Exemplos</span>
                        <div class="mb-4">
                            ${d.example ? d.example.map(ex => `<div class="example-item">${ex}</div>`).join('') : ''}
                        </div>

                        <!-- Botões de Ação do Detalhe -->
                        <div class="d-flex justify-content-between gap-2 border-top pt-3">
                            <button class="btn btn-light btn-round text-muted" onclick="toggleCard('${id}', false)">
                                <i class="fas fa-chevron-up me-1"></i> Recolher
                            </button>
                            <button class="btn btn-success btn-round px-4" onclick="markComplete('${id}', ${d.points})">
                                Concluir Tópico <i class="fas fa-check ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        document.getElementById('loader').classList.add('d-none');
        document.getElementById('main-content').classList.remove('d-none');

    } catch (err) {
        console.error("Erro ao carregar:", err);
    }
}

// Função para Expandir/Recolher individualmente
function toggleCard(id, expand) {
    const details = document.getElementById(`details-${id}`);
    const btnExpand = document.getElementById(`btn-expand-${id}`);

    if (expand) {
        details.classList.add('expanded');
        btnExpand.classList.add('d-none'); // Esconde o "Ver mais" enquanto está aberto
    } else {
        details.classList.remove('expanded');
        btnExpand.classList.remove('d-none'); // Mostra o "Ver mais" ao fechar
    }
}

/**
 * Marca o tópico como concluído, aplica feedback visual e sincroniza XP no Firestore.
 */
async function markComplete(id, points) {
    if (completedTasks.has(id)) {
        alert("Você já concluiu este tópico!");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();

    try {
        // 1. Busca dados de perfil do aluno para manter consistência no ranking
        const userDoc = await db.collection("users").doc(user.uid).get();
        let userName = "Estudante";
        let userNickname = "Player";

        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData.name || "Estudante";
            userNickname = userData.nickname || userData.name || "Player";
        }

        // 2. Registra a conclusão no Firestore seguindo seus requisitos de campos
        await db.collection("scoreboards").doc(user.uid).set({
            uid: user.uid,
            name: userName,
            nickname: userNickname,
            score: firebase.firestore.FieldValue.increment(Number(points)),
            lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
            // Campo opcional para controle de leitura:
            lastTopicCompleted: id 
        }, { merge: true });

        // 3. Atualização da Interface (Feedback Local)
        completedTasks.add(id);
        totalXP += points;

        const card = document.getElementById(`card-${id}`);
        if (card) card.classList.add('completed-card');
        
        // Recolhe o card e altera o botão
        toggleCard(id, false); 
        const btn = document.getElementById(`btn-expand-${id}`);
        if (btn) {
            btn.innerHTML = `Concluído <i class="fas fa-check-circle ms-1"></i>`;
            btn.className = "btn btn-success btn-round px-3 disabled";
        }

        alert(`Parabéns! +${points} XP adicionados à sua conta.`);

    } catch (error) {
        console.error("Erro ao salvar conclusão do tópico:", error);
        alert("Erro ao salvar progresso. Verifique sua conexão.");
    }
}