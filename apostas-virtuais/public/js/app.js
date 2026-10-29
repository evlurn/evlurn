'use strict';

/* =====================================================
   Evlurn — app.js v0.8.2-beta
   Navegação por seções funcionais (sem "Mundos").
   Seções: inicio, conhecimento, missoes, conquistas,
           jogos, perfil, sobre.
===================================================== */

const PLATAFORMA = 'Evlurn';

const estado = {
  usuario: null,
  jogos: [],
  pollingTimer: null,
  contagemTimer: null,
  secaoAtiva: null,
};

/* ─── Utilitários ──────────────────────────────── */
function pararPolling() {
  if (estado.pollingTimer)  { clearInterval(estado.pollingTimer);  estado.pollingTimer = null; }
  if (estado.contagemTimer) { clearInterval(estado.contagemTimer); estado.contagemTimer = null; }
}

function formatarContagem(seg) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ─── Header ───────────────────────────────────── */
function atualizarHeader(u) {
  const el = (id) => document.getElementById(id);
  if (el('hdr-saldo')) el('hdr-saldo').textContent = formatarMoeda(u.saldo ?? u.saldo);
  if (el('hdr-nivel')) el('hdr-nivel').textContent = `Nv. ${u.nivel || 1}`;
  const xpAt = u.xpNivelAtual || 0;
  const xpPr = u.xpProximo || 100;
  const pct  = xpPr > 0 ? Math.min(100, Math.floor(xpAt / xpPr * 100)) : 100;
  if (el('hdr-xp-txt'))  el('hdr-xp-txt').textContent  = `${xpAt} / ${xpPr} XP`;
  if (el('hdr-xp-prog')) el('hdr-xp-prog').style.width = pct + '%';
  if (el('sidebar-usuario-nome')) el('sidebar-usuario-nome').textContent = u.apelido || u.nome || '';
}

/* ─── Notificações ─────────────────────────────── */
async function carregarNotificacoes() {
  try {
    const { total } = await api('GET', '/api/notificacoes');
    const badge = document.getElementById('notif-badge');
    if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
  } catch(e) {}
}

function abrirPainelNotificacoes() {
  toast('Sistema de notificações em atualização.', 'info');
}

/* ─── Confirmação de Saída ─────────────────────── */
function confirmarSaida() {
  const modal = document.createElement('div');
  modal.className = 'modal-confirm';
  modal.innerHTML = `
    <div class="modal-confirm-caixa">
      <div class="modal-confirm-titulo">Deseja sair?</div>
      <div class="modal-confirm-desc">Sua sessão será encerrada.</div>
      <div class="modal-confirm-acoes">
        <button class="btn btn-perigo btn-bloco" id="ms-sim">Sair</button>
        <button class="btn btn-fantasma btn-bloco" id="ms-nao">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('ms-sim').addEventListener('click', () => { modal.remove(); sair(); });
  document.getElementById('ms-nao').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

/* ─── Navegação ────────────────────────────────── */
function ativarSecao(secaoId) {
  if (!secaoId) secaoId = 'inicio';
  pararPolling();
  estado.secaoAtiva = secaoId;

  // Atualizar estado visual de todos os botões de navegação
  document.querySelectorAll('[data-secao]').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.secao === secaoId);
    if (btn.dataset.secao === secaoId) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });

  history.replaceState(null, '', '#' + secaoId);

  const renderizadores = {
    inicio:        renderizarInicio,
    conhecimento:  renderizarConhecimento,
    missoes:       renderizarMissoes,
    conquistas:    renderizarConquistas,
    jogos:         renderizarJogos,
    perfil:        renderizarPerfilSecao,
    sobre:         renderizarSobre,
  };

  const fn = renderizadores[secaoId] || renderizarInicio;
  fn();
}

/* ─── SEÇÃO: Início ────────────────────────────── */
async function renderizarInicio() {
 const main=document.getElementById('ev-main');
 try {
  const {usuario:u}=await api('GET','/api/player/home');
  if(estado.secaoAtiva!=='inicio')return;
  main.innerHTML=`<div class="ev-section-header"><div><div class="ev-section-title">Olá, ${escapeHtml(u.apelido||u.nome)}.</div><div class="ev-section-subtitle">Um espaço para descobrir, praticar e evoluir.</div></div><span class="ev-note">Beta privado · 0.8.3</span></div>
  <section class="ev-hero"><span class="ev-eyebrow">Sua próxima descoberta</span><h2>Uma ideia nova pode mudar o seu olhar.</h2><p>Explore as primeiras leituras da Evlurn. Comece por lógica, tecnologia ou pensamento científico, no seu ritmo.</p><button class="btn btn-primario" id="home-explore">Explorar assuntos →</button></section>
  <div class="ev-topic-grid"><section class="ev-topic"><div class="ev-topic-body">${evIcon('missoes')}<h3>Desafio do dia</h3><p>Uma pergunta, uma explicação e uma oportunidade de aprender.</p><button class="btn btn-fantasma" id="home-challenge">Abrir desafio</button></div></section><section class="ev-topic"><div class="ev-topic-body">${evIcon('conquistas')}<h3>Sua evolução</h3><p>Conheça a proposta das conquistas. A atribuição automática ainda está em preparação.</p><button class="btn btn-fantasma" id="home-progress">Ver conquistas</button></div></section><section class="ev-topic"><div class="ev-topic-body">${evIcon('jogos')}<h3>Uma pausa para jogar</h3><p>Explore os quatro jogos com moedas virtuais, sem dinheiro real.</p><button class="btn btn-fantasma" id="home-games">Conhecer os jogos</button></div></section></div>
  <div class="ev-summary"><div><span>Seu saldo virtual</span><strong>${formatarMoeda(u.saldo)} EVC</strong></div><div><span>Conhecimento</span><strong>3 leituras iniciais</strong></div></div><p class="ev-note">Leituras ainda não concedem XP ou conquistas. Estamos construindo a progressão com base em atividades reais.</p>${u.admin?'<a href="/admin.html">Abrir administração</a>':''}`;
  for(const [id,section] of [['home-explore','conhecimento'],['home-challenge','missoes'],['home-progress','conquistas'],['home-games','jogos']])document.getElementById(id).onclick=()=>ativarSecao(section);
 }catch(e){main.innerHTML=`<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;}
}

