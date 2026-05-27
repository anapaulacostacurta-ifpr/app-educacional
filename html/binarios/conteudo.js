const contentIds = ['PzGOAbkw0oZGIwF49RLk', 'uUIao08orXzvdoQivSY2', 'dqnJeS6JVHHutuQwak37'];

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyContents();
        } else {
            // Fallback caso o auth-guard não intercepte
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }
    });

    async function verifyContents(uid){ 
        const db = firebase.firestore();
        const initialArea = document.getElementById('initial-cards');
        const detailedArea = document.getElementById('detailed-cards');
        
        try {
                // Busca todos os documentos em paralelo para maior performance
                const promises = contentIds.map(id => db.collection('contents').doc(id).get());
                const snapshots = await Promise.all(promises);
                
                snapshots.forEach((doc, index) => {
                    if (!doc.exists) return;
                    const d = doc.data();

                    // 1. Renderiza os cards de resumo (Visíveis de cara)
                    // Mostra título e curiosidade para os 2 primeiros conteúdos
                    if (index < 2) {
                        initialArea.innerHTML += `
                            <div class="card card-custom p-4 bg-white">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style="font-size: 0.65rem;">TÓPICO ${index + 1}</span>
                                    <span class="text-success fw-bold small"><i class="fas fa-star me-1"></i>+${d.points} XP</span>
                                </div>
                                <h2 class="h5 fw-bold text-dark">${d.title}</h2>
                                <p class="text-muted small mb-0">${d.curiosity}</p>
                            </div>
                        `;
                    }

                    // 2. Renderiza os cards detalhados (Que ficam ocultos na expansão)
                    detailedArea.innerHTML += `
                        <div class="card card-custom p-4 bg-white border-start border-4 border-primary">
                            <span class="section-label">💡 Saiba mais sobre: ${d.title}</span>
                            <p class="text-secondary small mb-3">${d.did_you_know}</p>
                            
                            <span class="section-label">✍️ Explicação Técnica</span>
                            <div class="text-dark small mb-3" style="line-height: 1.5;">${d.tip}</div>

                            <span class="section-label">🔍 Exemplos</span>
                            <div class="examples-list">
                                ${d.example ? d.example.map(ex => `<div class="example-item">${ex}</div>`).join('') : ''}
                            </div>
                        </div>
                    `;
                });

                document.getElementById('loader').classList.add('d-none');
                document.getElementById('main-content').classList.remove('d-none');

        } catch (err) {
            console.error("Erro ao carregar trilha:", err);
        }
    }
    function expandLesson() {
        document.getElementById('extra-content').classList.add('expanded');
        document.getElementById('btn-container').classList.add('d-none');
        setTimeout(() => {
            document.getElementById('extra-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }

    function completeTask() {
        alert("Sucesso! Você concluiu todos os tópicos desta trilha.");
    }

});

        
        


