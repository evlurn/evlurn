'use strict';

let adminEstado = { jogos: [] };

function trocarSecaoAdmin(secao) {
  ['dashboard', 'pendentes', 'usuarios', 'rodadas', 'ranking', 'logs'].forEach((s) => {
    document.getElementById(`secao-${s}`).style.display = s === secao ? '' : 'none';
  });
  document.querySelectorAll('.nav-item[data-secao]').forEach((el) => {
    el.classList.toggle('ativo', el.dataset.secao === secao);
  });
  const carregadores = {
    dashboard: carregarDashboard,
    pendentes: carregarPendentes,
    usuarios: carregarUsuarios,
    rodadas: carregarRodadas,
    ranking: carregarRankingAdmin,
    logs: carregarLogs,
  };
  carregadores[secao]();
}

const TIPO_ACAO_LABEL = {
  cadastro_enviado: 'Cadastro enviado',
  cadastro_aprovado: 'Cadastro aprovado',
  cadastro_rejeitado: 'Cadastro rejeitado',
  login: 'Login',
  logout: 'Logout',
  aposta_realizada: 'Aposta realizada',
  rodada_criada: 'Rodada criada',
  rodada_encerrada: 'Rodada encerrada',
  bonus_indicacao: 'Bônus de indicação',
  ajuste_admin: 'Ajuste administrativo',
  ajuste_config: 'Configuração alterada',
  sistema: 'Sistema',
};

// ---------------- DASHBOARD ----------------
const NOMES_JOGOS = {
  roleta_primal: 'Roleta Primal',
  joga_moeda: 'Joga a Moeda',
  cofre_misterioso: 'Cofre Misterioso',
  sobreviveu_ou_nao: 'Sobreviveu ou Não',
};

async function carregarDashboard() {
  const d = await api('GET', '/api/admin/dashboard');
  document.getElementById('dash-stats').innerHTML = `
    <div class="card"><div class="stat-label">Jogadores ativos</div><div class="stat-valor numero">${d.ativos}</div></div>
    <div class="card"><div class="stat-label">Cadastros pendentes</div><div class="stat-valor numero">${d.pendentes}</div></div>
    <div class="card"><div class="stat-label">Moedas em circulação</div><div class="stat-valor numero verde">${formatarMoeda(d.moedasEmCirculacao)}</div></div>
    <div class="card"><div class="stat-label">Rodadas abertas</div><div class="stat-valor numero">${d.rodadasAbertas}</div></div>
  `;
  document.getElementById('cfg-saldo-inicial').value = d.saldoInicial;
  document.getElementById('cfg-bonus').value = d.bonusIndicacao;
  document.getElementById('cfg-scheduler-ativo').checked = d.schedulerAtivo;
  document.getElementById('cfg-intervalo').value = d.schedulerIntervaloMin;

  const statusEl = document.getElementById('scheduler-status');
  statusEl.innerHTML = d.schedulerAtivo
    ? `<span style="color:#1FAE63;">● Ativo</span> — rodadas de <strong>${d.schedulerIntervaloMin} min</strong>, alinhadas ao relógio. Só abre se houver usuário na tela do jogo.`
    : `<span style="color:#6E6E6E;">● Inativo</span> — rodadas abertas e fechadas manualmente pela aba Rodadas.`;

  const todosJogos = Object.keys(NOMES_JOGOS);
  document.getElementById('cfg-jogos-scheduler').innerHTML = todosJogos.map((j) => `
    <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; background:var(--bg-elevado); border:1px solid var(--borda); padding:6px 12px; border-radius:999px;">
      <input type="checkbox" data-jogo-scheduler="${j}" ${d.schedulerJogos.includes(j) ? 'checked' : ''} style="width:auto; accent-color:#1FAE63;">
      ${NOMES_JOGOS[j]}
    </label>`).join('');
}

