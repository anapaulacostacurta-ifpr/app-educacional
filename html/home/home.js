// home.js

/**
 * Este script detecta o usuário autenticado e redireciona para a home correta com base no perfil (player, host).
 * Usa location.origin para garantir caminhos absolutos consistentes, mesmo em subpastas ou em produção (GitHub Pages).
 */

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      // Usuário não autenticado → redirecionar para login absoluto
      window.location.href = `${location.origin}/projetoGamificaEduk/html/login/login.html`;
      return;
    }
        
  })
})
