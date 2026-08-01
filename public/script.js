console.log("script carregou");
const NEXT_URL =
    "https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4351";

function ROUND_URL(round, season) {
    return `https://www.thesportsdb.com/api/v1/json/123/eventsround.php?id=4351&r=${round}&s=${season}`;
}

const jogoEl = document.getElementById("jogo");
const timeEl = document.getElementById("time");

const prevRoundBtn = document.getElementById("prev-round");
const nextRoundBtn = document.getElementById("next-round");
const rodadaLabelEl = document.getElementById("rodada-label");

let currentRound = null;
let currentSeason = null;
const MAX_ROUND = 38;

async function carregarRodada(round) {
    if (!jogoEl) return;
    if (!currentSeason) return;

    const resRound = await fetch(ROUND_URL(round, currentSeason));
    const dataRound = await resRound.json();

    jogos = dataRound.events || [];
    currentRound = Number(round);

    renderJogos();
    atualizarBloqueios();

    localStorage.setItem("rodadaSelecionada", String(currentRound));

    if (rodadaLabelEl) rodadaLabelEl.textContent = `Rodada ${currentRound}`;
    if (prevRoundBtn) prevRoundBtn.disabled = currentRound <= 1;
    if (nextRoundBtn) nextRoundBtn.disabled = currentRound >= MAX_ROUND;
}

function toast(message, type = "info") {
    let container = document.querySelector(".toast-container");

    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;

    container.appendChild(el);

    setTimeout(() => {
        el.remove();
        if (container.childElementCount === 0) container.remove();
    }, 2200);
}


let jogos = [];

function renderJogos() {
    if (!jogoEl) return;

    jogoEl.innerHTML = "";

    for (const jogo of jogos) {
        const fechado = jogoFechado(jogo);

        jogoEl.innerHTML += `
      <div class="card-jogo" data-event-id="${jogo.idEvent}">
        <h2>${jogo.strHomeTeam} vs ${jogo.strAwayTeam}</h2>
        <p class="meta">${formatarData(jogo.dateEvent)} - ${jogo.strTime?.slice(0, 5) || ""}</p>

        <div class="linha-placar">
          <input type="number" value="0" min="0" ${fechado ? "disabled" : ""}>
          <span>X</span>
          <input type="number" value="0" min="0" ${fechado ? "disabled" : ""}>
        </div>

        <button class="btn btn-enviar"
                ${fechado ? "disabled" : ""}
                onclick="enviarPalpite('${jogo.idEvent}', this)">
          ${fechado ? "Jogo fechado" : "Enviar Palpite"}
        </button>
      </div>
    `;
    }
}

async function carregarJogo() {
    if (!jogoEl) return;

    try {
        const resNext = await fetch(NEXT_URL);
        const dataNext = await resNext.json();

        const nextEvent = dataNext.events?.[0];
        if (!nextEvent) {
            jogoEl.innerHTML = "Nenhum próximo jogo encontrado";
            return;
        }

        currentSeason = nextEvent.strSeason;
        const roundApi = Number(nextEvent.intRound);

        const roundSalva = Number(localStorage.getItem("rodadaSelecionada"));
        const roundInicial = roundSalva || roundApi;

        await carregarRodada(roundInicial);

        // listeners (só liga uma vez)
        if (prevRoundBtn && !prevRoundBtn.dataset.bound) {
            prevRoundBtn.dataset.bound = "1";
            prevRoundBtn.addEventListener("click", () => {
                if (currentRound > 1) carregarRodada(currentRound - 1);
            });
        }

        if (nextRoundBtn && !nextRoundBtn.dataset.bound) {
            nextRoundBtn.dataset.bound = "1";
            nextRoundBtn.addEventListener("click", () => {
                if (currentRound < MAX_ROUND) carregarRodada(currentRound + 1);
            });
        }
    } catch (err) {
        console.error(err);
        jogoEl.innerHTML = "Erro ao carregar jogos";
    }
}

function enviarPalpite(idEvent, botao) {
    const jogo = jogos.find(j => String(j.idEvent) === String(idEvent));

    if (!jogo) {
        console.log("Jogo não encontrado para o idEvent:", idEvent);
        return;
    }

    if (jogoFechado(jogo)) {
        toast("Esse jogo já começou/terminou. Palpite fechado.", "error");
        return;
    }

    const card = botao.closest(".card-jogo");
    const inputs = card.querySelectorAll("input");
    const placarCasa = inputs[0].value;
    const placarFora = inputs[1].value;

    salvarPalpite(jogo, placarCasa, placarFora);
}

carregarJogo();

function formatarData(dateEvent) {
    if (!dateEvent) return "";
    const [year, month, day] = dateEvent.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    return dt.toLocaleDateString("pt-BR");
}

function salvarPalpite(jogo, placarCasa, placarFora) {
    const historico = JSON.parse(localStorage.getItem("historico")) || [];

    const jaExiste = historico.some(p => p.idEvent === jogo.idEvent);
    if (jaExiste) {
        toast("Você já enviou um palpite para este jogo!");
        return;
    }

    historico.push({
        round: jogo.intRound,
        season: jogo.strSeason,
        pontos: 0,
        idEvent: jogo.idEvent,
        jogo: `${jogo.strHomeTeam} vs ${jogo.strAwayTeam}`,
        data: jogo.dateEvent,
        hora: jogo.strTime,

        palpiteHome: Number(placarCasa),
        palpiteAway: Number(placarFora),

        status: "pending",
        realHome: null,
        realAway: null,

        acertouPlacar: null,

        palpiteTexto: `${placarCasa} x ${placarFora}`

    });

    localStorage.setItem("historico", JSON.stringify(historico));
    toast("Palpite enviado com sucesso!");



}


const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("close-btn")

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("aberta");
})

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("aberta");
})

function atualizarHora() {
    if (!timeEl) return;
    const agora = new Date();
    timeEl.textContent = "Hora: " + agora.toLocaleString("pt-BR");
}

atualizarHora();
setInterval(atualizarHora, 1000);

function jogoFechado(jogo) {
    if (jogo.strStatus === "Match Finished") return true;
    if (jogo.intHomeScore != null && jogo.intAwayScore != null) return true;

    if (!jogo.dateEvent) return false;

    const time = (jogo.strTime || "00:00:00").slice(0, 8);
    const dt = new Date(`${jogo.dateEvent}T${time}`);

    return new Date() >= dt;
}

function atualizarBloqueios() {
    if (!jogoEl || !jogos || jogos.length === 0) return;

    for (const jogo of jogos) {
        const card = jogoEl.querySelector(`[data-event-id="${jogo.idEvent}"]`);
        if (!card) continue;

        const fechado = jogoFechado(jogo);

        // inputs
        card.querySelectorAll("input").forEach(inp => {
            inp.disabled = fechado;
        });

        // botão
        const btn = card.querySelector(".btn-enviar");
        if (btn) {
            btn.disabled = fechado;
            btn.textContent = fechado ? "Jogo fechado" : "Enviar Palpite";
        }
    }
}

setInterval(atualizarBloqueios, 30000);
// ---------------------------------------------------------------------------------------
