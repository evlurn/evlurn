'use strict';

// Nome da plataforma — centralizado (mudar aqui quando o nome for definido)
const PLATFORM_NAME = 'Evlurn';

const estado = {
  usuario: null,
  jogos: [],
  pollingTimer: null,
  contagemTimer: null,
  mundoAtivo: null,
};

const MUNDOS_CONFIG = {
  arena:    { label: 'Arena',    icone: '🎮', construido: true },
  academia: { label: 'Academia', icone: '📚', construido: true,
    modulos: ['Educação Financeira','Investimentos','Administração','Desenvolvimento Pessoal','Tecnologia','Quiz de Conhecimento','Trilhas','Artigos'] },
  oficina:  { label: 'Oficina',  icone: '🛠️', construido: true,
    modulos: ['Calculadoras','Simuladores','Conversores','Geradores','Utilidades'] },
  explorar: { label: 'Explorar', icone: '🌍', construido: true,
    modulos: ['Curiosidades','Fatos do Dia','Desafios Visuais'] },
  perfil:   { label: 'Perfil',   icone: '👤', construido: true },
};

const ICONES_JOGO = {
  roleta_primal:    { icone: '🎡', cor: '#1FAE63', tipo: 'SOCIAL • RODADA' },
  joga_moeda:       { icone: '🪙', cor: '#3D8BFD', tipo: 'CASUAL • INSTANTÂNEO' },
  cofre_misterioso: { icone: '🗝️', cor: '#E0B341', tipo: 'SURPRESA • INSTANTÂNEO' },
  tudo_ou_nada:     { icone: '⚖️', cor: '#D14F4F', tipo: 'RISCO • INSTANTÂNEO' },
};

/* ─── Utilitários ─────────────────────────────────── */
function pararPolling() {
  if (estado.pollingTimer)  { clearInterval(estado.pollingTimer);  estado.pollingTimer = null; }
  if (estado.contagemTimer) { clearInterval(estado.contagemTimer); estado.contagemTimer = null; }
}

function formatarContagem(seg) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ─── Suspense de Jogo ─────────────────────────────
   Mostra uma animação por `duracao` ms e depois chama `callback`.
   `icone` e `animClass` definem a aparência visual.
   ─────────────────────────────────────────────────── */
function executarComSuspense({ titulo, subtitulo, icone, animClass = '', duracao = 2500, callback }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'suspense-overlay';
    el.innerHTML = `
      <div class="suspense-icone ${animClass}">${icone}</div>
      <div class="suspense-titulo">${titulo}</div>
      <div class="suspense-subtitulo">${subtitulo}</div>
      <div class="suspense-barra-wrap">
        <div class="suspense-barra" id="suspense-barra" style="width:0%"></div>
      </div>`;
    document.body.appendChild(el);

    let inicio = null;
    function animar(ts) {
      if (!inicio) inicio = ts;
      const progresso = Math.min((ts - inicio) / duracao * 100, 100);
      const barra = document.getElementById('suspense-barra');
      if (barra) barra.style.width = progresso + '%';
      if (progresso < 100) requestAnimationFrame(animar);
      else {
        el.remove();
        resolve(callback());
      }
    }
    requestAnimationFrame(animar);
  });
}

/* ─── Confirmação de Saída ─────────────────────────── */
function confirmarSaida() {
  const modal = document.createElement('div');
  modal.className = 'modal-confirm';
  modal.innerHTML = `
    <div class="modal-confirm-caixa">
      <div class="modal-confirm-titulo">Sair da plataforma?</div>
      <div class="modal-confirm-desc">Sua sessão será encerrada. As apostas pendentes em rodadas abertas continuam registradas.</div>
      <div class="modal-confirm-acoes">
        <button class="btn btn-perigo btn-bloco" id="modal-sim-sair">Sair</button>
        <button class="btn btn-fantasma btn-bloco" id="modal-nao-sair">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('modal-sim-sair').addEventListener('click', () => { modal.remove(); sair(); });
  document.getElementById('modal-nao-sair').addEventListener('click', () => modal.remove());
}

/* ─── Botão flutuante de sugestão ─────────────────── */
function criarBotaoSugestao() {
  const btn = document.createElement('button');
  btn.className = 'btn-sugestao-flutuante';
  btn.title = 'Enviar sugestão';
  btn.innerHTML = '💡';
  btn.addEventListener('click', abrirModalSugestao);
  document.body.appendChild(btn);
}

function abrirModalSugestao() {
  const modal = document.createElement('div');
  modal.className = 'modal-confirm';
  modal.id = 'modal-sugestao';
  modal.innerHTML = `
    <div class="modal-confirm-caixa">
      <div class="modal-confirm-titulo">💡 Enviar sugestão</div>
      <div class="modal-confirm-desc">Sua ideia, crítica ou elogio chegará diretamente ao time. Obrigado por ajudar a melhorar a plataforma!</div>
      <div class="campo">
        <textarea id="sugestao-texto" rows="4" style="width:100%;background:var(--bg-elevado);border:1px solid var(--borda);color:#fff;padding:11px 13px;border-radius:10px;font-size:14px;resize:vertical;font-family:inherit;" placeholder="Escreva sua sugestão aqui..."></textarea>
        <div class="campo-ajuda" id="sugestao-contagem">0 / 1000 caracteres</div>
      </div>
      <div id="sugestao-alerta"></div>
      <div class="modal-confirm-acoes">
        <button class="btn btn-sucesso btn-bloco" id="btn-enviar-sugestao">Enviar</button>
        <button class="btn btn-fantasma" id="btn-fechar-sugestao">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const textarea = document.getElementById('sugestao-texto');
  const contagem = document.getElementById('sugestao-contagem');
  textarea.addEventListener('input', () => {
    const n = textarea.value.length;
    contagem.textContent = `${n} / 1000 caracteres`;
    contagem.style.color = n > 900 ? '#D14F4F' : '#6E6E6E';
  });

  document.getElementById('btn-fechar-sugestao').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('btn-enviar-sugestao').addEventListener('click', async () => {
    const texto = textarea.value.trim();
    const alertaEl = document.getElementById('sugestao-alerta');
    alertaEl.innerHTML = '';
    const btn = document.getElementById('btn-enviar-sugestao');
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const { mensagem } = await api('POST', '/api/sugestoes', { texto });
      modal.remove();
      toast(mensagem, 'sucesso');
    } catch (e) {
      alertaEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
      btn.disabled = false; btn.textContent = 'Enviar';
    }
  });
}

/* ─── Notificações ─────────────────────────────────── */
async function carregarNotificacoes() {
  try {
    const { notificacoes, total } = await api('GET', '/api/notificacoes');
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
    return notificacoes;
  } catch(e) { return []; }
}

