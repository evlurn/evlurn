'use strict';

(function init() {
  const form = document.getElementById('form-cadastro');
  const alertaArea = document.getElementById('alerta-area');
  const btn = document.getElementById('btn-cadastrar');
  const buscaIndicador = document.getElementById('indicador-busca');
  const listaSugestoes = document.getElementById('sugestoes-lista');
  const indicadorSelecionadoArea = document.getElementById('indicador-selecionado');
  const selectGenero = document.getElementById('identidade_genero');
  const divGeneroExpande = document.getElementById('genero-expande');
  const selectGeneroOutro = document.getElementById('identidade_genero_outro');

  let indicadorId = null;
  let debounceTimer = null;

  // Lógica de expansão de gênero
  selectGenero.addEventListener('change', () => {
    if (selectGenero.value === 'Outros') {
      divGeneroExpande.style.display = '';
      selectGeneroOutro.required = true;
    } else {
      divGeneroExpande.style.display = 'none';
      selectGeneroOutro.required = false;
      selectGeneroOutro.value = '';
    }
  });

  // Busca de indicador (autocomplete)
  buscaIndicador.addEventListener('input', () => {
    indicadorId = null;
    clearTimeout(debounceTimer);
    const termo = buscaIndicador.value.trim();
    if (termo.length < 2) { listaSugestoes.style.display = 'none'; return; }
    debounceTimer = setTimeout(async () => {
      try {
        const { resultados } = await api('GET', `/api/indicadores/buscar?q=${encodeURIComponent(termo)}`);
        if (!resultados.length) { listaSugestoes.style.display = 'none'; return; }
        listaSugestoes.innerHTML = resultados
          .map((r) => `<div class="sugestoes-item" data-id="${r.id}" data-nome="${r.nome}" data-apelido="${r.apelido}">
            ${r.nome} <span style="color:#6E6E6E;">@${r.apelido}</span>
          </div>`)
          .join('');
        listaSugestoes.style.display = 'block';
      } catch (e) { /* silencioso */ }
    }, 250);
  });

  listaSugestoes.addEventListener('click', (ev) => {
    const item = ev.target.closest('.sugestoes-item');
    if (!item) return;
    indicadorId = Number(item.dataset.id);
    indicadorSelecionadoArea.style.display = 'block';
    indicadorSelecionadoArea.innerHTML = `
      <div class="indicador-selecionado">
        <span>Indicado por <strong>${item.dataset.nome}</strong> (@${item.dataset.apelido})</span>
        <button type="button" class="btn btn-fantasma btn-pequeno" id="btn-remover-indicador">remover</button>
      </div>`;
    buscaIndicador.value = '';
    listaSugestoes.style.display = 'none';
    document.getElementById('btn-remover-indicador').addEventListener('click', () => {
      indicadorId = null;
      indicadorSelecionadoArea.style.display = 'none';
    });
  });

  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.sugestoes')) listaSugestoes.style.display = 'none';
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    alertaArea.innerHTML = '';

    if (form.senha.value !== form.confirmarSenha.value) {
      alertaArea.innerHTML = '<div class="alerta alerta-erro">As senhas não coincidem.</div>';
      return;
    }

    if (selectGenero.value === 'Outros' && !selectGeneroOutro.value) {
      alertaArea.innerHTML = '<div class="alerta alerta-erro">Selecione sua identidade de gênero ou escolha "Prefiro não informar".</div>';
      return;
    }

    // Determina o valor final de identidade de gênero a enviar
    let identidadeGenero = selectGenero.value || null;
    let identidadeGeneroOutro = null;
    if (selectGenero.value === 'Outros' && selectGeneroOutro.value) {
      identidadeGeneroOutro = selectGeneroOutro.value;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const { mensagem } = await api('POST', '/api/auth/register', {
        nome: form.nome.value.trim(),
        apelido: form.apelido.value.trim(),
        senha: form.senha.value,
        confirmarSenha: form.confirmarSenha.value,
        dataNascimento: form.data_nascimento.value || null,
        identidadeGenero,
        identidadeGeneroOutro,
        indicadorId,
      });

      alertaArea.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
      form.reset();
      selectGenero.value = '';
      divGeneroExpande.style.display = 'none';
      indicadorSelecionadoArea.style.display = 'none';
      btn.textContent = 'Conta criada ✓';

      // Redireciona para login após 3 segundos
      setTimeout(() => { window.location.href = '/login.html?novo=1'; }, 3000);

    } catch (e) {
      alertaArea.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
      btn.disabled = false;
      btn.textContent = 'Criar conta';
    }
  });
})();
