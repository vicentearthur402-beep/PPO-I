const historicoEl = document.getElementById("historico");

const LOOKUP_URL = (idEvent) =>
    `https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${idEvent}`;

function formatarData(dateEvent) {
    if (!dateEvent) return "";
    const [y, m, d] = dateEvent.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

function getHistorico() {
    return JSON.parse(localStorage.getItem("historico")) || [];
}
function setHistorico(items) {
    localStorage.setItem("historico", JSON.stringify(items));
}

function migrarSePrecisar(item) {
    if ((item.palpiteHome == null || item.palpiteAway == null) && typeof item.palpite === "string") {
        const m = item.palpite.match(/(\d+)\s*x\s*(\d+)/i);
        if (m) {
            item.palpiteHome = Number(m[1]);
            item.palpiteAway = Number(m[2]);
        }
    }
    if (!item.status) item.status = "pending";
    if (item.realHome === undefined) item.realHome = null;
    if (item.realAway === undefined) item.realAway = null;
    if (item.acertouPlacar === undefined) item.acertouPlacar = null;
}

async function sincronizarResultados() {
    const items = getHistorico();
    let mudou = false;

    for (const item of items) {
        migrarSePrecisar(item);

        if (item.status === "finished" && item.realHome != null && item.realAway != null) continue;

        const res = await fetch(LOOKUP_URL(item.idEvent));
        const data = await res.json();
        const ev = data?.events?.[0];
        if (!ev) continue;

        const home = ev.intHomeScore;
        const away = ev.intAwayScore;

        const terminou = home !== null && away !== null;

        if (!terminou) continue;

        item.realHome = Number(home);
        item.realAway = Number(away);
        item.status = "finished";

        item.acertouPlacar =
            Number(item.palpiteHome) === item.realHome &&
            Number(item.palpiteAway) === item.realAway;

        item.pontos = item.acertouPlacar ? 3 : 0;
        mudou = true;
    }

    if (mudou) setHistorico(items);
    return getHistorico();
}

function renderHistorico() {
    if (!historicoEl) return;

    const items = getHistorico();

    const totalPontos = items.reduce((acc, it) => acc + (Number(it.pontos) || 0), 0);
    const acertos = items.filter(it => it.acertouPlacar === true).length;

    if (items.length === 0) {
        historicoEl.innerHTML = `<p class="historico-vazio">Nenhum palpite enviado ainda.</p>`;
        return;
    }

    historicoEl.innerHTML = `
  <div class="historico-header">
    <h2 class="historico-titulo">Palpites registrados</h2>
    <div><strong>Pontos:</strong> ${totalPontos} | <strong>Acertos:</strong> ${acertos}</div>
    <button class="btn btn-sec" data-action="refresh">Atualizar resultados</button>
  </div>
`;

    items.forEach(item => {
        migrarSePrecisar(item);

        const palpiteTxt = `${item.palpiteHome ?? "?"} x ${item.palpiteAway ?? "?"}`;

        const blocoResultado = (item.status === "finished")
            ? `
        <p class="meta">Placar real: <strong>${item.realHome} x ${item.realAway}</strong></p>
        <p class="resultado ${item.acertouPlacar ? "ok" : "no"}">
          ${item.acertouPlacar ? "ACERTOU O PLACAR" : "ERROU O PLACAR"}
        </p>
      `
            : `<p class="meta">Aguardando o jogo terminar...</p>`;

        historicoEl.innerHTML += `
      <div class="card-historico">
        <div class="card-topo">
          <p class="jogo"><strong>${item.jogo}</strong></p>
          <button class="btn-excluir" data-action="delete" data-id="${item.idEvent}">Excluir</button>
        </div>

        <p class="meta">${formatarData(item.data)} ${item.hora ? item.hora.slice(0, 5) : ""}</p>
        <p class="placar-registrado">Seu palpite: <strong>${palpiteTxt}</strong></p>

        ${blocoResultado}
      </div>
    `;
    });
}

if (historicoEl) {
    historicoEl.addEventListener("click", async (e) => {
        const delBtn = e.target.closest('[data-action="delete"]');
        const refreshBtn = e.target.closest('[data-action="refresh"]');

        if (delBtn) {
            const id = delBtn.getAttribute("data-id");
            const items = getHistorico().filter(item => String(item.idEvent) !== String(id));
            setHistorico(items);
            renderHistorico();
            if (typeof toast === "function") toast("Palpite excluído.", "success");
            return;
        }

        if (refreshBtn) {
            if (typeof toast === "function") toast("Atualizando resultados...", "info");
            await sincronizarResultados();
            renderHistorico();
            if (typeof toast === "function") toast("Resultados atualizados.", "success");
            return;
        }
    });

    (async () => {
        renderHistorico();
        await sincronizarResultados();
        renderHistorico();
    })();
}