function abrirPainelNotificacoes(notificacoes) {
  if (!notificacoes.length) { toast('Nenhuma notificação pendente.', 'info'); return; }
  const modal = document.createElement('div');
  modal.className = 'modal-confirm';
  modal.innerHTML = `
    <div class="modal-confirm-caixa">
      <div class="modal-confirm-titulo">🔔 Notificações</div>
      ${notificacoes.map((n) => `
        <div style="background:var(--bg-elevado);border:1px solid var(--borda-sutil);border-radius:10px;padding:12px 14px;margin-bottom:10px;">
          <div style="font-size:13.5px;color:var(--texto);margin-bottom:6px;">${n.mensagem}</div>
          ${n.acao === 'login_diario'
            ? '<button class="btn btn-sucesso btn-bloco btn-pequeno" id="btn-notif-login">Confirmar presença</button>'
            : ''}
        </div>`).join('')}
      <button class="btn btn-fantasma btn-bloco" id="btn-fechar-notif">Fechar</button>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-fechar-notif').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  const btnLogin = document.getElementById('btn-notif-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      try {
        const r = await api('POST', '/api/login-diario/confirmar');
        atualizarHeader({ ...estado.usuario, saldo: r.novoSaldo });
        estado.usuario.saldo = r.novoSaldo;
        modal.remove();
        toast(`${r.mensagem} 🔥 Streak: ${r.streak} dias`, 'sucesso');
        carregarNotificacoes();
      } catch(e) { toast(e.message, 'erro'); }
    });
  }
}

/* ─── Header global ───────────────────────────────── */
function atualizarHeader(usuario) {
  document.getElementById('header-saldo').textContent = formatarMoeda(usuario.saldo);
  if (usuario.nivel) document.getElementById('header-nivel').textContent = `Nv. ${usuario.nivel}`;
  const xpAtual = usuario.xpNivelAtual || 0;
  const xpProximo = usuario.xpProximo || 100;
  const pct = xpProximo > 0 ? Math.min(100, Math.floor(xpAtual / xpProximo * 100)) : 100;
  if (document.getElementById('header-xp-texto'))
    document.getElementById('header-xp-texto').textContent = `${xpAtual} / ${xpProximo} XP`;
  if (document.getElementById('header-xp-progresso'))
    document.getElementById('header-xp-progresso').style.width = pct + '%';
}

/* ─── Navegação por Mundo ─────────────────────────── */
function ativarMundo(mundoId) {
  if (!MUNDOS_CONFIG[mundoId]) mundoId = 'arena';
  pararPolling();
  estado.mundoAtivo = mundoId;
  document.querySelectorAll('[data-mundo]').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.mundo === mundoId);
  });
  history.replaceState(null, '', '#' + mundoId);
  const carregadores = {
    arena:    renderizarArena,
    academia: renderizarAcademia,
    oficina:  renderizarOficina,
    explorar: renderizarExplorar,
    perfil:   renderizarPerfil,
  };
  (carregadores[mundoId] || renderizarArena)();
}

/* ─── Mundo: Arena ───────────────────────────────── */
async function renderizarArena() {
  const main = document.getElementById('mundo-main');
  main.innerHTML = `
    <div class="mundo-header">
      <h1><span class="mundo-icone-titulo">🎮</span> Arena</h1>
    </div>
    <div id="arena-conteudo"><div class="estado-vazio"><p>Carregando jogos...</p></div></div>`;
  try {
    const { jogos } = await api('GET', '/api/jogos');
    estado.jogos = jogos;
    renderizarGradeJogos();
  } catch(e) {
    document.getElementById('arena-conteudo').innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
  }
}

function renderizarGradeJogos() {
  const container = document.getElementById('arena-conteudo');
  if (!container) return;
  container.innerHTML = `<div class="arena-grade" id="grade-jogos"></div>`;
  document.getElementById('grade-jogos').innerHTML = estado.jogos.map((j) => {
    const cfg = ICONES_JOGO[j.id] || { icone: '◆', cor: '#A3A3A3', tipo: 'JOGO' };
    const rodadaBadge = j.rodadaAberta
      ? `<span class="badge badge-aberta" style="font-size:11px;">● Rodada aberta</span>`
      : (j.tipo === 'escolha' && j.usaRodadas !== false
          ? `<span class="badge badge-encerrada" style="font-size:11px;">Aguardando rodada</span>`
          : '');
    return `
      <div class="jogo-card-v2" data-jogo="${j.id}" style="--cor-jogo:${cfg.cor}">
        <div class="jogo-card-topo">
          <span class="jogo-card-icone">${cfg.icone}</span>
          <span class="jogo-card-tipo badge" style="background:${cfg.cor}22;color:${cfg.cor};">${cfg.tipo}</span>
        </div>
        <h3>${j.nome}</h3>
        <p class="jogo-card-desc">${j.descricao || ''}</p>
        <div class="jogo-card-rodape">${rodadaBadge}</div>
      </div>`;
  }).join('');
  document.querySelectorAll('#grade-jogos .jogo-card-v2').forEach((el) => {
    el.addEventListener('click', () => abrirJogo(el.dataset.jogo));
  });
}

async function abrirJogo(jogoId) {
  pararPolling();
  if (jogoId === 'tudo_ou_nada')     { await renderizarTudoOuNada(); return; }
  if (jogoId === 'joga_moeda')       { await renderizarJogaMoeda();  return; }
  if (jogoId === 'cofre_misterioso') { await renderizarCofre();      return; }
  const { jogos } = await api('GET', '/api/jogos');
  estado.jogos = jogos;
  const jogo = jogos.find((j) => j.id === jogoId);
  await renderizarTelaRodada(jogo);
}

function btnVoltar() {
  return `<button class="btn btn-fantasma" id="btn-voltar-arena">← Voltar</button>`;
}
function conectarVoltar() {
  const btn = document.getElementById('btn-voltar-arena');
  if (btn) btn.addEventListener('click', () => { pararPolling(); renderizarGradeJogos(); });
}

/* ─── Roleta Primária (rodadas) ──────────────────── */
async function renderizarTelaRodada(jogo) {
  const main = document.getElementById('arena-conteudo');
  main.innerHTML = `${btnVoltar()}<div id="rodada-area" style="margin-top:14px;"></div>`;
  conectarVoltar();

  if (!jogo.rodadaAberta) {
    let status = null;
    try { status = await api('GET', '/api/scheduler/status'); } catch(e) {}
    const contagem = status && status.ativo
      ? `<div id="contagem-regressiva" style="font-size:32px;font-weight:800;font-family:var(--fonte-mono);color:#fff;margin:10px 0">${formatarContagem(status.segundosParaProximoSlot)}</div>
         <p style="font-size:12px;color:#6E6E6E;">próxima rodada em</p>`
      : `<p>Nenhuma rodada aberta. O administrador pode abrir uma manualmente ou ativar as rodadas automáticas no painel.</p>`;
    document.getElementById('rodada-area').innerHTML = `
      <div class="card estado-vazio">
        <div class="icone-vazio">🎡</div>
        <h3 style="color:#fff;">Roleta Primária</h3>
        ${contagem}
      </div>`;
    if (status && status.ativo) {
      let seg = status.segundosParaProximoSlot;
      estado.contagemTimer = setInterval(() => {
        seg = Math.max(0, seg - 1);
        const el = document.getElementById('contagem-regressiva');
        if (el) el.textContent = formatarContagem(seg);
      }, 1000);
    }
    estado.pollingTimer = setInterval(async () => {
      try {
        const { jogos: j } = await api('GET', '/api/jogos');
        const at = j.find((x) => x.id === jogo.id);
        if (at && at.rodadaAberta) { pararPolling(); estado.jogos = j; await renderizarTelaRodada(at); }
      } catch(e) {}
    }, 5000);
    return;
  }

  const { rodada, minhaAposta } = await api('GET', `/api/rodadas/${jogo.rodadaAberta.id}`);
  const area = document.getElementById('rodada-area');

  if (rodada.status === 'encerrada') {
    const ganhou = minhaAposta && minhaAposta.ganho > 0;
    const opcao = jogo.opcoes && jogo.opcoes[rodada.resultado];
    area.innerHTML = minhaAposta
      ? `<div class="resultado-roleta ${ganhou ? 'ganhou' : 'perdeu'}">
           <div class="resultado-label">Resultado da rodada</div>
           <div class="resultado-opcao">${opcao ? opcao.label : rodada.resultado}</div>
           <p>${ganhou
             ? `+<strong style="color:#1FAE63;">${formatarMoeda(minhaAposta.ganho)}</strong> moedas!`
             : `Você apostou em <strong>${minhaAposta.escolha}</strong> — não foi dessa vez.`}</p>
           <button class="btn btn-primario" id="btn-nova-rodada">Ver jogos</button>
         </div>`
      : `<div class="estado-vazio"><p>Rodada encerrada: <strong>${opcao ? opcao.label : rodada.resultado}</strong></p>
           <button class="btn btn-primario" id="btn-nova-rodada">Voltar</button></div>`;
    document.getElementById('btn-nova-rodada')?.addEventListener('click', () => renderizarArena());
    return;
  }

  if (minhaAposta) {
    area.innerHTML = `
      <div class="card" style="text-align:center;padding:28px;">
        <span class="pulso"></span> <strong>Rodada em andamento</strong>
        <p style="margin-top:12px;">Sua aposta de <strong style="color:#fff;">${formatarMoeda(minhaAposta.valor)}</strong> moedas
        em <strong style="color:#fff;">${jogo.opcoes?.[minhaAposta.escolha]?.label || minhaAposta.escolha}</strong> está confirmada.</p>
        <p style="font-size:13px;color:var(--texto-terciario);">Aguardando o encerramento pelo administrador...</p>
      </div>`;
  } else {
    const opcoes = jogo.opcoes ? Object.entries(jogo.opcoes) : [];
    area.innerHTML = `
      <div class="card">
        <div class="card-titulo">🎡 Roleta Primária — Rodada #${rodada.id}</div>
        <p style="font-size:13px;color:var(--texto-terciario);margin-bottom:16px;">Escolha uma cor. Só ganha quem acertar o resultado sorteado.</p>
        <div class="opcoes-aposta" id="opcoes-aposta">
          ${opcoes.map(([chave, o]) => `
            <div class="opcao-botao" data-chave="${chave}">
              ${o.label}
              <span class="opcao-mult">x${o.mult} ${o.prob < 1 ? '⭐' : ''}</span>
            </div>`).join('')}
        </div>
        <div class="campo"><label>Valor da aposta</label><input type="number" id="valor-aposta" min="1" step="1" placeholder="Ex: 100"></div>
        <button class="btn btn-sucesso btn-bloco" id="btn-confirmar-aposta">Confirmar aposta</button>
        <div id="erro-aposta"></div>
      </div>`;
    let escolha = null;
    document.getElementById('opcoes-aposta').querySelectorAll('.opcao-botao').forEach((el) => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.opcao-botao').forEach((o) => o.classList.remove('selecionada'));
        el.classList.add('selecionada');
        escolha = el.dataset.chave;
      });
    });
    document.getElementById('btn-confirmar-aposta').addEventListener('click', async () => {
      const erroEl = document.getElementById('erro-aposta');
      erroEl.innerHTML = '';
      if (!escolha) { erroEl.innerHTML = '<div class="alerta alerta-erro">Escolha uma opção antes de confirmar.</div>'; return; }
      const valor = Number(document.getElementById('valor-aposta').value);
      const btn = document.getElementById('btn-confirmar-aposta');
      btn.disabled = true; btn.textContent = 'Confirmando...';
      try {
        const resp = await api('POST', '/api/apostas', { jogo: jogo.id, escolha, valor });
        atualizarHeader({ ...estado.usuario, saldo: resp.saldo });
        estado.usuario.saldo = resp.saldo;
        toast('Aposta confirmada! Aguardando o resultado.', 'sucesso');
        await renderizarTelaRodada(jogo);
      } catch(e) {
        erroEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
        btn.disabled = false; btn.textContent = 'Confirmar aposta';
      }
    });
  }

  pararPolling();
  if (rodada.status === 'aberta') {
    estado.pollingTimer = setInterval(async () => {
      try {
        const atual = await api('GET', `/api/rodadas/${rodada.id}`);
        if (atual.rodada.status !== 'aberta') {
          pararPolling();
          const h = await api('GET', '/api/player/home');
          atualizarHeader({ ...estado.usuario, saldo: h.usuario.saldo });
          estado.usuario.saldo = h.usuario.saldo;

          // Animação de revelação do resultado
          const opcaoResultado = jogo.opcoes?.[atual.rodada.resultado];
          await executarComSuspense({
            titulo: 'Resultado da rodada!',
            subtitulo: 'Sorteando...',
            icone: '🎡',
            animClass: '',
            duracao: 2000,
            callback: () => renderizarTelaRodada(jogo),
          });
        }
      } catch(e) {}
    }, 4000);
  }
}

/* ─── Joga a Moeda ───────────────────────────────── */
async function renderizarJogaMoeda() {
  document.getElementById('arena-conteudo').innerHTML =
    `${btnVoltar()}<div id="jm-area" style="margin-top:14px;"></div>`;
  conectarVoltar();
  renderizarFormJogaMoeda();
}

function renderizarFormJogaMoeda() {
  document.getElementById('jm-area').innerHTML = `
    <div class="card">
      <div class="card-titulo">🪙 Joga a Moeda</div>
      <p style="color:var(--texto-terciario);font-size:13px;margin-bottom:16px;">Cara ou Coroa? Resultado imediato. O Lado (1%) faz você perder a aposta.</p>
      <div class="opcoes-aposta" style="grid-template-columns:1fr 1fr;margin:0 0 16px;">
        <div class="opcao-botao" data-escolha="cara" style="font-size:26px;">🙂<span class="opcao-mult">x1.9</span></div>
        <div class="opcao-botao" data-escolha="coroa" style="font-size:26px;">🔆<span class="opcao-mult">x1.9</span></div>
      </div>
      <div class="campo"><label>Valor da aposta</label><input type="number" id="jm-valor" min="1" step="1" placeholder="Ex: 100"></div>
      <button class="btn btn-sucesso btn-bloco" id="jm-btn">Jogar</button>
      <div id="jm-erro"></div>
    </div>`;
  let escolha = null;
  document.querySelectorAll('[data-escolha]').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('[data-escolha]').forEach((o) => o.classList.remove('selecionada'));
      el.classList.add('selecionada');
      escolha = el.dataset.escolha;
    });
  });
  document.getElementById('jm-btn').addEventListener('click', async () => {
    if (!escolha) { document.getElementById('jm-erro').innerHTML = '<div class="alerta alerta-erro">Escolha cara ou coroa.</div>'; return; }
    const valor = Number(document.getElementById('jm-valor').value);
    if (!valor || valor <= 0) { document.getElementById('jm-erro').innerHTML = '<div class="alerta alerta-erro">Informe um valor válido.</div>'; return; }
    const btn = document.getElementById('jm-btn');
    btn.disabled = true;

    // Suspense antes de revelar o resultado
    await executarComSuspense({
      titulo: 'A moeda está no ar...',
      subtitulo: `Você escolheu: ${escolha === 'cara' ? '🙂 Cara' : '🔆 Coroa'}`,
      icone: '🪙',
      animClass: '',
      duracao: 2200,
      callback: async () => {
        try {
          const r = await api('POST', '/api/jogamoeda/apostar', { escolha, valor });
          atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
          estado.usuario.saldo = r.saldoNovo;
          document.getElementById('jm-area').innerHTML = `
            <div class="resultado-roleta ${r.ganhou ? 'ganhou' : 'perdeu'}">
              <div style="font-size:44px;">${r.ganhou ? '🎉' : (r.resultado === 'lado' ? '😮' : '😔')}</div>
              <div class="resultado-label">${r.resultadoLabel}</div>
              <div class="resultado-opcao">${r.ganhou ? '+'+formatarMoeda(r.ganhoFinal) : '−'+formatarMoeda(Math.abs(r.ganhoFinal))} moedas</div>
              <p style="margin-top:10px;">Saldo: <strong style="color:${r.ganhou?'#1FAE63':'#D14F4F'};font-family:var(--fonte-mono)">${formatarMoeda(r.saldoNovo)}</strong></p>
              <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;">
                <button class="btn btn-sucesso" id="jm-de-novo">Jogar novamente</button>
                <button class="btn btn-fantasma" id="jm-voltar2">← Voltar</button>
              </div>
            </div>`;
          document.getElementById('jm-de-novo').addEventListener('click', () => renderizarJogaMoeda());
          document.getElementById('jm-voltar2').addEventListener('click', () => renderizarGradeJogos());
        } catch(e) {
          document.getElementById('arena-conteudo').innerHTML =
            `${btnVoltar()}<div class="alerta alerta-erro" style="margin-top:14px;">${e.message}</div>`;
          conectarVoltar();
        }
      },
    });
  });
}

/* ─── Cofre Misterioso ───────────────────────────── */
async function renderizarCofre() {
  document.getElementById('arena-conteudo').innerHTML =
    `${btnVoltar()}<div id="cofre-area" style="margin-top:14px;"></div>`;
  conectarVoltar();
  const prev = await api('GET', '/api/cofre/preview');
  renderizarFormCofre(prev);
}

function renderizarFormCofre(prev) {
  const bloqueado = prev.restantes <= 0;
  document.getElementById('cofre-area').innerHTML = `
    <div class="card">
      <div class="card-titulo">🗝️ Cofre Misterioso</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:13px;color:var(--texto-terciario);">Aberturas hoje:</span>
        <span class="numero" style="font-weight:700;color:${bloqueado?'#D14F4F':'#1FAE63'};">${prev.restantes}/${prev.limiteDiario} restantes</span>
      </div>
      ${bloqueado
        ? `<div class="alerta alerta-erro">Você já abriu todos os cofres de hoje. Volte amanhã!</div>`
        : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px;font-size:12px;text-align:center;">
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;">🥉<br><strong>Bronze</strong><br><span style="color:#6E6E6E;">45% ×0.6</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;">🥈<br><strong>Prata</strong><br><span style="color:#6E6E6E;">30% ×0.9</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;">🥇<br><strong>Ouro</strong><br><span style="color:#6E6E6E;">15% ×1.1</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;">💎<br><strong>Diamante</strong><br><span style="color:#6E6E6E;">8% ×1.8</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;">✨<br><strong>Lendário</strong><br><span style="color:#6E6E6E;">2% ×4.0</span></div>
           </div>
           <div class="campo"><label>Valor da aposta</label><input type="number" id="cofre-valor" min="1" step="1" placeholder="Ex: 100"></div>
           <button class="btn btn-sucesso btn-bloco" id="cofre-btn">Abrir cofre</button>
           <div id="cofre-erro"></div>`}`;
  if (bloqueado) return;

  const EMOJIS = { bronze:'🥉', prata:'🥈', ouro:'🥇', diamante:'💎', lendario:'✨' };
  document.getElementById('cofre-btn').addEventListener('click', async () => {
    const valor = Number(document.getElementById('cofre-valor').value);
    if (!valor || valor <= 0) { document.getElementById('cofre-erro').innerHTML = '<div class="alerta alerta-erro">Informe um valor válido.</div>'; return; }
    const btn = document.getElementById('cofre-btn');
    btn.disabled = true;

    await executarComSuspense({
      titulo: 'O cofre está sendo aberto...',
      subtitulo: 'O que estará dentro?',
      icone: '🗝️',
      animClass: 'shake',
      duracao: 2500,
      callback: async () => {
        try {
          const r = await api('POST', '/api/cofre/abrir', { valor });
          atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
          estado.usuario.saldo = r.saldoNovo;
          const ganhou = r.ganhoFinal >= 0;
          document.getElementById('cofre-area').innerHTML = `
            <div class="resultado-roleta ${ganhou ? 'ganhou' : 'perdeu'}">
              <div style="font-size:52px;">${EMOJIS[r.resultado] || '📦'}</div>
              <div class="resultado-label">${r.opcaoResultado.label} · ×${r.opcaoResultado.mult}</div>
              <div class="resultado-opcao">${ganhou ? '+'+formatarMoeda(r.ganhoFinal) : formatarMoeda(r.ganhoFinal)} moedas</div>
              <p style="font-size:13px;color:var(--texto-terciario);">Restantes hoje: ${r.restantes}/${prev.limiteDiario}</p>
              <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;">
                ${r.restantes > 0 ? '<button class="btn btn-sucesso" id="cofre-de-novo">Abrir outro</button>' : ''}
                <button class="btn btn-fantasma" id="cofre-voltar2">← Voltar</button>
              </div>
            </div>`;
          document.getElementById('cofre-de-novo')?.addEventListener('click', () => renderizarCofre());
          document.getElementById('cofre-voltar2').addEventListener('click', () => renderizarGradeJogos());
        } catch(e) {
          document.getElementById('arena-conteudo').innerHTML =
            `${btnVoltar()}<div class="alerta alerta-erro" style="margin-top:14px;">${e.message}</div>`;
          conectarVoltar();
        }
      },
    });
  });
}

/* ─── Tudo ou Nada ───────────────────────────────── */
async function renderizarTudoOuNada() {
  document.getElementById('arena-conteudo').innerHTML =
    `${btnVoltar()}<div id="ton-area" style="margin-top:14px;"><p style="color:#6E6E6E;text-align:center;">Calculando sua posição...</p></div>`;
  conectarVoltar();
  const prev = await api('GET', '/api/tudo-ou-nada/preview');
  const { posicaoRanking, totalJogadores, faixa, opcoes } = prev;
  const corFaixa = posicaoRanking <= 10 ? '#D14F4F' : posicaoRanking <= 50 ? '#E0B341' : '#1FAE63';

  document.getElementById('ton-area').innerHTML = `
    <div class="card" style="margin-bottom:14px;border-color:${corFaixa}33;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="stat-label">Sua posição no ranking</div>
          <div class="stat-valor numero" style="color:${corFaixa};">#${posicaoRanking} <span style="font-size:14px;color:var(--texto-secundario);">de ${totalJogadores}</span></div>
        </div>
        <div style="text-align:right;">
          <div class="badge" style="background:${corFaixa}22;color:${corFaixa};font-size:13px;padding:6px 14px;">${faixa.label}</div>
          <div style="font-size:12px;color:var(--texto-terciario);margin-top:6px;">${faixa.chanceGanho}% vitória · +${faixa.retornoPct}% retorno</div>
        </div>
      </div>
    </div>
    <div class="card-titulo">Quanto você quer arriscar?</div>
    <div class="grade grade-2" style="gap:10px;margin-bottom:16px;">
      ${opcoes.map((o) => `
        <div class="opcao-botao ton-opcao" data-pct="${o.percentual}" ${o.valorAposta===0?'style="opacity:0.4;pointer-events:none;"':''}>
          <div style="font-size:22px;font-weight:800;font-family:var(--fonte-mono);">${o.percentual}%</div>
          <div style="font-size:13px;color:var(--texto-secundario);margin:4px 0;">${formatarMoeda(o.valorAposta)} fichas</div>
          <div style="font-size:11px;display:flex;justify-content:space-between;">
            <span style="color:#1FAE63;">+${formatarMoeda(o.ganhoSeVencer)}</span>
            <span style="color:#D14F4F;">−${formatarMoeda(o.valorAposta)}</span>
          </div>
        </div>`).join('')}
    </div>
    <div id="ton-confirmacao" style="display:none;" class="card">
      <div class="card-titulo">Confirmar aposta</div>
      <div id="ton-conf-texto" style="font-size:13px;color:var(--texto-secundario);margin-bottom:14px;"></div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-sucesso btn-bloco" id="ton-btn-confirmar">Arriscar</button>
        <button class="btn btn-fantasma" id="ton-btn-cancelar">Cancelar</button>
      </div>
    </div>
    <div id="ton-erro"></div>`;

  let pctSel = null;
  document.querySelectorAll('.ton-opcao').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.ton-opcao').forEach((o) => o.classList.remove('selecionada'));
      el.classList.add('selecionada');
      pctSel = Number(el.dataset.pct);
      const op = opcoes.find((o) => o.percentual === pctSel);
      document.getElementById('ton-conf-texto').innerHTML =
        `Arriscar <strong style="color:#fff;">${formatarMoeda(op.valorAposta)}</strong> fichas (${pctSel}% do saldo).<br>
         Se ganhar: <strong style="color:#1FAE63;">+${formatarMoeda(op.ganhoSeVencer)}</strong> → saldo de <strong style="color:#1FAE63;">${formatarMoeda(op.saldoSeVencer)}</strong>`;
      document.getElementById('ton-confirmacao').style.display = '';
    });
  });
  document.getElementById('ton-btn-cancelar').addEventListener('click', () => {
    document.getElementById('ton-confirmacao').style.display = 'none';
    document.querySelectorAll('.ton-opcao').forEach((o) => o.classList.remove('selecionada'));
    pctSel = null;
  });
  document.getElementById('ton-btn-confirmar').addEventListener('click', async () => {
    const btn = document.getElementById('ton-btn-confirmar');
    btn.disabled = true;
    document.getElementById('ton-erro').innerHTML = '';

    await executarComSuspense({
      titulo: 'A sorte está sendo lançada...',
      subtitulo: `${pctSel}% do seu saldo em jogo`,
      icone: '⚖️',
      animClass: 'balanca',
      duracao: 2800,
      callback: async () => {
        try {
          const r = await api('POST', '/api/tudo-ou-nada/apostar', { percentual: pctSel });
          atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
          estado.usuario.saldo = r.saldoNovo;
          const cor = r.ganhou ? '#1FAE63' : '#D14F4F';
          document.getElementById('ton-area').innerHTML = `
            <div class="resultado-roleta ${r.ganhou ? 'ganhou' : 'perdeu'}">
              <div style="font-size:44px;">${r.ganhou ? '🎉' : '😔'}</div>
              <div class="resultado-label">${r.ganhou ? 'Você ganhou!' : 'Você perdeu a aposta'}</div>
              <div class="resultado-opcao">${r.ganhou ? '+' : '−'}${formatarMoeda(Math.abs(r.ganhoFinal))} moedas</div>
              <div style="font-size:13px;color:var(--texto-secundario);margin-top:8px;">${r.percentual}% do saldo · posição #${r.posicaoRanking} · ${r.chanceGanho}% de chance</div>
              <div style="margin-top:10px;">Saldo: <strong style="color:${cor};font-family:var(--fonte-mono);">${formatarMoeda(r.saldoNovo)}</strong></div>
              <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;">
                <button class="btn btn-sucesso" id="ton-de-novo">Jogar novamente</button>
                <button class="btn btn-fantasma" id="ton-voltar2">← Voltar</button>
              </div>
            </div>`;
          document.getElementById('ton-de-novo').addEventListener('click', () => renderizarTudoOuNada());
          document.getElementById('ton-voltar2').addEventListener('click', () => renderizarGradeJogos());
        } catch(e) {
          document.getElementById('ton-erro').innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
          btn.disabled = false;
        }
      },
    });
  });
}