const EV_LEITURAS=[
 {id:'padroes',tema:'Lógica',titulo:'Um padrão não é uma prova',tempo:'3 min',intro:'Observe uma sequência e descubra por que uma boa hipótese ainda precisa ser testada.',paragrafos:['Considere a sequência 2, 4, 6. Uma continuação possível é 8: a regra seria adicionar dois a cada termo. Mas três números não determinam uma única regra. Também podemos construir uma regra que produza outro quarto número.','Encontrar um padrão é propor uma explicação. Para avaliar essa explicação, precisamos conhecer as condições do problema e procurar exemplos que a contrariem. É útil perguntar: o que me faria mudar de ideia?','Na próxima vez que identificar uma tendência, separe aquilo que observou daquilo que concluiu. Uma hipótese clara permite procurar evidências que a apoiem ou a enfraqueçam.'],pergunta:'Ver três resultados iguais garante que o quarto será igual?',resposta:'Não. Sem conhecer a regra ou o processo que produz os resultados, a repetição observada não garante o próximo resultado.'},
 {id:'algoritmos',tema:'Tecnologia',titulo:'Algoritmos começam com boas instruções',tempo:'3 min',intro:'Entenda como organizar uma tarefa em passos claros, sem precisar programar.',paragrafos:['Um algoritmo descreve uma sequência de passos para realizar uma tarefa. Ordenar cartões do menor para o maior é um exemplo: você pode comparar dois cartões, trocar suas posições quando necessário e repetir o procedimento.','Boas instruções deixam claro o que entra, o que deve sair e quando a tarefa termina. “Organize os cartões” descreve um objetivo. “Compare os dois primeiros e coloque o menor à esquerda” descreve uma operação.','Antes de automatizar uma tarefa, experimente executar os passos à mão. Casos simples ajudam a encontrar ambiguidades: o que acontece quando não há cartões? E quando dois números são iguais?'],pergunta:'Qual pergunta está faltando em “repita a comparação”?',resposta:'Quando parar. Um procedimento precisa indicar uma condição de término para que a repetição não continue indefinidamente.'},
 {id:'observacao',tema:'Ciências',titulo:'Observar, explicar e testar',tempo:'3 min',intro:'Três movimentos para investigar uma dúvida com mais clareza.',paragrafos:['“A planta perto da janela cresceu mais” é uma observação. “Ela cresceu mais porque recebeu mais luz” é uma explicação possível. Separar essas frases ajuda a perceber o que sabemos e o que ainda precisamos investigar.','As plantas também podem ter recebido quantidades diferentes de água ou ter características distintas. Para testar o papel da luz, precisamos considerar esses outros fatores e planejar uma comparação adequada.','Uma única comparação pode deixar dúvidas. Registrar as condições e repetir observações permite avaliar se a explicação continua consistente. Investigar inclui reconhecer os limites do resultado.'],pergunta:'Duas coisas acontecerem juntas prova que uma causou a outra?',resposta:'Não. A associação pode ter outras explicações. Precisamos investigar fatores adicionais e reunir evidências adequadas antes de concluir que existe uma relação de causa.'}
];
function renderizarConhecimento(){
 const main=document.getElementById('ev-main');
 main.innerHTML=`<div class="ev-section-header"><div><div class="ev-section-title">Explore uma nova ideia.</div><div class="ev-section-subtitle">Leituras curtas para começar. Escolha o assunto que desperta sua curiosidade.</div></div></div><label class="sr-only" for="topic-search">Buscar assunto ou leitura</label><input id="topic-search" class="ev-search" type="search" placeholder="Buscar assunto ou leitura"><div id="topic-results" class="ev-topic-grid"></div><p class="ev-note">Coleção inicial · conteúdo introdutório. Progresso de leitura, XP e trilhas serão integrados em uma próxima etapa.</p>`;
 const list=document.getElementById('topic-results');
 function filter(){const q=document.getElementById('topic-search').value.toLocaleLowerCase('pt-BR');const items=EV_LEITURAS.filter(a=>(a.titulo+' '+a.tema).toLocaleLowerCase('pt-BR').includes(q));list.innerHTML=items.map(a=>`<article class="ev-topic"><div class="ev-topic-art">${evIcon('conhecimento')}</div><div class="ev-topic-body"><span class="ev-eyebrow">${a.tema} · ${a.tempo}</span><h3>${a.titulo}</h3><p>${a.intro}</p><button class="btn btn-fantasma" data-reading="${a.id}">Começar leitura →</button></div></article>`).join('')||'<p>Nenhuma leitura encontrada. Tente outro assunto.</p>';list.querySelectorAll('[data-reading]').forEach(b=>b.onclick=()=>abrirLeitura(b.dataset.reading));}
 document.getElementById('topic-search').oninput=filter;filter();
}
function abrirLeitura(id){const a=EV_LEITURAS.find(a=>a.id===id);if(!a)return;document.getElementById('ev-main').innerHTML=`<article class="ev-reading"><button id="reading-back" class="btn btn-fantasma">← Voltar aos assuntos</button><p class="ev-eyebrow">${a.tema} · ${a.tempo}</p><h1 tabindex="-1">${a.titulo}</h1>${a.paragrafos.map(p=>`<p>${p}</p>`).join('')}<details><summary>Para pensar: ${a.pergunta}</summary><p>${a.resposta}</p></details><p class="ev-note">Texto introdutório original da Evlurn · esta leitura ainda não registra progresso nem concede recompensa.</p></article>`;document.getElementById('reading-back').onclick=renderizarConhecimento;document.querySelector('.ev-reading h1').focus();window.scrollTo(0,0);}

