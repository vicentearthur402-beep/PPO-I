const historico = document.getElementById("historico");
if(historico) {
    console.log("entrou no histórico");
    const palpites = JSON.parse(localStorage.getItem("palpites")) || [];
    for(let i = 0; i < palpites.length; i++) {
        const palpite = palpites[i];
        historico.innerHTML += `
        <p>${palpite.jogo}</p>
        <p>Seu Palpite: ${palpite.palpite}</p>
        `;
    }
}