/* ─── Mundos em construção com conteúdo de exemplo ── */
function renderizarAcademia() {
  document.getElementById('mundo-main').innerHTML = `
    <div class="mundo-header"><h1><span class="mundo-icone-titulo">📚</span> Academia</h1></div>
    <div class="grade grade-2" style="margin-bottom:18px;">
      <div class="jogo-card-v2" style="--cor-jogo:#3D8BFD;cursor:default;">
        <div class="jogo-card-topo"><span class="jogo-card-icone">📖</span><span class="jogo-card-tipo badge" style="background:#3D8BFD22;color:#3D8BFD;">ARTIGO</span></div>
        <h3>Juros compostos na prática</h3>
        <p class="jogo-card-desc">Entenda como pequenos aportes mensais se transformam em grandes resultados com o tempo e a magia dos juros compostos.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">+15 XP ao ler</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#E0B341;cursor:default;">
        <div class="jogo-card-topo"><span class="jogo-card-icone">🧠</span><span class="jogo-card-tipo badge" style="background:#E0B34122;color:#E0B341;">QUIZ</span></div>
        <h3>Você sabe sobre investimentos?</h3>
        <p class="jogo-card-desc">10 perguntas sobre renda fixa, variável, fundos e conceitos essenciais de finanças pessoais.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">+30 XP ao completar</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#1FAE63;cursor:default;">
        <div class="jogo-card-topo"><span class="jogo-card-icone">🎯</span><span class="jogo-card-tipo badge" style="background:#1FAE6322;color:#1FAE63;">TRILHA</span></div>
        <h3>Trilha: Educação Financeira</h3>
        <p class="jogo-card-desc">6 módulos progressivos do básico ao avançado. Cada módulo concluído gera moedas e XP.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">6 módulos</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#A3A3A3;cursor:default;">
        <div class="jogo-card-topo"><span class="jogo-card-icone">💻</span><span class="jogo-card-tipo badge" style="background:#A3A3A322;color:#A3A3A3;">TECNOLOGIA</span></div>
        <h3>O que é Inteligência Artificial?</h3>
        <p class="jogo-card-desc">Uma introdução honesta ao que a IA pode e não pode fazer, e como ela já está presente no seu dia a dia.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">+15 XP ao ler</span></div>
      </div>
    </div>
    <div class="alerta" style="background:rgba(61,139,253,0.08);border-color:rgba(61,139,253,0.2);color:#A3A3A3;font-size:13px;">
      📌 Conteúdo de demonstração. O sistema de conteúdo completo da Academia estará disponível em breve.
    </div>`;
}