/* ─── SEÇÃO: Missões ───────────────────────────── */
async function renderizarMissoes() {
  const main = document.getElementById('ev-main');
  main.innerHTML = `
    <div class="ev-section-header">
      <div>
        <div class="ev-section-title">Missões</div>
        <div class="ev-section-subtitle">Missões diárias e semanais com recompensa em EVC e XP.</div>
      </div>
    </div>
    <div id="missoes-conteudo"><div class="estado-vazio"><p>Carregando...</p></div></div>`;

  // Trivia
  try {
    const trivia = await api('GET', '/api/trivia/hoje');
    const missoesMock = [
      { nome: 'Presença diária', desc: 'Confirme sua presença hoje.', evc: 10, xp: 3, slug: 'login_diario' },
      { nome: 'Trivia do dia', desc: `Responda a pergunta de hoje. (+25 EVC se acertar)`, evc: 5, xp: 3, slug: 'trivia' },
      { nome: 'Participar de partidas', desc: 'Complete 3 partidas em qualquer jogo.', evc: 50, xp: 15, slug: 'jogar' },
      { nome: 'Ganhar uma partida', desc: 'Vença pelo menos 1 partida hoje.', evc: 30, xp: 10, slug: 'ganhar' },
    ];

    document.getElementById('missoes-conteudo').innerHTML = `
      <div class="card-titulo" style="margin-bottom:12px;">Diárias</div>
      ${missoesMock.map((m) => `
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--texto);margin-bottom:4px;">${escapeHtml(m.nome)}</div>
              <div style="font-size:13px;color:var(--texto-terciario);">${m.desc}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:12px;font-weight:700;color:var(--primario);font-family:var(--fonte-mono);">+${m.evc} EVC</div>
              <div style="font-size:11px;color:var(--texto-terciario);">+${m.xp} XP</div>
            </div>
          </div>
          <div style="background:var(--borda-sutil);border-radius:99px;height:4px;overflow:hidden;margin-top:12px;">
            <div style="height:100%;width:0%;background:var(--gradiente);border-radius:99px;"></div>
          </div>
          <div style="font-size:11px;color:var(--texto-terciario);text-align:right;margin-top:4px;font-family:var(--fonte-mono);">0 / 1</div>
        </div>`).join('')}

      <div class="card-titulo" style="margin:20px 0 12px;">Trivia do dia</div>
      <div class="card" id="trivia-missoes">
        <div style="font-size:15px;font-weight:600;color:var(--texto);margin-bottom:14px;">${trivia.pergunta}</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;" id="trivia-opts">
          ${trivia.opcoes.map((op, i) => `
            <button class="trivia-opcao" data-idx="${i}" style="text-align:left;padding:11px 14px;
              background:var(--bg-elevado);border:1.5px solid var(--borda);border-radius:var(--raio);
              color:var(--texto-secundario);font-size:14px;cursor:pointer;font-family:var(--fonte-ui);
              transition:border-color .15s;"
              onmouseover="this.style.borderColor='var(--primario)'"
              onmouseout="if(!this.classList.contains('selecionada'))this.style.borderColor=''"
            >${op}</button>`).join('')}
        </div>
        <div id="trivia-resultado-missoes"></div>
      </div>

      <div class="alerta" style="background:rgba(0,180,255,0.06);border-color:rgba(0,180,255,0.2);
        color:var(--texto-terciario);font-size:13px;margin-top:16px;">
        O progresso detalhado de missões chegará em breve. As recompensas já estão configuradas no sistema.
      </div>`;

    // Trivia interativa
    let respondeu = false;
    document.querySelectorAll('#trivia-opts .trivia-opcao').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (respondeu) return;
        respondeu = true;
        const idx = Number(btn.dataset.idx);
        btn.style.borderColor = 'var(--primario)';
        btn.style.color = 'var(--texto)';
        try {
          const r = await api('POST', '/api/trivia/responder', { id: trivia.id, resposta: idx });
          atualizarHeader({ ...estado.usuario, saldo: r.novoSaldo });
          estado.usuario.saldo = r.novoSaldo;
          document.querySelectorAll('#trivia-opts .trivia-opcao').forEach((b, i) => {
            if (i === r.respostaCorreta) { b.style.borderColor='var(--verde)'; b.style.color='var(--verde)'; }
            else if (i === idx && !r.acertou) { b.style.borderColor='var(--vermelho)'; b.style.color='var(--vermelho)'; }
          });
          document.getElementById('trivia-resultado-missoes').innerHTML = `
            <div style="padding:12px;background:${r.acertou?'var(--verde-fundo)':'var(--vermelho-fundo)'};
              border-radius:var(--raio);margin-top:4px;">
              <div style="font-weight:700;color:${r.acertou?'var(--verde)':'var(--vermelho)'};margin-bottom:4px;">
                ${r.acertou ? 'Correto!' : 'Errado'} &nbsp;+${r.recompensa} EVC</div>
              <div style="font-size:13px;color:var(--texto-secundario);">${r.explicacao}</div>
            </div>`;
        } catch(e) { toast(e.message, 'erro'); respondeu = false; }
      });
    });

    // Login diário
    try {
      const ld = await api('POST', '/api/login-diario/confirmar');
      toast(`${ld.mensagem} Streak: ${ld.streak} dias.`, 'sucesso');
      atualizarHeader({ ...estado.usuario, saldo: ld.novoSaldo });
      estado.usuario.saldo = ld.novoSaldo;
    } catch(e) { /* já confirmado hoje */ }

  } catch(e) {
    document.getElementById('missoes-conteudo').innerHTML =
      `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
  }
}

/* ─── SEÇÃO: Conquistas ────────────────────────── */
function renderizarConquistas() {
  document.getElementById('ev-main').innerHTML = `
    <div class="ev-section-header">
      <div>
        <div class="ev-section-title">Conquistas</div>
        <div class="ev-section-subtitle">Seu Banco de Conquistas — a memória da sua jornada na Evlurn.</div>
      </div>
    </div>
    <div class="grade grade-2" style="margin-bottom:20px;">
      ${[
        ['Comum', '#8B949E', 'Hábitos e primeiros passos'],
        ['Incomum', '#3FB950', 'Consistência inicial'],
        ['Rara', '#00B4FF', 'Feitos notáveis'],
        ['Épica', '#7B5CFF', 'Marcos de longo prazo'],
        ['Lendária', '#F0C040', 'Feitos excepcionais'],
        ['Ultimate', 'linear-gradient(135deg,#00B4FF,#7B5CFF)', 'Eventos únicos'],
      ].map(([r, cor, desc]) => `
        <div class="card" style="opacity:0.7;border-left:3px solid ${cor.startsWith('linear') ? 'transparent' : cor};
          ${cor.startsWith('linear') ? `background:linear-gradient(var(--bg-card),var(--bg-card)) padding-box, ${cor} border-box;border:1px solid transparent;border-left-width:3px;` : ''}">
          <div style="font-size:13px;font-weight:700;margin-bottom:4px;color:${cor.startsWith('linear') ? 'var(--primario)' : cor};">${r}</div>
          <div style="font-size:12px;color:var(--texto-terciario);">${desc}</div>
        </div>`).join('')}
    </div>
    <div class="card" style="padding:32px;text-align:center;border-style:dashed;">
      <div style="font-size:14px;font-weight:600;color:var(--texto);margin-bottom:8px;">Banco de Conquistas em construção</div>
      <p style="font-size:13px;color:var(--texto-terciario);max-width:400px;margin:0 auto;line-height:1.6;">
        As primeiras conquistas chegam na próxima versão. 
        Suas ações agora — streak, trivia, partidas — já estão sendo registradas.
      </p>
    </div>`;
}

/* ─── SEÇÃO: Jogos ─────────────────────────────── */
async function renderizarJogos() {
  const main = document.getElementById('ev-main');
  main.innerHTML = `
    <div class="ev-section-header">
      <div>
        <div class="ev-section-title">Jogos</div>
        <div class="ev-section-subtitle">Entretenimento com propósito — parte da experiência Evlurn.</div>
      </div>
    </div>
    <div id="jogos-conteudo"><div class="estado-vazio"><p>Carregando...</p></div></div>`;
  try {
    const { jogos } = await api('GET', '/api/jogos');
    estado.jogos = jogos;
    renderizarGradeJogos();
  } catch(e) {
    document.getElementById('jogos-conteudo').innerHTML =
      `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
  }
}

