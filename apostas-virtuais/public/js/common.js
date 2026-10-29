'use strict';

/* Wrapper simples para chamar a API. Lança erro com a mensagem
   amigável vinda do back-end (campo "erro") quando a resposta falha. */
async function api(metodo, url, corpo) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro inesperado (HTTP ${resposta.status})`);
  }
  return dados;
}

function garantirToastWrap() {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  return wrap;
}

function toast(mensagem, tipo = 'info') {
  const wrap = garantirToastWrap();
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = mensagem;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR');
}

function formatarData(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/* Redireciona para o login se a sessão tiver expirado / não existir. */
async function exigirSessao() {
  try {
    const { usuario } = await api('GET', '/api/auth/me');
    return usuario;
  } catch (e) {
    window.location.href = '/login.html';
    return null;
  }
}

async function sair() {
  try { await api('POST', '/api/auth/logout'); } catch (e) { /* ignora */ }
  window.location.href = '/login.html';
}


// ─── Pop-up institucional de boas-vindas (Sprint 01) ─────────────
// Exibe uma única vez por dispositivo (localStorage).
// Não aparece em admin.html.
function mostrarPopupBoasVindas() {
  const CHAVE = 'evlurn_bv_seen_v1';
  const isAdmin = window.location.pathname.includes('admin');
  if (isAdmin) return;
  if (localStorage.getItem(CHAVE)) return;

  const popup = document.createElement('div');
  popup.className = 'popup-boas-vindas';
  popup.id = 'popup-boas-vindas';
  popup.innerHTML = `
    <div class="popup-bv-caixa">
      <img src="/icons/icon-192.png" alt="Evlurn" class="popup-bv-logo">
      <div class="popup-bv-titulo">Bem-vindo à Evlurn Beta</div>
      <div class="popup-bv-frase">Entretenimento que gera crescimento real.</div>
      <div class="popup-bv-desc">
        A Evlurn é uma plataforma de entretenimento inteligente voltada ao desenvolvimento humano.
        Cada jogo exercita uma habilidade. Cada conteúdo gera recompensa. Cada minuto tem propósito.
      </div>
      <div class="popup-bv-acoes">
        <button class="btn btn-primario btn-bloco" id="popup-bv-entrar">Entrar na plataforma</button>
        <a href="/conheca.html" class="btn btn-fantasma btn-bloco">Conheça a Evlurn</a>
      </div>
      <button class="popup-bv-nao-mostrar" id="popup-bv-fechar">Não mostrar novamente</button>
    </div>`;

  document.body.appendChild(popup);

  const fechar = () => {
    localStorage.setItem(CHAVE, '1');
    popup.remove();
  };

  document.getElementById('popup-bv-entrar').addEventListener('click', fechar);
  document.getElementById('popup-bv-fechar').addEventListener('click', fechar);

  // Fechar ao clicar fora da caixa
  popup.addEventListener('click', (e) => {
    if (e.target === popup) fechar();
  });
}

// Executar após o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  mostrarPopupBoasVindas();
});

// ─── PWA: registro do Service Worker ───────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW não registrado:', err);
    });
  });
}

// ─── PWA: prompt de instalação inteligente ──────────────────
// Funciona de forma diferente entre Android (Chrome) e iOS (Safari).
// No Android, interceptamos o evento 'beforeinstallprompt' para mostrar
// nosso próprio botão customizado no momento certo.
// No iOS, esse evento não existe; em vez disso, mostramos uma instrução
// contextual para o usuário usar o menu "Compartilhar → Adicionar à tela inicial".

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (ev) => {
  ev.preventDefault();
  deferredInstallPrompt = ev;
  mostrarBannerInstalacao('android');
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
});

function isIosNaoInstalado() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.navigator.standalone === true;
  return ios && !standalone;
}

function mostrarBannerInstalacao(tipo) {
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'pwa-banner';

  if (tipo === 'android') {
    banner.innerHTML = `
      <div class="pwa-banner-inner">
        <img src="/icons/icon-192.png" class="pwa-banner-icon" alt="Evlurn">
        <div class="pwa-banner-texto">
          <strong>Instalar Evlurn</strong>
          <span>Adicione à sua tela inicial</span>
        </div>
        <button class="btn btn-sucesso btn-pequeno" id="pwa-btn-instalar">Instalar</button>
        <button class="btn btn-fantasma btn-pequeno" id="pwa-btn-fechar" aria-label="Fechar">✕</button>
      </div>`;
  } else {
    banner.innerHTML = `
      <div class="pwa-banner-inner">
        <img src="/icons/icon-192.png" class="pwa-banner-icon" alt="Evlurn">
        <div class="pwa-banner-texto">
          <strong>Instalar Evlurn</strong>
          <span>Toque em <strong>Compartilhar ↑</strong> → "Adicionar à tela inicial"</span>
        </div>
        <button class="btn btn-fantasma btn-pequeno" id="pwa-btn-fechar" aria-label="Fechar">✕</button>
      </div>`;
  }

  document.body.appendChild(banner);

  document.getElementById('pwa-btn-fechar').addEventListener('click', () => {
    banner.remove();
    sessionStorage.setItem('pwa-banner-fechado', '1');
  });

  const btnInstalar = document.getElementById('pwa-btn-instalar');
  if (btnInstalar && deferredInstallPrompt) {
    btnInstalar.addEventListener('click', async () => {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') banner.remove();
      deferredInstallPrompt = null;
    });
  }
}

// Mostra instrução para iOS se não estiver instalado e usuário não fechou o banner
window.addEventListener('DOMContentLoaded', () => {
  if (isIosNaoInstalado() && !sessionStorage.getItem('pwa-banner-fechado')) {
    setTimeout(() => mostrarBannerInstalacao('ios'), 1500);
  }
});
