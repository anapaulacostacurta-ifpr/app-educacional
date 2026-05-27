
document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyContents('PzGOAbkw0oZGIwF49RLk');
        } else {
            // Fallback caso o auth-guard não intercepte
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }
    });

    async function verifyContents(uid){ 
        const db = firebase.firestore();
        // Aqui use o ID do documento que você criou no Firebase
        // Supondo que o ID do documento seja 'binarios'
        db.collection('contents').doc(uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                
                // Mapeamento dos Campos
                document.getElementById('title-val').innerText = data.title;
                document.getElementById('level-val').innerText = data.level;
                document.getElementById('points-val').innerText = data.points;
                document.getElementById('curiosity-val').innerText = data.curiosity;
                document.getElementById('didyouknow-val').innerText = data.did_you_know;
                document.getElementById('tip-val').innerText = data.tip;

                // Mapeamento do Array de Exemplos
                if(data.example && Array.isArray(data.example)) {
                    const container = document.getElementById('example-container');
                    container.innerHTML = data.example.map(ex => `
                        <div class="example-box mb-2">${ex}</div>
                    `).join('');
                }

                // Exibe o conteúdo e remove loader
                document.getElementById('loader').classList.add('d-none');
                document.getElementById('content-area').classList.remove('d-none');
            } else {
                document.body.innerHTML = "<p class='p-4'>Lição não encontrada no banco de dados.</p>";
            }
        }).catch(error => {
            console.error("Erro ao carregar do Firestore:", error);
        });
    }

});