function renderizarGradeJogos() {
  const c = document.getElementById('jogos-conteudo');
  if (!c) return;

  const CATS = {
    roleta_primal:    { label: 'Social', cor: '#1FAE63', ico: '◉' },
    joga_moeda:       { label: 'Casual', cor: '#3D8BFD', ico: '◑' },
    cofre_misterioso: { label: 'Surpresa', cor: '#E0B341', ico: '◈' },
    tudo_ou_nada:     { label: 'Estratégia', cor: '#D14F4F', ico: '◆' },
  };

  c.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
      ${estado.jogos.map((j) => {
        const cat = CATS[j.id] || { label: 'Jogo', cor: '#A3A3A3', ico: '◇' };
        const rodadaBadge = j.rodadaAberta
          ? `<span style="font-size:11px;background:rgba(31,174,99,0.15);color:#1FAE63;
              padding:2px 10px;border-radius:99px;font-weight:700;">Rodada aberta</span>`
          : '';
        return `
          <div data-jogo="${j.id}" style="background:var(--bg-card);border:1px solid var(--borda-sutil);
            border-radius:var(--raio-grande);padding:20px;cursor:pointer;
            transition:border-color .15s,transform .1s;"
            onmouseover="this.style.borderColor='var(--borda)';this.style.transform='translateY(-1px)'"
            onmouseout="this.style.borderColor='';this.style.transform=''"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:22px;color:${cat.cor};font-family:var(--fonte-mono);">${cat.ico}</span>
              <span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;
                background:${cat.cor}18;color:${cat.cor};">${cat.label}</span>
            </div>
            <div style="font-size:15px;font-weight:700;color:var(--texto);margin-bottom:5px;">${j.nome}</div>
            <div style="font-size:13px;color:var(--texto-terciario);line-height:1.5;margin-bottom:12px;">${j.descricao || ''}</div>
            <div>${rodadaBadge}</div>
          </div>`;
      }).join('')}
    </div>`;

  c.querySelectorAll('[data-jogo]').forEach((el) => {
    el.addEventListener('click', () => abrirJogo(el.dataset.jogo));
  });
}

/* ─── Lógica dos jogos (preservada integralmente) ── */
async function abrirJogo(jogoId) {
  pararPolling();
  if (jogoId === 'tudo_ou_nada')     { await renderizarTudoOuNada(); return; }
  if (jogoId === 'joga_moeda')       { await renderizarJogaMoeda(); return; }
  if (jogoId === 'cofre_misterioso') { await renderizarCofre();     return; }
  const { jogos } = await api('GET', '/api/jogos');
  estado.jogos = jogos;
  await renderizarTelaRodada(jogos.find((j) => j.id === jogoId));
}

function btnVoltar(label = '← Voltar aos jogos') {
  return `<button class="btn btn-fantasma" id="btn-voltar-jogos">${label}</button>`;
}
function conectarVoltar() {
  const btn = document.getElementById('btn-voltar-jogos');
  if (btn) btn.addEventListener('click', () => { pararPolling(); renderizarGradeJogos(); });
}

async function renderizarTelaRodada(jogo) {
  const main = document.getElementById('jogos-conteudo');
  if (!main) return;
  main.innerHTML = `${btnVoltar()}<div id="rodada-area" style="margin-top:14px;"></div>`;
  conectarVoltar();

  if (!jogo || !jogo.rodadaAberta) {
    let status = null;
    try { status = await api('GET', '/api/scheduler/status'); } catch(e) {}
    const contagem = status && status.ativo
      ? `<div id="ct-reg" style="font-size:28px;font-weight:800;font-family:var(--fonte-mono);color:var(--texto);margin:8px 0;">${formatarContagem(status.segundosParaProximoSlot)}</div>
         <p style="font-size:13px;color:var(--texto-terciario);">próxima rodada em</p>`
      : `<p style="color:var(--texto-terciario);">Nenhuma rodada aberta. O administrador pode abrir uma pelo painel.</p>`;
    document.getElementById('rodada-area').innerHTML = `
      <div class="card estado-vazio">${contagem}</div>`;
    if (status && status.ativo) {
      let seg = status.segundosParaProximoSlot;
      estado.contagemTimer = setInterval(() => {
        seg = Math.max(0, seg - 1);
        const el = document.getElementById('ct-reg');
        if (el) el.textContent = formatarContagem(seg);
      }, 1000);
    }
    estado.pollingTimer = setInterval(async () => {
      try {
        const { jogos: j } = await api('GET', '/api/jogos');
        const at = j.find((x) => x.id === (jogo && jogo.id));
        if (at && at.rodadaAberta) { pararPolling(); estado.jogos = j; await renderizarTelaRodada(at); }
      } catch(e) {}
    }, 5000);
    return;
  }

  const { rodada, minhaAposta } = await api('GET', `/api/rodadas/${jogo.rodadaAberta.id}`);
  const area = document.getElementById('rodada-area');

  if (rodada.status === 'encerrada') {
    const ganhou = minhaAposta && minhaAposta.ganho > 0;
    const opcao  = jogo.opcoes && jogo.opcoes[rodada.resultado];
    area.innerHTML = minhaAposta
      ? `<div class="resultado-roleta ${ganhou?'ganhou':'perdeu'}">
           <div class="resultado-label">Resultado: ${opcao ? opcao.label : rodada.resultado}</div>
           <div class="resultado-opcao">${ganhou ? `+${formatarMoeda(minhaAposta.ganho)} EVC` : 'Não foi desta vez.'}</div>
           <button class="btn btn-primario" id="btn-nova">Ver jogos</button>
         </div>`
      : `<div class="estado-vazio"><p>Rodada encerrada: <strong>${opcao ? opcao.label : rodada.resultado}</strong></p>
           <button class="btn btn-primario" id="btn-nova">Voltar</button></div>`;
    document.getElementById('btn-nova')?.addEventListener('click', () => renderizarGradeJogos());
    return;
  }

  if (minhaAposta) {
    area.innerHTML = `
      <div class="card" style="text-align:center;padding:28px;">
        <strong style="color:var(--texto);">Rodada em andamento</strong>
        <p style="margin-top:10px;color:var(--texto-secundario);">
          Sua participação de <strong style="color:var(--texto);">${formatarMoeda(minhaAposta.valor)} EVC</strong>
          em <strong style="color:var(--texto);">${jogo.opcoes?.[minhaAposta.escolha]?.label || minhaAposta.escolha}</strong> está confirmada.
        </p>
      </div>`;
  } else {
    const opcoes = jogo.opcoes ? Object.entries(jogo.opcoes) : [];
    area.innerHTML = `
      <div class="card">
        <div class="card-titulo">Roleta Primária — Rodada #${rodada.id}</div>
        <p style="font-size:13px;color:var(--texto-terciario);margin-bottom:16px;">Escolha uma opção antes do encerramento.</p>
        <div class="opcoes-aposta" id="opcoes-aposta">
          ${opcoes.map(([k, o]) => `<div class="opcao-botao" data-chave="${k}">${o.label}<span class="opcao-mult">×${o.mult}</span></div>`).join('')}
        </div>
        <div class="campo"><label>Valor da participação (EVC)</label><input type="number" id="valor-aposta" min="1" step="1" placeholder="Ex: 100"></div>
        <button class="btn btn-sucesso btn-bloco" id="btn-confirmar">Confirmar</button>
        <div id="erro-aposta"></div>
      </div>`;
    let escolha = null;
    document.getElementById('opcoes-aposta').querySelectorAll('.opcao-botao').forEach((el) => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.opcao-botao').forEach((o) => o.classList.remove('selecionada'));
        el.classList.add('selecionada'); escolha = el.dataset.chave;
      });
    });
    document.getElementById('btn-confirmar').addEventListener('click', async () => {
      const erroEl = document.getElementById('erro-aposta');
      erroEl.innerHTML = '';
      if (!escolha) { erroEl.innerHTML = '<div class="alerta alerta-erro">Escolha uma opção.</div>'; return; }
      const valor = Number(document.getElementById('valor-aposta').value);
      const btn = document.getElementById('btn-confirmar');
      btn.disabled = true; btn.textContent = 'Confirmando...';
      try {
        const resp = await api('POST', '/api/apostas', { jogo: jogo.id, escolha, valor });
        atualizarHeader({ ...estado.usuario, saldo: resp.saldo });
        estado.usuario.saldo = resp.saldo;
        toast('Aposta confirmada!', 'sucesso');
        await renderizarTelaRodada(jogo);
      } catch(e) {
        erroEl.innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
        btn.disabled = false; btn.textContent = 'Confirmar';
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
          await renderizarTelaRodada(jogo);
        }
      } catch(e) {}
    }, 4000);
  }
}

async function renderizarJogaMoeda() {
  const c = document.getElementById('jogos-conteudo');
  c.innerHTML = `${btnVoltar()}<div id="jm-area" style="margin-top:14px;"></div>`;
  conectarVoltar();
  renderizarFormJogaMoeda();
}

function renderizarFormJogaMoeda() {
  document.getElementById('jm-area').innerHTML = `
    <div class="card">
      <div class="card-titulo">Joga a Moeda</div>
      <p style="font-size:13px;color:var(--texto-terciario);margin-bottom:16px;">Cara ou Coroa? Resultado imediato. Cuidado com o Lado (1%).</p>
      <div class="opcoes-aposta" style="grid-template-columns:1fr 1fr;margin-bottom:16px;">
        <div class="opcao-botao" data-escolha="cara">Cara<span class="opcao-mult">×1.9</span></div>
        <div class="opcao-botao" data-escolha="coroa">Coroa<span class="opcao-mult">×1.9</span></div>
      </div>
      <div class="campo"><label>Valor (EVC)</label><input type="number" id="jm-valor" min="1" step="1" placeholder="Ex: 100"></div>
      <button class="btn btn-sucesso btn-bloco" id="jm-btn">Jogar</button>
      <div id="jm-erro"></div>
    </div>`;
  let escolha = null;
  document.querySelectorAll('[data-escolha]').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('[data-escolha]').forEach((o) => o.classList.remove('selecionada'));
      el.classList.add('selecionada'); escolha = el.dataset.escolha;
    });
  });
  document.getElementById('jm-btn').addEventListener('click', async () => {
    if (!escolha) { document.getElementById('jm-erro').innerHTML = '<div class="alerta alerta-erro">Escolha cara ou coroa.</div>'; return; }
    const valor = Number(document.getElementById('jm-valor').value);
    if (!valor) { document.getElementById('jm-erro').innerHTML = '<div class="alerta alerta-erro">Informe um valor.</div>'; return; }
    const btn = document.getElementById('jm-btn');
    btn.disabled = true; btn.textContent = 'Sorteando...';
    await new Promise(r => setTimeout(r, 1800));
    try {
      const r = await api('POST', '/api/jogamoeda/apostar', { escolha, valor });
      atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
      estado.usuario.saldo = r.saldoNovo;
      document.getElementById('jm-area').innerHTML = `
        <div class="resultado-roleta ${r.ganhou?'ganhou':'perdeu'}">
          <div class="resultado-label">${r.resultadoLabel}</div>
          <div class="resultado-opcao">${r.ganhou ? '+' : '−'}${formatarMoeda(Math.abs(r.ganhoFinal))} EVC</div>
          <p>Saldo: <strong style="font-family:var(--fonte-mono);color:${r.ganhou?'var(--verde)':'var(--vermelho)'};">${formatarMoeda(r.saldoNovo)} EVC</strong></p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
            <button class="btn btn-sucesso" id="jm-dnv">Jogar novamente</button>
            <button class="btn btn-fantasma" id="jm-vlt">← Voltar</button>
          </div>
        </div>`;
      document.getElementById('jm-dnv').addEventListener('click', () => renderizarJogaMoeda());
      document.getElementById('jm-vlt').addEventListener('click', () => renderizarGradeJogos());
    } catch(e) {
      document.getElementById('jm-erro').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
      btn.disabled = false; btn.textContent = 'Jogar';
    }
  });
}

async function renderizarCofre() {
  const c = document.getElementById('jogos-conteudo');
  c.innerHTML = `${btnVoltar()}<div id="cofre-area" style="margin-top:14px;"></div>`;
  conectarVoltar();
  const prev = await api('GET', '/api/cofre/preview');
  const bloqueado = prev.restantes <= 0;
  document.getElementById('cofre-area').innerHTML = `
    <div class="card">
      <div class="card-titulo">Cofre Misterioso</div>
      <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
        <span style="font-size:13px;color:var(--texto-terciario);">Aberturas restantes hoje:</span>
        <span style="font-weight:700;color:${bloqueado?'var(--vermelho)':'var(--primario)'};">${prev.restantes}/${prev.limiteDiario}</span>
      </div>
      ${bloqueado
        ? `<div class="alerta alerta-erro">Você já abriu todos os cofres de hoje. Volte amanhã!</div>`
        : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px;font-size:12px;text-align:center;">
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;"><strong>Bronze</strong><br><span style="color:var(--texto-terciario);">45% ×0.6</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;"><strong>Prata</strong><br><span style="color:var(--texto-terciario);">30% ×0.9</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;"><strong>Ouro</strong><br><span style="color:var(--texto-terciario);">15% ×1.1</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;"><strong>Diamante</strong><br><span style="color:var(--texto-terciario);">8% ×1.8</span></div>
             <div style="background:var(--bg-elevado);border-radius:8px;padding:8px;"><strong>Lendário</strong><br><span style="color:var(--texto-terciario);">2% ×4.0</span></div>
           </div>
           <div class="campo"><label>Valor (EVC)</label><input type="number" id="cofre-valor" min="1" step="1" placeholder="Ex: 100"></div>
           <button class="btn btn-sucesso btn-bloco" id="cofre-btn">Abrir cofre</button>
           <div id="cofre-erro"></div>`}
    </div>`;
  if (!bloqueado) {
    document.getElementById('cofre-btn').addEventListener('click', async () => {
      const valor = Number(document.getElementById('cofre-valor').value);
      if (!valor) { document.getElementById('cofre-erro').innerHTML = '<div class="alerta alerta-erro">Informe um valor.</div>'; return; }
      const btn = document.getElementById('cofre-btn');
      btn.disabled = true; btn.textContent = 'Abrindo...';
      await new Promise(r => setTimeout(r, 2000));
      try {
        const r = await api('POST', '/api/cofre/abrir', { valor });
        atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
        estado.usuario.saldo = r.saldoNovo;
        const ganhou = r.ganhoFinal >= 0;
        document.getElementById('cofre-area').innerHTML = `
          <div class="resultado-roleta ${ganhou?'ganhou':'perdeu'}">
            <div class="resultado-label">${r.opcaoResultado.label} ×${r.opcaoResultado.mult}</div>
            <div class="resultado-opcao">${ganhou?'+':''}${formatarMoeda(r.ganhoFinal)} EVC</div>
            <p>Restantes hoje: ${r.restantes}/${prev.limiteDiario}</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
              ${r.restantes > 0 ? '<button class="btn btn-sucesso" id="c-dnv">Abrir outro</button>' : ''}
              <button class="btn btn-fantasma" id="c-vlt">← Voltar</button>
            </div>
          </div>`;
        document.getElementById('c-dnv')?.addEventListener('click', () => renderizarCofre());
        document.getElementById('c-vlt').addEventListener('click', () => renderizarGradeJogos());
      } catch(e) {
        document.getElementById('cofre-erro').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
        btn.disabled = false; btn.textContent = 'Abrir cofre';
      }
    });
  }
}

async function renderizarTudoOuNada() {
  const c = document.getElementById('jogos-conteudo');
  c.innerHTML = `${btnVoltar()}<div id="ton-area" style="margin-top:14px;"><p style="color:var(--texto-terciario);text-align:center;">Calculando...</p></div>`;
  conectarVoltar();
  const prev = await api('GET', '/api/tudo-ou-nada/preview');
  const { posicaoRanking, totalJogadores, faixa, opcoes } = prev;
  const cor = posicaoRanking <= 10 ? '#D14F4F' : posicaoRanking <= 50 ? '#E0B341' : '#1FAE63';
  document.getElementById('ton-area').innerHTML = `
    <div class="card" style="margin-bottom:14px;border-color:${cor}33;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div><div style="font-size:12px;color:var(--texto-terciario);">Sua posição</div>
          <div style="font-size:24px;font-weight:800;color:${cor};font-family:var(--fonte-mono);">#${posicaoRanking} <span style="font-size:14px;color:var(--texto-secundario);">de ${totalJogadores}</span></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px;background:${cor}18;color:${cor};">${faixa.label}</div>
          <div style="font-size:11px;color:var(--texto-terciario);margin-top:4px;">${faixa.chanceGanho}% vitória · +${faixa.retornoPct}% retorno</div>
        </div>
      </div>
    </div>
    <div class="grade grade-2" style="gap:10px;margin-bottom:16px;">
      ${opcoes.map((o) => `
        <div class="opcao-botao ton-opcao" data-pct="${o.percentual}" ${o.valorAposta===0?'style="opacity:0.4;pointer-events:none;"':''}>
          <div style="font-size:20px;font-weight:800;font-family:var(--fonte-mono);">${o.percentual}%</div>
          <div style="font-size:13px;color:var(--texto-secundario);">${formatarMoeda(o.valorAposta)} EVC</div>
          <div style="font-size:11px;display:flex;justify-content:space-between;margin-top:4px;">
            <span style="color:var(--verde);">+${formatarMoeda(o.ganhoSeVencer)}</span>
            <span style="color:var(--vermelho);">−${formatarMoeda(o.valorAposta)}</span>
          </div>
        </div>`).join('')}
    </div>
    <div id="ton-confirm" style="display:none;" class="card">
      <div id="ton-conf-txt" style="font-size:13px;color:var(--texto-secundario);margin-bottom:14px;"></div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-sucesso btn-bloco" id="ton-ok">Confirmar</button>
        <button class="btn btn-fantasma" id="ton-cancel">Cancelar</button>
      </div>
    </div>
    <div id="ton-erro"></div>`;
  let pctSel = null;
  document.querySelectorAll('.ton-opcao').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.ton-opcao').forEach((o) => o.classList.remove('selecionada'));
      el.classList.add('selecionada'); pctSel = Number(el.dataset.pct);
      const op = opcoes.find((o) => o.percentual === pctSel);
      document.getElementById('ton-conf-txt').innerHTML =
        `Arriscar <strong style="color:var(--texto);">${formatarMoeda(op.valorAposta)} EVC</strong> (${pctSel}% do saldo).`;
      document.getElementById('ton-confirm').style.display = '';
    });
  });
  document.getElementById('ton-cancel').addEventListener('click', () => {
    document.getElementById('ton-confirm').style.display = 'none';
    document.querySelectorAll('.ton-opcao').forEach((o) => o.classList.remove('selecionada'));
    pctSel = null;
  });
  document.getElementById('ton-ok').addEventListener('click', async () => {
    const btn = document.getElementById('ton-ok');
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 2200));
    try {
      const r = await api('POST', '/api/tudo-ou-nada/apostar', { percentual: pctSel });
      atualizarHeader({ ...estado.usuario, saldo: r.saldoNovo });
      estado.usuario.saldo = r.saldoNovo;
      const corR = r.ganhou ? 'var(--verde)' : 'var(--vermelho)';
      document.getElementById('ton-area').innerHTML = `
        <div class="resultado-roleta ${r.ganhou?'ganhou':'perdeu'}">
          <div class="resultado-label">${r.ganhou ? 'Você ganhou!' : 'Você perdeu'}</div>
          <div class="resultado-opcao">${r.ganhou?'+':'−'}${formatarMoeda(Math.abs(r.ganhoFinal))} EVC</div>
          <div style="font-size:13px;color:var(--texto-secundario);margin-top:6px;">${r.percentual}% · posição #${r.posicaoRanking} · ${r.chanceGanho}% de chance</div>
          <div style="margin-top:10px;">Saldo: <strong style="font-family:var(--fonte-mono);color:${corR};">${formatarMoeda(r.saldoNovo)} EVC</strong></div>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;">
            <button class="btn btn-sucesso" id="ton-dnv">Jogar novamente</button>
            <button class="btn btn-fantasma" id="ton-vlt">← Voltar</button>
          </div>
        </div>`;
      document.getElementById('ton-dnv').addEventListener('click', () => renderizarTudoOuNada());
      document.getElementById('ton-vlt').addEventListener('click', () => renderizarGradeJogos());
    } catch(e) {
      document.getElementById('ton-erro').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
      btn.disabled = false;
    }
  });
}