function renderizarOficina() {
  document.getElementById('mundo-main').innerHTML = `
    <div class="mundo-header"><h1><span class="mundo-icone-titulo">🛠️</span> Oficina</h1></div>
    <div class="grade grade-2" style="margin-bottom:18px;">
      <div class="card">
        <div class="card-titulo">🧮 Calculadora de Porcentagem</div>
        <div class="campo"><label>Valor base</label><input type="number" id="calc-base" placeholder="Ex: 1000"></div>
        <div class="campo"><label>Porcentagem (%)</label><input type="number" id="calc-pct" placeholder="Ex: 15"></div>
        <button class="btn btn-primario btn-bloco" id="calc-btn">Calcular</button>
        <div id="calc-resultado" style="margin-top:14px;text-align:center;font-size:22px;font-weight:700;font-family:var(--fonte-mono);color:var(--verde);"></div>
      </div>
      <div class="card">
        <div class="card-titulo">📈 Simulador de Juros Compostos</div>
        <div class="campo"><label>Capital inicial (R$)</label><input type="number" id="jc-capital" placeholder="Ex: 1000"></div>
        <div class="campo"><label>Taxa mensal (%)</label><input type="number" id="jc-taxa" placeholder="Ex: 1" step="0.1"></div>
        <div class="campo"><label>Período (meses)</label><input type="number" id="jc-meses" placeholder="Ex: 12"></div>
        <button class="btn btn-primario btn-bloco" id="jc-btn">Simular</button>
        <div id="jc-resultado" style="margin-top:14px;text-align:center;font-size:18px;font-weight:700;color:var(--verde);"></div>
      </div>
    </div>
    <div class="alerta" style="background:rgba(61,139,253,0.08);border-color:rgba(61,139,253,0.2);color:#A3A3A3;font-size:13px;">
      📌 Calculadoras de demonstração. Mais ferramentas chegam em breve.
    </div>`;

  document.getElementById('calc-btn').addEventListener('click', () => {
    const base = Number(document.getElementById('calc-base').value);
    const pct = Number(document.getElementById('calc-pct').value);
    if (!base || !pct) return;
    const resultado = (base * pct / 100).toFixed(2);
    document.getElementById('calc-resultado').textContent =
      `${pct}% de R$ ${base.toLocaleString('pt-BR')} = R$ ${Number(resultado).toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
  });

  document.getElementById('jc-btn').addEventListener('click', () => {
    const c = Number(document.getElementById('jc-capital').value);
    const t = Number(document.getElementById('jc-taxa').value) / 100;
    const m = Number(document.getElementById('jc-meses').value);
    if (!c || !t || !m) return;
    const montante = c * Math.pow(1 + t, m);
    const lucro = montante - c;
    document.getElementById('jc-resultado').innerHTML =
      `Montante: <strong>R$ ${montante.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><br>
       <span style="font-size:14px;color:var(--texto-terciario);">Lucro: +R$ ${lucro.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
  });
}

function renderizarExplorar() {
  const FATOS = [
    'A Groenlândia é a maior ilha do mundo, mas tecnicamente é um território autônomo da Dinamarca.',
    'Um caracol pode dormir por até 3 anos em estado de hibernação.',
    'A Torre Eiffel cresce cerca de 15 cm no verão devido à expansão térmica do metal.',
    'Existem mais estrelas no universo observável do que grãos de areia em todas as praias da Terra.',
    'O mel nunca estraga — foi encontrado mel comestível em tumbas egípcias com 3.000 anos.',
  ];
  const fato = FATOS[Math.floor(Date.now() / 86400000) % FATOS.length];

  document.getElementById('mundo-main').innerHTML = `
    <div class="mundo-header"><h1><span class="mundo-icone-titulo">🌍</span> Explorar</h1></div>
    <div class="card" style="margin-bottom:14px;border-color:rgba(224,179,65,0.3);">
      <div class="card-titulo" style="color:var(--amarelo);">✨ Fato do Dia</div>
      <p style="font-size:15px;color:var(--texto);line-height:1.7;margin:0;">${fato}</p>
    </div>
    <div class="grade grade-2">
      <div class="jogo-card-v2" style="--cor-jogo:#E0B341;cursor:default;">
        <div class="jogo-card-icone">🌌</div>
        <h3>Curiosidades do Espaço</h3>
        <p class="jogo-card-desc">Fatos surpreendentes sobre o universo, planetas e missões espaciais.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">Em breve</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#3D8BFD;cursor:default;">
        <div class="jogo-card-icone">🐾</div>
        <h3>Mundo Animal</h3>
        <p class="jogo-card-desc">Comportamentos surpreendentes e recordes do reino animal.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">Em breve</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#1FAE63;cursor:default;">
        <div class="jogo-card-icone">🏛️</div>
        <h3>História em Fatos</h3>
        <p class="jogo-card-desc">Os momentos que moldaram a civilização, contados de forma direta.</p>
        <div class="jogo-card-rodape"><span class="badge badge-pendente">Em breve</span></div>
      </div>
      <div class="jogo-card-v2" style="--cor-jogo:#D14F4F;cursor:default;" id="card-trivia">
        <div class="jogo-card-topo"><span class="jogo-card-icone">🧩</span><span class="jogo-card-tipo badge" style="background:#D14F4F22;color:#D14F4F;">TRIVIA DIÁRIA</span></div>
        <h3>Trivia do Dia</h3>
        <p class="jogo-card-desc">Uma pergunta nova todo dia. Acerte e ganhe 25 moedas. Responda e ganhe 5 mesmo errando.</p>
        <div class="jogo-card-rodape"><span class="badge badge-ativo">Disponível hoje</span></div>
      </div>
    </div>`;

  document.getElementById('card-trivia').style.cursor = 'pointer';
  document.getElementById('card-trivia').addEventListener('click', abrirTrivia);
}

async function abrirTrivia() {
  try {
    const trivia = await api('GET', '/api/trivia/hoje');
    const modal = document.createElement('div');
    modal.className = 'modal-confirm';
    modal.innerHTML = `
      <div class="modal-confirm-caixa" style="max-width:420px;">
        <div class="modal-confirm-titulo">🧩 Trivia do Dia</div>
        <div class="trivia-card" style="border:none;padding:0;background:none;">
          <div class="trivia-pergunta">${trivia.pergunta}</div>
          <div class="trivia-opcoes" id="trivia-opcoes">
            ${trivia.opcoes.map((op, i) => `<button class="trivia-opcao" data-idx="${i}">${op}</button>`).join('')}
          </div>
          <div id="trivia-resultado"></div>
        </div>
        <button class="btn btn-fantasma btn-bloco" id="btn-fechar-trivia" style="display:none;margin-top:12px;">Fechar</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    let respondeu = false;
    document.querySelectorAll('.trivia-opcao').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (respondeu) return;
        respondeu = true;
        const idx = Number(btn.dataset.idx);
        btn.classList.add('selecionada');
        try {
          const r = await api('POST', '/api/trivia/responder', { id: trivia.id, resposta: idx });
          document.querySelectorAll('.trivia-opcao').forEach((b, i) => {
            if (i === r.respostaCorreta) b.classList.add('correta');
            else if (i === idx && !r.acertou) b.classList.add('errada');
          });
          document.getElementById('trivia-resultado').innerHTML = `
            <div style="margin-top:14px;padding:12px;background:${r.acertou?'var(--verde-fundo)':'var(--vermelho-fundo)'};border-radius:10px;">
              <div style="font-weight:700;color:${r.acertou?'#79e0ae':'#ff9b9b'};margin-bottom:6px;">${r.acertou ? '✅ Correto!' : '❌ Errado'} +${r.recompensa} moedas</div>
              <div style="font-size:13px;color:var(--texto-secundario);">${r.explicacao}</div>
            </div>`;
          atualizarHeader({ ...estado.usuario, saldo: r.novoSaldo });
          estado.usuario.saldo = r.novoSaldo;
          document.getElementById('btn-fechar-trivia').style.display = '';
          document.getElementById('btn-fechar-trivia').addEventListener('click', () => modal.remove());
        } catch(e) { toast(e.message, 'erro'); respondeu = false; }
      });
    });
  } catch(e) { toast(e.message, 'erro'); }
}

/* ─── Mundo: Perfil ──────────────────────────────── */
async function renderizarPerfil() {
  const main = document.getElementById('mundo-main');
  main.innerHTML = `
    <div class="mundo-header"><h1><span class="mundo-icone-titulo">👤</span> Perfil</h1></div>
    <div id="perfil-tabs" style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;">
      <button class="btn btn-pequeno ativo" data-tab="visao">Visão geral</button>
      <button class="btn btn-pequeno" data-tab="configuracoes">Configurações</button>
    </div>
    <div id="perfil-area"><div class="estado-vazio"><p>Carregando...</p></div></div>`;

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      if (btn.dataset.tab === 'visao') renderizarPerfilVisaoGeral();
      else renderizarConfiguracoes();
    });
  });
  renderizarPerfilVisaoGeral();
}

async function renderizarPerfilVisaoGeral() {
  try {
    const [homeData, { apostas }] = await Promise.all([
      api('GET', '/api/player/home'),
      api('GET', '/api/apostas/minhas'),
    ]);
    const u = homeData.usuario;
    const totalGanhos = apostas.filter((a) => a.ganho > 0).reduce((s, a) => s + a.ganho, 0);
    document.getElementById('perfil-area').innerHTML = `
      <div class="perfil-capa">
        <div class="perfil-avatar-grande">🎮</div>
        <div class="perfil-info">
          <div class="perfil-nome">${u.nome}</div>
          <div class="perfil-apelido">@${u.apelido} · ID ${u.id}</div>
          <div class="perfil-patente-badge" style="margin-top:6px;">👤 Visitante</div>
          <div class="perfil-xp-barra-wrap"><div class="perfil-xp-barra" style="width:${(u.xp||0)%100}%;"></div></div>
          <div style="font-size:11px;color:var(--texto-terciario);margin-top:4px;font-family:var(--fonte-mono);">Nível ${u.nivel||1} · ${u.xp||0} XP total</div>
        </div>
      </div>
      <div class="grade grade-4" style="margin-bottom:18px;">
        <div class="card"><div class="stat-label">Saldo</div><div class="stat-valor numero verde">${formatarMoeda(u.saldo)}</div></div>
        <div class="card"><div class="stat-label">Ranking</div><div class="stat-valor numero">${homeData.posicaoRanking}º</div></div>
        <div class="card"><div class="stat-label">Apostas</div><div class="stat-valor numero">${apostas.length}</div></div>
        <div class="card"><div class="stat-label">Ganhos totais</div><div class="stat-valor numero verde">+${formatarMoeda(totalGanhos)}</div></div>
      </div>
      <div class="card-titulo">Histórico de apostas</div>
      <div class="card tabela-wrap">
        ${apostas.length === 0
          ? '<div class="estado-vazio"><p>Nenhuma aposta ainda.</p></div>'
          : `<table><thead><tr><th>Data</th><th>Jogo</th><th>Valor</th><th>Resultado</th></tr></thead><tbody>
            ${apostas.slice(0,30).map((a) => `<tr>
              <td style="font-size:12px;">${formatarData(a.data)}</td>
              <td>${a.jogo.replace(/_/g,' ')}</td>
              <td class="numero">${formatarMoeda(a.valor)}</td>
              <td class="numero" style="${a.ganho>0?'color:#1FAE63;':a.status==='resolvida'?'color:#D14F4F;':''}">${a.status==='resolvida'?(a.ganho>0?'+'+formatarMoeda(a.ganho):'-'+formatarMoeda(Math.abs(a.ganho||a.valor))):'—'}</td>
            </tr>`).join('')}
          </tbody></table>`}
      </div>`;
  } catch(e) {
    document.getElementById('perfil-area').innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
  }
}

async function renderizarConfiguracoes() {
  // Carregar dados atuais do perfil
  let dadosPerfil = {};
  try { const r = await api('GET', '/api/conta/perfil'); dadosPerfil = r.perfil; } catch(e) {}

  const IDENTIDADES_GENERO = [
    '', 'Mulher cisgênero', 'Homem cisgênero',
    'Mulher transgênero', 'Homem transgênero', 'Não-binário', 'Outros'
  ];
  const IDENTIDADES_OUTROS = [
    '', 'Travesti', 'Gênero fluido', 'Agênero', 'Bigênero',
    'Pangênero', 'Neutrois', 'Intersexo', 'Gênero queer',
    'Dois-espíritos', 'Demigênero', 'Andrógino', 'Multigênero',
    'Questionando', 'Outra identidade não listada acima'
  ];

  document.getElementById('perfil-area').innerHTML = `
    <div class="config-secao">
      <div class="config-secao-header">✏️ Editar perfil</div>
      <div class="config-secao-body">
        <div class="campo"><label>Nome completo</label>
          <input type="text" id="cfg-nome" value="${dadosPerfil.nome || ''}" placeholder="Seu nome completo"></div>
        <div class="campo"><label>Data de nascimento</label>
          <input type="date" id="cfg-data-nasc" value="${dadosPerfil.data_nascimento || ''}"></div>
        <div class="campo"><label>Identidade de gênero</label>
          <select id="cfg-genero">
            ${IDENTIDADES_GENERO.map((g) =>
              `<option value="${g}" ${(dadosPerfil.identidade_genero||'')=== g?'selected':''}>${g||'Prefiro não informar'}</option>`
            ).join('')}
          </select></div>
        <div class="campo" id="cfg-genero-outro-wrap" style="display:${dadosPerfil.identidade_genero==='Outros'?'':'none'};">
          <label>Especifique</label>
          <select id="cfg-genero-outro">
            ${IDENTIDADES_OUTROS.map((g) =>
              `<option value="${g}" ${(dadosPerfil.identidade_genero_outro||'')=== g?'selected':''}>${g||'Selecione...'}</option>`
            ).join('')}
          </select></div>
        <button class="btn btn-primario" id="btn-salvar-perfil">Salvar alterações</button>
        <div id="cfg-perfil-msg"></div>
      </div>
    </div>
    <div class="config-secao">
      <div class="config-secao-header">🔑 Alterar senha</div>
      <div class="config-secao-body">
        <div class="campo"><label>Senha atual</label><input type="password" id="cfg-senha-atual" placeholder="••••••••"></div>
        <div class="campo"><label>Nova senha</label><input type="password" id="cfg-nova-senha" placeholder="Mínimo 6 caracteres"></div>
        <div class="campo"><label>Confirmar nova senha</label><input type="password" id="cfg-confirmar-senha" placeholder="Repita a nova senha"></div>
        <button class="btn btn-primario" id="btn-alterar-senha">Alterar senha</button>
        <div id="cfg-senha-msg"></div>
      </div>
    </div>
    <div class="config-secao" style="border-color:rgba(209,79,79,0.3);">
      <div class="config-secao-header" style="color:var(--vermelho);">⚠️ Zona de perigo</div>
      <div class="config-secao-body">
        <p style="font-size:13px;margin-bottom:14px;">Excluir sua conta remove permanentemente seus dados pessoais (LGPD). Seu histórico de apostas é anonimizado e mantido para integridade do sistema.</p>
        <button class="btn btn-perigo" id="btn-excluir-conta">Excluir minha conta</button>
      </div>
    </div>`;

  // Gênero expansível
  const selectGeneroConf = document.getElementById('cfg-genero');
  if (selectGeneroConf) {
    selectGeneroConf.addEventListener('change', () => {
      document.getElementById('cfg-genero-outro-wrap').style.display =
        selectGeneroConf.value === 'Outros' ? '' : 'none';
    });
  }

  // Salvar perfil
  document.getElementById('btn-salvar-perfil').addEventListener('click', async () => {
    const msgEl = document.getElementById('cfg-perfil-msg');
    msgEl.innerHTML = '';
    const genero = document.getElementById('cfg-genero').value;
    const generoOutro = genero === 'Outros' ? document.getElementById('cfg-genero-outro').value : null;
    try {
      const { mensagem } = await api('PUT', '/api/conta/perfil', {
        nome: document.getElementById('cfg-nome').value,
        dataNascimento: document.getElementById('cfg-data-nasc').value || null,
        identidadeGenero: genero || null,
        identidadeGeneroOutro: generoOutro || null,
      });
      msgEl.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
      // Atualiza nome no estado local
      if (document.getElementById('cfg-nome').value) {
        estado.usuario.nome = document.getElementById('cfg-nome').value;
      }
    } catch(e) {
      msgEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
    }
  });

  document.getElementById('btn-alterar-senha').addEventListener('click', async () => {
    const msgEl = document.getElementById('cfg-senha-msg');
    msgEl.innerHTML = '';
    try {
      const { mensagem } = await api('POST', '/api/conta/alterar-senha', {
        senhaAtual: document.getElementById('cfg-senha-atual').value,
        novaSenha: document.getElementById('cfg-nova-senha').value,
        confirmarNovaSenha: document.getElementById('cfg-confirmar-senha').value,
      });
      msgEl.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
    } catch(e) {
      msgEl.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
    }
  });

  document.getElementById('btn-excluir-conta').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-confirm';
    modal.innerHTML = `
      <div class="modal-confirm-caixa">
        <div class="modal-confirm-titulo" style="color:var(--vermelho);">Excluir conta?</div>
        <div class="modal-confirm-desc">Esta ação é irreversível. Seus dados pessoais serão removidos e você perderá todo o seu saldo e progresso.</div>
        <div class="campo"><label>Confirme sua senha</label><input type="password" id="excluir-senha" placeholder="Sua senha atual"></div>
        <div id="excluir-msg"></div>
        <div class="modal-confirm-acoes">
          <button class="btn btn-perigo btn-bloco" id="btn-confirmar-exclusao">Excluir definitivamente</button>
          <button class="btn btn-fantasma" id="btn-cancelar-exclusao">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('btn-cancelar-exclusao').addEventListener('click', () => modal.remove());
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', async () => {
      const senha = document.getElementById('excluir-senha').value;
      try {
        await api('DELETE', '/api/conta', { senha });
        modal.remove();
        toast('Conta excluída. Até mais!', 'sucesso');
        setTimeout(() => sair(), 1500);
      } catch(e) {
        document.getElementById('excluir-msg').innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
      }
    });
  });
}

/* ─── Inicialização ───────────────────────────────── */
(async function init() {
  const usuario = await exigirSessao();
  if (!usuario) return;
  if (usuario.admin) { window.location.href = '/admin.html'; return; }
  estado.usuario = usuario;
  atualizarHeader({ saldo: usuario.saldo, nivel: usuario.nivel || 1, xpNivelAtual: 0, xpProximo: 100 });

  const { jogos } = await api('GET', '/api/jogos');
  estado.jogos = jogos;

  // Navegação
  document.querySelectorAll('[data-mundo]').forEach((btn) => {
    btn.addEventListener('click', () => ativarMundo(btn.dataset.mundo));
  });
  document.getElementById('btn-sair').addEventListener('click', confirmarSaida);

  // Notificações
  const btnNotif = document.getElementById('btn-notif');
  if (btnNotif) {
    btnNotif.addEventListener('click', async () => {
      const notificacoes = await carregarNotificacoes();
      abrirPainelNotificacoes(notificacoes);
    });
  }

  // Botão de sugestão flutuante
  criarBotaoSugestao();

  // Carregar notificações iniciais
  carregarNotificacoes();

  const hashMundo = window.location.hash.slice(1);
  ativarMundo(hashMundo || 'arena');
})();
