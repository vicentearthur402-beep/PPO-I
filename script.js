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
    const agora = new Date();
    document.getElementById("time").textContent =
     agora.toLocaleString("pt-BR");
}

atualizarHora();
setInterval(atualizarHora, 1000);

// ---------------------------------------------------------------------------------------

const API_URL =
    "https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4351";

async function carregarJogo() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const jogo = data.events?.[0];

        if (!jogo) {
            document.getElementById("jogo").innerHTML =
                "Nenhum jogo encontrado";
            return;
        }

        document.getElementById("jogo").innerHTML = `
            <div style="text-align:center; color:white; padding-top:140px;">
                <h2>${jogo.strHomeTeam} vs ${jogo.strAwayTeam}</h2>
                <p>${formatarData(jogo.dateEvent)} - ${jogo.strTime?.slice(0,5)}</p>
            </div>
        `;
    } catch (err) {
        console.error(err);
        document.getElementById("jogo").innerHTML =
            "Erro ao carregar jogo";
    }
}

carregarJogo();
        
    function formatarData(dataISO) {
    return new Date(dataISO).toLocaleDateString("pt-BR");
}

function salvarPalpite(jogo, placarCasa, placarFora) {
    const palpites = JSON.parse(localStorage.getItem("Palpites")) || [];

    palpites.push({
        jogo: `${jogo.strHomeTeam} vs ${jogo.strAwayTeam}`,
        data:  jogo.dateEvent,
        hora: jogo.strTime,
        palpite: `${placarCasa} x ${placarFora}`
    });

    localStorage.setItem("palpites", JSON.stringify(palpites));

    function jogoTerminou(dataJogo) {
    const hoje = new Date();
    const jogo = new Date(dataJogo);

    return hoje >= jogo;
}

function moverParaHistorico() {
    const palpites = JSON.parse(localStorage.getItem("palpites")) || [];
    const historico = JSON.parse(localStorage.getItem("historico")) || [];

    const novos = [];
    
    palpites.forEach(item => {
        if (jogoTerminou(item.data)) {
            historico.push(item);
        } else {
            novos.push(item);
        }
    });

    localStorage.setItem("palpites", JSON.stringify(novos));
    localStorage.setItem("historico", JSON.stringify(historico));
}
}