/* ─── SEÇÃO: Perfil ────────────────────────────── */
async function renderizarPerfilSecao() {
  const main = document.getElementById('ev-main');
  main.innerHTML = `
    <div class="ev-section-header">
      <div>
        <div class="ev-section-title">Perfil</div>
        <div class="ev-section-subtitle">Sua identidade e histórico na Evlurn.</div>
      </div>
      <div>
        <button class="btn btn-fantasma btn-pequeno" id="btn-cfg-perfil">Configurações</button>
      </div>
    </div>
    <div id="perfil-area"><div class="estado-vazio"><p>Carregando...</p></div></div>`;

  document.getElementById('btn-cfg-perfil').addEventListener('click', () => renderizarConfigPerfil());

  try {
    const [homeData, { apostas }] = await Promise.all([
      api('GET', '/api/player/home'),
      api('GET', '/api/apostas/minhas').catch(() => ({ apostas: [] })),
    ]);
    const u = homeData.usuario;
    const totalGanhos = apostas.filter((a) => a.ganho > 0).reduce((s, a) => s + a.ganho, 0);
    document.getElementById('perfil-area').innerHTML = `
      <div class="card" style="margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--bg-elevado);
            border:2px solid var(--primario);display:flex;align-items:center;justify-content:center;
            font-size:26px;flex-shrink:0;">○</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:17px;font-weight:700;color:var(--texto);">${escapeHtml(u.nome)}</div>
            <div style="font-size:13px;color:var(--texto-terciario);">@${escapeHtml(u.apelido)} · ID ${u.id}</div>
            <div style="margin-top:8px;font-size:11px;color:var(--texto-terciario);">Visitante</div>
            <div style="background:var(--borda-sutil);border-radius:99px;height:5px;overflow:hidden;margin-top:6px;">
              <div style="height:100%;width:${(u.xp||0)%100}%;background:var(--gradiente);border-radius:99px;"></div>
            </div>
            <div style="font-size:11px;color:var(--texto-terciario);margin-top:3px;font-family:var(--fonte-mono);">Nível ${u.nivel||1} · ${u.xp||0} XP</div>
          </div>
        </div>
      </div>
      <div class="grade grade-4" style="margin-bottom:16px;">
        <div class="card"><div class="stat-label">Saldo EVC</div><div class="stat-valor numero" style="color:var(--primario);">${formatarMoeda(u.saldo)}</div></div>
        <div class="card"><div class="stat-label">Ranking</div><div class="stat-valor numero">${homeData.posicaoRanking}º</div></div>
        <div class="card"><div class="stat-label">Partidas</div><div class="stat-valor numero">${apostas.length}</div></div>
        <div class="card"><div class="stat-label">Ganhos</div><div class="stat-valor numero" style="color:var(--primario);">+${formatarMoeda(totalGanhos)}</div></div>
      </div>
      <div class="card-titulo" style="margin-bottom:12px;">Histórico de partidas</div>
      <div class="card tabela-wrap">
        ${apostas.length === 0
          ? '<div class="estado-vazio"><p>Nenhuma partida ainda.</p></div>'
          : `<table><thead><tr><th>Data</th><th>Jogo</th><th>Valor</th><th>Resultado</th></tr></thead><tbody>
            ${apostas.slice(0,30).map((a) => `<tr>
              <td style="font-size:11px;color:var(--texto-terciario);">${formatarData(a.data)}</td>
              <td style="font-size:13px;">${a.jogo.replace(/_/g,' ')}</td>
              <td class="numero" style="font-size:13px;">${formatarMoeda(a.valor)}</td>
              <td class="numero" style="font-size:13px;color:${a.ganho>0?'var(--verde)':a.status==='resolvida'?'var(--vermelho)':''}">${a.status==='resolvida'?(a.ganho>0?'+'+formatarMoeda(a.ganho):'−'+formatarMoeda(Math.abs(a.ganho||a.valor))):'—'}</td>
            </tr>`).join('')}
          </tbody></table>`}
      </div>`;
  } catch(e) {
    document.getElementById('perfil-area').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
  }
}

