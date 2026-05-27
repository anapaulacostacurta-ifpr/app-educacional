// logout.js

/**
 * Função reutilizável para logout do Firebase Authentication.
 * Pode ser usada em qualquer página que precise sair da sessão.
 * Redireciona automaticamente para a tela de login após o logout.
 */

function logout() {
  firebase.auth().signOut()
    .then(() => {
      // Redirecionamento absoluto baseado na origem atual do site
      const loginUrl = `${location.origin}/projetoGamificaEduk/html/login/login.html`;
      console.log("Logout realizado com sucesso.");
      window.location.href = loginUrl;
    })
    .catch(error => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout! Tente novamente.");
    });
}