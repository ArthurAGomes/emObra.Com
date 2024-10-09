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
    const loader = document.querySelector('.loader');
    const resultadoBusca = document.querySelector('.resultado-busca');

    // Reiniciar estado: esconder o resultado-busca e resetar o loader
    resultadoBusca.style.display = 'none'; // Esconder o resultado se já estiver na tela
    resultadoBusca.classList.remove('animate-slide-in'); // Remove a animação para resetar
    
    // Mostrar o loader com animação
    loader.style.display = 'flex'; // Exibe o loader
    setTimeout(() => {
        loader.classList.add('show-loader'); // Aplica a animação suave
    }, 10);

    // Após 3 segundos, remove o loader e mostra o resultado-busca novamente
    setTimeout(() => {
        loader.classList.remove('show-loader'); // Remove a animação do loader
        setTimeout(() => {
            loader.style.display = 'none'; // Esconde o loader
            resultadoBusca.style.display = 'block'; // Exibe o resultado-busca novamente
            resultadoBusca.classList.add('animate-slide-in'); // Adiciona a animação
        }, 500); // Atraso para permitir que o loader desapareça suavemente
    }, 3000); // Duração do loading
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



