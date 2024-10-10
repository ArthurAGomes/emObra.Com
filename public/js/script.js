// document.getElementById('upload-file').addEventListener('change', function() {
//     document.getElementById('upload-form').submit();
// });

var swiper = new Swiper(".mySwiper", {
    slidesPerView: "auto",
    spaceBetween: 10,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-buscar-servico').addEventListener('click', function(event) {
        event.preventDefault();
        buscarResultados();
    });

    document.getElementById('btn-buscar-pedreiro').addEventListener('click', function(event) {
        event.preventDefault();
        buscarResultados();
    });
});

// Função para mostrar o loader e enviar o formulário de busca
function buscarResultados() {
    const loader = document.getElementById('loader');
    const resultadosContainer = document.querySelector('.resultado-busca');

    // Exibe o loader e oculta os resultados anteriores
    loader.classList.add('show-loader');
    resultadosContainer.style.display = 'none';
    resultadosContainer.classList.remove('animate-slide-in');

    // Envia o formulário após um pequeno delay para o loader ser exibido
    setTimeout(() => {
        const form = document.getElementById('buscaForm');
        form.submit(); // Submete o formulário para realizar a busca
    }, 300); // Delay de 300ms para exibir o loader antes da submissão
}

// Função para inicializar o swiper com os resultados
function initSwiper() {
    swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 30,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

// Evento quando a página carrega completamente com os resultados
window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    const resultadosContainer = document.querySelector('.resultado-busca');

    // Verifica se há resultados e os exibe com animação
    if (resultadosContainer && resultadosContainer.children.length > 0) {
        // Oculta o loader com uma transição suave
        loader.classList.remove('show-loader');

        // Exibe os resultados com a animação de deslizamento
        resultadosContainer.style.display = 'block';
        setTimeout(() => {
            resultadosContainer.classList.add('animate-slide-in');
        }, 100); // Delay para a animação de deslizamento

        // Inicializa o swiper para que funcione corretamente após os resultados
        initSwiper();
    }
});
