'use strict';

(async function init() {
  // Exibe mensagem de sucesso se veio do cadastro
  if (new URLSearchParams(window.location.search).get('novo') === '1') {
    const alertaArea = document.getElementById('alerta-area');
    if (alertaArea) {
      alertaArea.innerHTML = '<div class="alerta alerta-sucesso">Cadastro enviado! Aguarde a aprovação de um administrador para acessar.</div>';
    }
  }

  // Se já está logado, manda direto para a tela certa.
  try {
    const { usuario } = await api('GET', '/api/auth/me');
    window.location.href = usuario.admin ? '/admin.html' : '/app.html';
    return;
  } catch (e) { /* não está logado, segue para o formulário */ }

  const form = document.getElementById('form-login');
  const alertaArea = document.getElementById('alerta-area');
  const btn = document.getElementById('btn-entrar');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    alertaArea.innerHTML = '';
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    try {
      const { usuario } = await api('POST', '/api/auth/login', {
        apelido: form.apelido.value.trim(),
        senha: form.senha.value,
      });
      window.location.href = usuario.admin ? '/admin.html' : '/app.html';
    } catch (e) {
      alertaArea.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
})();
