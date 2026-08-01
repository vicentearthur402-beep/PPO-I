console.log("script carregou");
const API_URL =
    "https://www.thesportsdb.com/api/v1/json/123/eventsseason.php?id=4351&s=2026";

    let jogos

async function carregarJogo() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

     jogos = data.events;
     console.log(jogos);
     console.log(jogos.length);

        if (!jogos || jogos.length === 0) {
            document.getElementById("jogo").innerHTML =
                "Nenhum jogo encontrado";
            return;
        }

        for (let i = 0; i < jogos.length; i++) {

        const jogo = jogos[i];
        jogo.strHomeTeam
        jogo.strAwayTeam
        jogo.dateEvent  


        document.getElementById("jogo").innerHTML += `
            <div style="text-align:center; color:white; padding-top:140px;">
                <h2>${jogo.strHomeTeam} vs ${jogo.strAwayTeam}</h2>
                <p>${formatarData(jogo.dateEvent)} - ${jogo.strTime?.slice(0,5)}</p>
                <input type="number" value="0" min="0"><p>X</p><input type="number" value="0" min="0">
                <button onclick="enviarPalpite(${i}, this)" >Enviar Palpite!</button>

            </div>
        `;
        }
    } catch (err) {
        console.error(err);
        document.getElementById("jogo").innerHTML =
            "Erro ao carregar jogo";
    }
}

function enviarPalpite(index, botao) {
const jogo = jogos[index];
const card = botao.parentElement;
const inputs = card.querySelectorAll("input");
const placarCasa = inputs[0].value;
const placarFora = inputs[1].value;

salvarPalpite(jogo, placarCasa, placarFora);

}

carregarJogo();
        
    function formatarData(dataISO) {
    return new Date(dataISO).toLocaleDateString("pt-BR");
}

function salvarPalpite(jogo, placarCasa, placarFora) {
    const palpites = JSON.parse(localStorage.getItem("palpites")) || [];

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