document.addEventListener('click', async (ev) => {
  if (ev.target.id === 'btn-salvar-config') {
    try {
      await api('POST', '/api/admin/config', {
        saldoInicial: Number(document.getElementById('cfg-saldo-inicial').value),
        bonusIndicacao: Number(document.getElementById('cfg-bonus').value),
      });
      toast('Configurações salvas.', 'sucesso');
    } catch (e) { toast(e.message, 'erro'); }
  }

  if (ev.target.id === 'btn-salvar-scheduler') {
    const jogos = [...document.querySelectorAll('[data-jogo-scheduler]:checked')]
      .map((el) => el.dataset.jogoScheduler);
    try {
      await api('POST', '/api/admin/config', {
        schedulerAtivo: document.getElementById('cfg-scheduler-ativo').checked,
        schedulerIntervaloMin: Number(document.getElementById('cfg-intervalo').value),
        schedulerJogos: jogos,
      });
      toast('Rodadas automáticas configuradas.', 'sucesso');
      carregarDashboard();
    } catch (e) { toast(e.message, 'erro'); }
  }
});

// ---------------- PENDENTES ----------------
async function carregarPendentes() {
  const { pendentes } = await api('GET', '/api/admin/pendentes');
  const tabela = document.getElementById('pendentes-tabela');
  if (!pendentes.length) {
    tabela.innerHTML = '<div class="estado-vazio"><p>Nenhum cadastro pendente no momento.</p></div>';
    return;
  }
  tabela.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Nome</th><th>Apelido</th><th>Indicador</th><th>Data</th><th></th></tr></thead>
      <tbody>
        ${pendentes.map((p) => `
          <tr>
            <td class="numero">${p.id}</td>
            <td>${escapeHtml(p.nome)}</td>
            <td>@${escapeHtml(p.apelido)}</td>
            <td>${p.indicador_apelido ? `@${p.indicador_apelido}` : '—'}</td>
            <td>${formatarData(p.data_cadastro)}</td>
            <td style="display:flex; gap:6px;">
              <button class="btn btn-sucesso btn-pequeno" data-aprovar="${p.id}">Aprovar</button>
              <button class="btn btn-perigo btn-pequeno" data-rejeitar="${p.id}">Rejeitar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  tabela.querySelectorAll('[data-aprovar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await api('POST', `/api/admin/pendentes/${btn.dataset.aprovar}/aprovar`);
        toast('Cadastro aprovado.', 'sucesso');
        carregarPendentes();
      } catch (e) { toast(e.message, 'erro'); }
    });
  });
  tabela.querySelectorAll('[data-rejeitar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await api('POST', `/api/admin/pendentes/${btn.dataset.rejeitar}/rejeitar`);
        toast('Cadastro rejeitado.', 'sucesso');
        carregarPendentes();
      } catch (e) { toast(e.message, 'erro'); }
    });
  });
}

// ---------------- USUÁRIOS ----------------
async function carregarUsuarios(busca = '') {
  const { usuarios } = await api('GET', `/api/admin/usuarios?busca=${encodeURIComponent(busca)}`);
  const tabela = document.getElementById('usuarios-tabela');
  tabela.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Nome</th><th>Apelido</th><th>Saldo</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${usuarios.map((u) => `
          <tr>
            <td class="numero">${u.id}</td>
            <td>${escapeHtml(u.nome)} ${u.admin ? '<span class="badge badge-ativo">admin</span>' : ''}</td>
            <td>@${escapeHtml(u.apelido)}</td>
            <td class="numero">${formatarMoeda(u.saldo)}</td>
            <td><span class="badge badge-${u.status}">${u.status}</span></td>
            <td><button class="btn btn-fantasma btn-pequeno" data-ver="${u.id}">Ver / ajustar</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  tabela.querySelectorAll('[data-ver]').forEach((btn) => {
    btn.addEventListener('click', () => abrirDetalheUsuario(btn.dataset.ver));
  });
}

async function abrirDetalheUsuario(id) {
  const { usuario, historico, apostas } = await api('GET', `/api/admin/usuarios/${id}`);
  const area = document.getElementById('usuario-detalhe');

  const statusOpcoes = ['ativo','pendente','rejeitado','excluido']
    .map((s) => `<option value="${s}" ${usuario.status===s?'selected':''}>${s}</option>`).join('');

  area.innerHTML = `
    <div class="modal-fundo" id="modal-usuario">
      <div class="modal-caixa" style="max-width:460px;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">
          <h3>${escapeHtml(usuario.nome)}</h3>
          <button class="btn btn-fantasma btn-pequeno" id="btn-fechar-modal">✕</button>
        </div>

        <!-- Abas do modal -->
        <div style="display:flex;gap:6px;margin-bottom:16px;">
          <button class="btn btn-pequeno ativo" data-modal-tab="saldo"> Saldo</button>
          <button class="btn btn-pequeno" data-modal-tab="perfil"> Perfil</button>
          <button class="btn btn-pequeno" data-modal-tab="historico"> Histórico</button>
        </div>

        <!-- Aba: Saldo -->
        <div id="modal-tab-saldo">
          <p style="font-size:13px;color:var(--texto-terciario);margin-bottom:12px;">
            @${escapeHtml(usuario.apelido)} · ID ${usuario.id} · <span class="badge badge-${usuario.status}">${usuario.status}</span>
          </p>
          <div class="card" style="margin-bottom:14px;">
            <div class="stat-label">Saldo atual</div>
            <div class="stat-valor numero verde">${formatarMoeda(usuario.saldo)}</div>
          </div>
          <div class="campo"><label>Valor</label><input type="number" id="ajuste-valor" min="1" placeholder="Ex: 100"></div>
          <div class="campo"><label>Motivo</label><input type="text" id="ajuste-motivo" placeholder="Ex: correção de bug, prêmio especial..."></div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-sucesso btn-bloco" id="btn-adicionar">+ Adicionar</button>
            <button class="btn btn-perigo btn-bloco" id="btn-remover">− Remover</button>
          </div>
          <div id="erro-ajuste"></div>
        </div>

        <!-- Aba: Editar Perfil -->
        <div id="modal-tab-perfil" style="display:none;">
          <div class="campo"><label>Nome completo</label>
            <input type="text" id="edit-nome" value="${escapeHtml(usuario.nome || '')}" placeholder="Nome completo"></div>
          <div class="campo"><label>Apelido</label>
            <input type="text" id="edit-apelido" value="${escapeHtml(usuario.apelido || '')}" placeholder="Apelido único"></div>
          <div class="campo"><label>Data de nascimento</label>
            <input type="date" id="edit-data-nasc" value="${usuario.data_nascimento || ''}"></div>
          <div class="campo"><label>Identidade de gênero</label>
            <input type="text" id="edit-genero" value="${escapeHtml(usuario.identidade_genero || '')}" placeholder="Ex: Mulher cisgênero"></div>
          <div class="campo"><label>Status da conta</label>
            <select id="edit-status">${statusOpcoes}</select></div>
          <button class="btn btn-primario btn-bloco" id="btn-salvar-perfil-admin">Salvar alterações</button>
          <div id="edit-perfil-msg"></div>
        </div>

        <!-- Aba: Histórico -->
        <div id="modal-tab-historico" style="display:none;">
          <div class="tabela-wrap" style="max-height:260px;overflow-y:auto;">
            <table><tbody>
              ${historico.length ? historico.map((m) => `
                <tr>
                  <td style="font-size:11px;color:#6E6E6E;">${formatarData(m.data)}</td>
                  <td style="font-size:12px;">${escapeHtml(m.motivo || m.tipo)}</td>
                  <td class="numero" style="font-size:12px;color:${m.valor>=0?'#1FAE63':'#D14F4F'};">${m.valor>=0?'+':''}${formatarMoeda(m.valor)}</td>
                </tr>`).join('') : '<tr><td colspan="3" class="estado-vazio">Sem movimentações.</td></tr>'}
            </tbody></table>
          </div>
        </div>

        <!-- Exclusão -->
        <div style="border-top:1px solid var(--borda-sutil);margin-top:18px;padding-top:14px;">
          <button class="btn btn-perigo btn-pequeno" id="btn-excluir-usuario"> Excluir conta</button>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-fechar-modal').addEventListener('click', () => { area.innerHTML = ''; });
  document.getElementById('modal-usuario').addEventListener('click', (ev) => {
    if (ev.target.id === 'modal-usuario') area.innerHTML = '';
  });

  // Navegação entre abas do modal
  document.querySelectorAll('[data-modal-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-modal-tab]').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      ['saldo','perfil','historico'].forEach((tab) => {
        const el = document.getElementById('modal-tab-' + tab);
        if (el) el.style.display = tab === btn.dataset.modalTab ? '' : 'none';
      });
    });
  });

  // Salvar edição de perfil (admin)
  document.getElementById('btn-salvar-perfil-admin')?.addEventListener('click', async () => {
    const msgEl = document.getElementById('edit-perfil-msg');
    msgEl.innerHTML = '';
    try {
      const { mensagem } = await api('PUT', `/api/admin/usuarios/${id}/perfil`, {
        nome: document.getElementById('edit-nome').value,
        apelido: document.getElementById('edit-apelido').value,
        dataNascimento: document.getElementById('edit-data-nasc').value || null,
        identidadeGenero: document.getElementById('edit-genero').value || null,
        status: document.getElementById('edit-status').value,
      });
      msgEl.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
      carregarUsuarios(document.getElementById('usuarios-busca').value);
    } catch(e) {
      msgEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
    }
  });

  // Excluir usuário (admin)
  document.getElementById('btn-excluir-usuario')?.addEventListener('click', async () => {
    if (!confirm(`Excluir a conta de "${escapeHtml(usuario.apelido)}" permanentemente?`)) return;
    try {
      await api('DELETE', `/api/admin/usuarios/${id}`);
      area.innerHTML = '';
      toast(`Conta de "${escapeHtml(usuario.apelido)}" excluída.`, 'sucesso');
      carregarUsuarios(document.getElementById('usuarios-busca').value);
    } catch(e) { toast(e.message, 'erro'); }
  });

  const fazerAjuste = async (tipo) => {
    const erroEl = document.getElementById('erro-ajuste');
    erroEl.innerHTML = '';
    const valor = Number(document.getElementById('ajuste-valor').value);
    const motivo = document.getElementById('ajuste-motivo').value;
    try {
      await api('POST', `/api/admin/usuarios/${id}/ajustar`, { valor, motivo, tipo });
      toast('Saldo ajustado com sucesso.', 'sucesso');
      area.innerHTML = '';
      carregarUsuarios(document.getElementById('usuarios-busca').value);
    } catch (e) {
      erroEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
    }
  };
  document.getElementById('btn-adicionar').addEventListener('click', () => fazerAjuste('adicionar'));
  document.getElementById('btn-remover').addEventListener('click', () => fazerAjuste('remover'));
}

let debounceUsuarios = null;
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'usuarios-busca') {
    clearTimeout(debounceUsuarios);
    debounceUsuarios = setTimeout(() => carregarUsuarios(ev.target.value), 300);
  }
  if (ev.target.id === 'logs-busca') {
    clearTimeout(debounceUsuarios);
    debounceUsuarios = setTimeout(() => carregarLogs(ev.target.value), 300);
  }
});

// ---------------- RODADAS ----------------
async function carregarRodadas() {
  const { rodadas, jogos } = await api('GET', '/api/admin/rodadas');
  adminEstado.jogos = jogos;
  const select = document.getElementById('select-jogo-rodada');
  select.innerHTML = jogos.map((j) => `<option value="${j.id}">${j.nome}</option>`).join('');

  const tabela = document.getElementById('rodadas-tabela');
  if (!rodadas.length) {
    tabela.innerHTML = '<div class="estado-vazio"><p>Nenhuma rodada criada ainda.</p></div>';
    return;
  }
  const nomesJogos = Object.fromEntries(jogos.map((j) => [j.id, j.nome]));
  tabela.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Jogo</th><th>Status</th><th>Apostas</th><th>Resultado</th><th>Aberta em</th><th></th></tr></thead>
      <tbody>
        ${rodadas.map((r) => `
          <tr>
            <td class="numero">${r.id}</td>
            <td>${nomesJogos[r.jogo] || r.jogo}</td>
            <td><span class="badge badge-${r.status}">${r.status}</span></td>
            <td class="numero">${r.total_apostas}</td>
            <td>${r.resultado || '—'}</td>
            <td style="font-size:13px;">${formatarData(r.data_abertura)}</td>
            <td>${r.status === 'aberta' ? `<button class="btn btn-perigo btn-pequeno" data-encerrar="${r.id}">Encerrar</button>` : ''}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  tabela.querySelectorAll('[data-encerrar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Sorteando...';
      try {
        const resp = await api('POST', `/api/admin/rodadas/${btn.dataset.encerrar}/encerrar`);
        toast(`Resultado: ${resp.opcaoResultado.label} — ${resp.resumo.ganharam} ganharam, ${resp.resumo.perderam} perderam.`, 'sucesso');
        carregarRodadas();
      } catch (e) {
        toast(e.message, 'erro');
        btn.disabled = false;
        btn.textContent = 'Encerrar';
      }
    });
  });
}

