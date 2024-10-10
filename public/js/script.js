var swiper = new Swiper(".mySwiper", {
    slidesPerView: "auto",
    spaceBetween: 30,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

document.getElementById('upload-file').addEventListener('change', function() {
    // Quando o arquivo é selecionado, o formulário é submetido automaticamente
    document.getElementById('upload-form').submit();
});


document.getElementById('buscarBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Previne o comportamento padrão (recarregamento da página)
    buscarResultados(); // Chama a função para buscar resultados
});

async function buscarResultados() {
    const loader = document.querySelector('.loader');
    const resultadoModal = document.getElementById('resultadoModal');
    const resultadoBuscaContainer = document.getElementById('resultadoBuscaContainer');

    // Reiniciar estado: limpar resultados anteriores e mostrar o loader
    resultadoBuscaContainer.innerHTML = ''; // Limpa o conteúdo anterior
    loader.style.display = 'flex'; // Exibe o loader

    setTimeout(() => {
        loader.classList.add('show-loader'); // Aplica a animação suave
    }, 10);

    // Simula uma chamada de API para buscar resultados
    const cep = document.querySelector('#cepInput').value; // Supondo que você tenha um input para o CEP
    const tipo = 'servico'; // ou 'pedreiro', conforme necessário
    const engine = 'seuEngineAqui'; // Substitua pelo valor correto

    try {
        const response = await fetch(`/buscar?cep=${cep}&tipo=${tipo}&engine=${engine}`);
        const data = await response.json();

        if (data.resultados.length > 0) {
            exibirResultados(data.resultados);
        } else {
            alert(data.mensagem); // Exibe mensagem se não houver resultados
        }
    } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        alert('Erro ao buscar resultados.');
    } finally {
        loader.classList.remove('show-loader'); // Remove a animação do loader
        loader.style.display = 'none'; // Esconde o loader
    }
}

function exibirResultados(resultados) {
    const resultadoBuscaContainer = document.getElementById('resultadoBuscaContainer');

    resultados.forEach(resultado => {
        const card = document.createElement('div');
        card.classList.add('card-resultado-busca');
        card.innerHTML = `
            <h3>${resultado.nome_servico}</h3>
            <div class="container-servico-top">
                <img src="/imgs-fixas/${resultado.imagem_servico}" alt="">
                <p>Distância: ${resultado.distancia} km</p>
                <p>Valor: R$ ${resultado.valor},00</p>
                <p>Prazo: ${resultado.prazo_combinar}</p>
                <h4>${resultado.endereco}</h4>
            </div>
        `;
        resultadoBuscaContainer.appendChild(card);
    });

    // Exibe o modal
    document.getElementById('resultadoModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('resultadoModal').style.display = 'none';
}