async function renderizarConfigPerfil() {
  const main = document.getElementById('ev-main');
  let dadosPerfil = {};
  try { const r = await api('GET', '/api/conta/perfil'); dadosPerfil = r.perfil; } catch(e) {}

  main.innerHTML = `
    <div class="ev-section-header">
      <div><div class="ev-section-title">Configurações</div></div>
      <button class="btn btn-fantasma btn-pequeno" id="btn-voltar-perfil">← Perfil</button>
    </div>
    <div class="config-secao">
      <div class="config-secao-header">Editar Perfil</div>
      <div class="config-secao-body">
        <div class="campo"><label>Nome</label><input type="text" id="cfg-nome" value="${escapeHtml(dadosPerfil.nome||'')}"></div>
        <div class="campo"><label>Data de nascimento</label><input type="date" id="cfg-nasc" value="${dadosPerfil.data_nascimento||''}"></div>
        <button class="btn btn-primario" id="btn-salvar-perfil">Salvar</button>
        <div id="cfg-perfil-msg"></div>
      </div>
    </div>
    <div class="config-secao">
      <div class="config-secao-header">Alterar senha</div>
      <div class="config-secao-body">
        <div class="campo"><label>Senha atual</label><input type="password" id="cfg-senha-at"></div>
        <div class="campo"><label>Nova senha</label><input type="password" id="cfg-senha-nv"></div>
        <div class="campo"><label>Confirmar nova senha</label><input type="password" id="cfg-senha-cf"></div>
        <button class="btn btn-primario" id="btn-alterar-senha">Alterar senha</button>
        <div id="cfg-senha-msg"></div>
      </div>
    </div>
    <div class="config-secao" style="border-color:rgba(255,77,106,0.3);">
      <div class="config-secao-header" style="color:var(--vermelho);">Zona de perigo</div>
      <div class="config-secao-body">
        <p style="font-size:13px;color:var(--texto-terciario);margin-bottom:14px;">Excluir sua conta remove seus dados pessoais permanentemente (LGPD).</p>
        <button class="btn btn-perigo" id="btn-excluir-conta">Excluir minha conta</button>
      </div>
    </div>`;

  document.getElementById('btn-voltar-perfil').addEventListener('click', () => renderizarPerfilSecao());
  document.getElementById('btn-salvar-perfil').addEventListener('click', async () => {
    const msg = document.getElementById('cfg-perfil-msg');
    try {
      const { mensagem } = await api('PUT', '/api/conta/perfil', {
        nome: document.getElementById('cfg-nome').value,
        dataNascimento: document.getElementById('cfg-nasc').value || null,
      });
      msg.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
    } catch(e) { msg.innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`; }
  });
  document.getElementById('btn-alterar-senha').addEventListener('click', async () => {
    const msg = document.getElementById('cfg-senha-msg');
    try {
      const { mensagem } = await api('POST', '/api/conta/alterar-senha', {
        senhaAtual: document.getElementById('cfg-senha-at').value,
        novaSenha: document.getElementById('cfg-senha-nv').value,
        confirmarNovaSenha: document.getElementById('cfg-senha-cf').value,
      });
      msg.innerHTML = `<div class="alerta alerta-sucesso">${mensagem}</div>`;
    } catch(e) { msg.innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`; }
  });
  document.getElementById('btn-excluir-conta').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-confirm';
    modal.innerHTML = `
      <div class="modal-confirm-caixa">
        <div class="modal-confirm-titulo" style="color:var(--vermelho);">Excluir conta?</div>
        <div class="modal-confirm-desc">Esta ação é irreversível.</div>
        <div class="campo"><label>Confirme sua senha</label><input type="password" id="excl-senha"></div>
        <div id="excl-msg"></div>
        <div class="modal-confirm-acoes">
          <button class="btn btn-perigo btn-bloco" id="excl-ok">Excluir definitivamente</button>
          <button class="btn btn-fantasma" id="excl-no">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('excl-no').addEventListener('click', () => modal.remove());
    document.getElementById('excl-ok').addEventListener('click', async () => {
      try {
        await api('DELETE', '/api/conta', { senha: document.getElementById('excl-senha').value });
        modal.remove(); toast('Conta excluída.', 'sucesso');
        setTimeout(() => sair(), 1500);
      } catch(e) { document.getElementById('excl-msg').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`; }
    });
  });
}

