const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            verifyRanking();
        } else {
            window.location.href = `${location.origin}/app-educacional/html/login/login.html`;
        }
    });
});

function verifiyRanking(){
    db.collection("scoreboards").orderBy("score", "desc").limit(10).get().then(snap => {
        let html = "";
        snap.forEach((doc, i) => {
            const d = doc.data();
            html += `<tr><td>${i+1}°</td><td>${d.nickname || 'Anonimo'}</td><td>${d.score} 🪙</td></tr>`;
        });
        document.getElementById("ranking-body").innerHTML = html;
    });
}