document.addEventListener('click', async (ev) => {
  if (ev.target.id === 'btn-abrir-rodada') {
    const jogo = document.getElementById('select-jogo-rodada').value;
    try {
      await api('POST', '/api/admin/rodadas', { jogo });
      toast('Rodada aberta com sucesso.', 'sucesso');
      carregarRodadas();
    } catch (e) { toast(e.message, 'erro'); }
  }
});

// ---------------- RANKING ----------------
async function carregarRankingAdmin() {
  const { ranking } = await api('GET', '/api/admin/ranking');
  const medalha = (p) => p;
  document.getElementById('ranking-lista').innerHTML = ranking
    .map((r) => `
      <div class="linha-ranking">
        <div class="ranking-posicao">${medalha(r.posicao)}</div>
        <div class="ranking-nome">${escapeHtml(r.nome)} <span class="ranking-apelido">@${escapeHtml(r.apelido)}</span></div>
        <div class="ranking-saldo numero">${formatarMoeda(r.saldo)}</div>
      </div>`)
    .join('');
}

// ---------------- LOGS ----------------
async function carregarLogs(busca = '') {
  const { logs } = await api('GET', `/api/admin/logs?busca=${encodeURIComponent(busca)}`);
  const tabela = document.getElementById('logs-tabela');
  if (!logs.length) {
    tabela.innerHTML = '<div class="estado-vazio"><p>Nenhum log encontrado.</p></div>';
    return;
  }
  tabela.innerHTML = `
    <table>
      <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th></tr></thead>
      <tbody>
        ${logs.map((l) => `
          <tr>
            <td style="font-size:12px;">${formatarData(l.data)}</td>
            <td><span class="badge badge-pendente">${TIPO_ACAO_LABEL[l.tipo_acao] || l.tipo_acao}</span></td>
            <td style="white-space:normal; min-width:280px;">${escapeHtml(l.descricao)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ---------------- INICIALIZAÇÃO ----------------
(async function init() {
  const usuario = await exigirSessao();
  if (!usuario) return;
  if (!usuario.admin) { window.location.href = '/app.html'; return; }

  document.querySelectorAll('[data-secao]').forEach((el) => {
    el.addEventListener('click', () => trocarSecaoAdmin(el.dataset.secao));
  });
  document.getElementById('btn-sair-desktop').addEventListener('click', sair);
  document.getElementById('btn-sair-mobile').addEventListener('click', sair);

  trocarSecaoAdmin('dashboard');
})();