/* ─── SEÇÃO: Sobre ─────────────────────────────── */
function renderizarSobre() {
  document.getElementById('ev-main').innerHTML = `
    <div class="ev-section-header">
      <div><div class="ev-section-title">Sobre a Evlurn</div></div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <div style="font-size:13px;font-weight:700;color:var(--primario);letter-spacing:0.06em;margin-bottom:10px;">MISSÃO</div>
      <p style="font-size:15px;color:var(--texto);font-style:italic;line-height:1.6;border-left:2px solid var(--primario);padding-left:14px;">
        "A Evlurn não existe para manter pessoas ocupadas. Ela existe para fazer com que cada minuto de entretenimento gere algum tipo de crescimento intelectual, profissional, cultural ou pessoal."
      </p>
    </div>
    <div class="grade grade-2" style="margin-bottom:14px;">
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--texto-terciario);margin-bottom:6px;">VERSÃO</div>
        <div style="font-size:15px;font-weight:600;color:var(--texto);">v0.8.2-beta</div>
        <div style="font-size:12px;color:var(--texto-terciario);margin-top:2px;">Sprint 03 — Navigation Update</div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--texto-terciario);margin-bottom:6px;">FASE</div>
        <div style="font-size:15px;font-weight:600;color:var(--texto);">Beta Privado</div>
        <div style="font-size:12px;color:var(--texto-terciario);margin-top:2px;">Julho 2026</div>
      </div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <div style="font-size:13px;font-weight:700;color:var(--texto-terciario);margin-bottom:10px;">TAGLINE</div>
      <div style="font-family:var(--fonte-display);font-size:18px;font-weight:700;background:var(--gradiente);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Learn · Earn · Evolve</div>
    </div>
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--texto-terciario);margin-bottom:10px;">LINKS</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <a href="/conheca.html" target="_blank" style="font-size:14px;color:var(--primario);">Conheça a Evlurn</a>
        <a href="/seja-criador.html" target="_blank" style="font-size:14px;color:var(--primario);">Programa de Criadores</a>
      </div>
    </div>`;
}

