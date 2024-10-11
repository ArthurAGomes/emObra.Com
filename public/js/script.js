// Função para inicializar o swiper com os resultados
function initSwiper() {
    swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 10,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

// Função para mostrar o loader e enviar o formulário de busca
// function buscarResultados() {
//     const loader = document.getElementById('loader');
//     const resultadosContainer = document.querySelector('.resultado-busca');

//     // Exibe o loader e oculta os resultados anteriores
//     loader.classList.add('show-loader');
//     resultadosContainer.style.display = 'none';
//     resultadosContainer.classList.remove('animate-slide-in');

//     // Envia o formulário após um pequeno delay para o loader ser exibido
//     setTimeout(() => {
//         const form = document.getElementById('buscaForm');
//         form.submit(); // Submete o formulário para realizar a busca
//     }, 300); // Delay de 300ms para exibir o loader antes da submissão
// }

// Evento quando a página carrega completamente com os resultados
// window.addEventListener('load', function() {
//     const loader = document.getElementById('loader');
//     const resultadosContainer = document.querySelector('.resultado-busca');

//     // Verifica se há parâmetros na URL (indicando que uma busca foi feita)
//     const urlParams = new URLSearchParams(window.location.search);
//     const temParametros = urlParams.toString().length > 0;

//     // Só rola a página para os resultados se houver parâmetros de busca
//     if (temParametros && resultadosContainer && resultadosContainer.children.length > 0) {
//         // Oculta o loader com uma transição suave
//         loader.classList.remove('show-loader');

//         // Exibe os resultados com a animação de deslizamento
//         setTimeout(() => {
//             resultadosContainer.style.display = 'flex';
//             resultadosContainer.classList.add('animate-slide-in');

//             // Faz o scroll suave até o contêiner de resultados
//             resultadosContainer.scrollIntoView({ behavior: 'smooth' });
//         }, 300); // Delay para a animação de deslizamento

//         // Inicializa o swiper para que funcione corretamente após os resultados
//         initSwiper();
//     }
// });


function setUserType(type) {
    if (type === 'pedreiro') {
        document.getElementById('registrationForm').style.display = 'flex';
        document.getElementById('registrationFormContratante').style.display = 'none';
        document.getElementById('registrationForm').action = '/register/pedreiro';
        document.getElementById('btnPedreiro').style.cssText = 'background-color: #fff; box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.4); color: #020411;';
        
        document.getElementById('btnContratante').style.cssText = 'background-color: #020411; box-shadow: none; color: #fff;';
    } else {
        document.getElementById('registrationFormContratante').style.display = 'flex';
        document.getElementById('registrationForm').style.display = 'none';
        document.getElementById('registrationFormContratante').action = '/register/contratante';
        document.getElementById('redirecionar-login').style.display = 'block'
        document.getElementById('btnContratante').style.cssText = 'background-color: #fff; box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.4); color: #020411;';
        
        document.getElementById('btnPedreiro').style.cssText = 'background-color: #020411; box-shadow: none; color: #fff;';
    }
}
function avancarCadastro() {
    const cadastrarTipoServico = document.querySelectorAll('.cadastro-tipo-servico');
    const esconderInicio = document.querySelectorAll('.avancar-cadastro-pedreiro');
    
        cadastrarTipoServico.forEach(tipo => {
            tipo.style.display = 'block';
        });
        esconderInicio.forEach(tipo => {
            tipo.style.display = 'none'; // Oculta a primeira parte
        });
    
}
