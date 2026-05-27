// Redireciona usuário autenticado para a home
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        window.location.href = "../home/home.html";
    }
});

// Função de login
function login() {
    const emailValid = isEmailValid();
    const passwordValid = isPasswordValid();

    // Corrigido: login só ocorre se ambos forem válidos
    if (emailValid && passwordValid) {
        firebase.auth().signInWithEmailAndPassword(
            form.email().value,
            form.password().value
        ).then(userCredential => {
            const user = userCredential.user;
            console.log("Usuário logado:", user.uid);
        }).catch(error => {
            alert(getErrorMessage(error));
        });
    } else {
        onChangeEmail();
        onChangePassword();
    }
}

// Redireciona para tela de registro
function register() {
    window.location.href = "../register/register.html";
}

// Envia email de recuperação de senha
function recoverPassword() {
    const email = form.email().value;
    if (!email || !validateEmail(email)) {
        alert("Por favor, insira um email válido para recuperar a senha.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert('Email enviado com sucesso');
        }).catch(error => {
            alert(getErrorMessage(error));
        });
}

// Interpreta erros do Firebase
function getErrorMessage(error) {
    switch (error.code) {
        case "auth/user-not-found":
            return "Usuário não encontrado. Verifique o email digitado.";
        case "auth/wrong-password":
            return "Senha incorreta. Tente novamente.";
        case "auth/invalid-email":
            return "O formato do email está inválido.";
        case "auth/invalid-login-credentials":
            // Erro genérico quando email/senha não batem
            return "Credenciais inválidas. Verifique seu email e senha.";
        case "auth/too-many-requests":
            return "Muitas tentativas. Tente novamente mais tarde.";
        default:
            // Fallback para mensagens que não foram mapeadas
            return "Erro ao fazer login: " + error.message;
    }
}

// Validações ao alterar email
function onChangeEmail() {
    toggleButtonsDisable();
    toggleEmailErrors();
}

// Validações ao alterar senha
function onChangePassword() {
    toggleButtonsDisable();
    togglePasswordErrors();
}

// Exibe mensagens de erro de email dinamicamente
function toggleEmailErrors() {
    const email = form.email().value;
    form.emailRequiredError().classList.toggle("visually-hidden", !!email);
    form.emailInvalidError().classList.toggle("visually-hidden", validateEmail(email));
}

// Exibe mensagens de erro de senha dinamicamente
function togglePasswordErrors() {
    const password = form.password().value;
    form.passwordRequiredError().classList.toggle("visually-hidden", !!password);
}

// Ativa ou desativa botões com base na validade dos campos
function toggleButtonsDisable() {
    const emailValid = isEmailValid();
    const passwordValid = isPasswordValid();

    form.recoverPasswordButton().disabled = !emailValid;
    form.loginButton().disabled = !(emailValid && passwordValid);
}

// Verifica se o email está em formato válido
function isEmailValid() {
    const email = form.email().value;
    return !!email && validateEmail(email);
}

// Verifica se há senha preenchida
function isPasswordValid() {
    return !!form.password().value;
}

// Regex simples para validar email
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

// Mapeamento de elementos HTML
const form = {
    email: () => document.getElementById("email"),
    password: () => document.getElementById("password"),
    loginButton: () => document.getElementById("login-button"),
    recoverPasswordButton: () => document.getElementById("recover-password-button"),
    emailRequiredError: () => document.getElementById("email-required-error"),
    emailInvalidError: () => document.getElementById("email-invalid-error"),
    passwordRequiredError: () => document.getElementById("password-required-error")
};
