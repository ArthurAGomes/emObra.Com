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


function testando() {
    // Exibe o loader
    const loader = document.querySelector('.loader');
    loader.style.display = 'flex'; // Mostra o loader

    // Define um timeout para simular o tempo de carregamento
    setTimeout(() => {
        // Oculta o loader após 3 segundos
        loader.style.display = 'none';
        // Chama a função que mostra o resultado
        mostrarResultadoBusca();
    }, 3000); // 3000 milissegundos = 3 segundos
}

function mostrarResultadoBusca() {
    const resultadoBusca = document.querySelector('.resultado-busca');

    // Verifica se o display está 'none' e altera para 'block' se necessário
    if (resultadoBusca.style.display === 'none' || resultadoBusca.style.display === '') {
        resultadoBusca.style.display = 'block'; // Exibe o elemento

        // Força um reflow para garantir que a animação seja aplicada corretamente
        resultadoBusca.offsetHeight;

        // Adiciona a classe de animação para efeito de deslizar da direita
        resultadoBusca.classList.add('animate-slide-in');
    }
}