/* ─── Sugestão flutuante ───────────────────────── */
function criarBotaoSugestao() {
  const btn = document.createElement('button');
  btn.id = 'btn-sugestao-flutuante';
  btn.title = 'Enviar sugestão';
  btn.textContent = 'Sugerir melhoria';
  btn.className = 'btn-sugestao-flutuante';
  btn.addEventListener('click', abrirModalSugestao);
  document.body.appendChild(btn);
}

function abrirModalSugestao() {
  const modal = document.createElement('div');
  modal.className = 'modal-confirm';
  modal.innerHTML = `
    <div class="modal-confirm-caixa">
      <div class="modal-confirm-titulo">Enviar sugestão</div>
      <div class="modal-confirm-desc">Sua ideia vai diretamente para o time.</div>
      <div class="campo">
        <textarea id="sug-txt" rows="4" style="width:100%;background:var(--bg-elevado);border:1px solid var(--borda);
          color:var(--texto);padding:10px 12px;border-radius:var(--raio);font-size:14px;resize:vertical;font-family:inherit;"
          placeholder="Escreva sua sugestão..."></textarea>
      </div>
      <div id="sug-msg"></div>
      <div class="modal-confirm-acoes">
        <button class="btn btn-sucesso btn-bloco" id="sug-ok">Enviar</button>
        <button class="btn btn-fantasma" id="sug-no">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById('sug-no').addEventListener('click', () => modal.remove());
  document.getElementById('sug-ok').addEventListener('click', async () => {
    const btn = document.getElementById('sug-ok');
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const { mensagem } = await api('POST', '/api/sugestoes', { texto: document.getElementById('sug-txt').value });
      modal.remove(); toast(mensagem, 'sucesso');
    } catch(e) {
      document.getElementById('sug-msg').innerHTML = `<div class="alerta alerta-erro">${escapeHtml(e.message)}</div>`;
      btn.disabled = false; btn.textContent = 'Enviar';
    }
  });
}

/* ─── Inicialização ────────────────────────────── */
(async function init() {
  const usuario = await exigirSessao();
  if (!usuario) return;
  // Administrators can inspect the member experience as well.
  estado.usuario = usuario;

  atualizarHeader({ saldo: usuario.saldo, nivel: usuario.nivel || 1, xpNivelAtual: 0, xpProximo: 100 });

  const { jogos } = await api('GET', '/api/jogos');
  estado.jogos = jogos;

  // Eventos de navegação
  document.querySelectorAll('[data-secao]').forEach((btn) => {
    if (btn.tagName !== 'A') {
      btn.addEventListener('click', () => ativarSecao(btn.dataset.secao));
    }
  });

  document.getElementById('btn-sair').addEventListener('click', confirmarSaida);
  document.getElementById('btn-notif').addEventListener('click', abrirPainelNotificacoes);

  criarBotaoSugestao();
  carregarNotificacoes();

  // Ativar seção pelo hash ou início por padrão
  const hash = window.location.hash.slice(1);
  const secoesValidas = ['inicio','conhecimento','missoes','conquistas','jogos','perfil','sobre'];
  ativarSecao(secoesValidas.includes(hash) ? hash : 'inicio');
})();
