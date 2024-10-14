let tipoBusca = '';

document.getElementById('btn-buscar-servico').addEventListener('click', function () {
    tipoBusca = 'servico'; // Define o tipo de busca como 'servico'
    buscar(); // Chama a função de busca
});

document.getElementById('btn-buscar-pedreiro').addEventListener('click', function () {
    tipoBusca = 'pedreiro'; // Define o tipo de busca como 'pedreiro'
    buscar(); // Chama a função de busca
});

function buscar() {
    const queryString = new URLSearchParams(new FormData(document.getElementById('buscaForm'))).toString();
    const loader = document.getElementById('loader');
    const resultadosContainer = document.getElementById('swiper-wrapper');
    const resultadoBusca = document.getElementById('resultado-busca');

    // Exibe o loader enquanto os resultados são carregados
    loader.classList.add('show-loader');
    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });
    resultadoBusca.style.display = 'none';

    if (tipoBusca === 'servico') {
        buscarServicos(queryString, resultadosContainer, loader, resultadoBusca);
    } else if (tipoBusca === 'pedreiro') {
        buscarPedreiros(queryString, resultadosContainer, loader, resultadoBusca);
    }
}

function buscarServicos(queryString, resultadosContainer, loader, resultadoBusca) {
    // Exibe o loader
    loader.classList.add('show-loader');

    fetch(`/buscar?${queryString}&tipo=servico`)
        .then(response => response.json())
        .then(data => {
            // Remove o loader após receber os dados
            loader.classList.remove('show-loader');

            // Limpa o container de resultados
            resultadosContainer.innerHTML = '';
            const swiperWrapper = document.getElementById('swiper-wrapper');
            swiperWrapper.innerHTML = '';

            if (data.mensagem) {
                resultadosContainer.innerHTML = `<p>${data.mensagem}</p>`;
            } else {
                data.resultados.forEach(resultado => {
                    const card = `
                <div class="swiper-slide card-resultado-busca">
                    <form class="super-container card-servico">
                        <h3>${resultado.nome_servico}</h3>
                        <div class="container-servico-top">
                            <div class="background-icon-servico">
                                <img src="/imgs-fixas/${resultado.imagem_servico}" alt="">
                            </div>
                            <div class="info-principais-servico">
                                <div class="distancia-servico">
                                    <span>Distância</span>
                                    <p><span>${resultado.distancia}</span> km de você</p>
                                </div>
                                <button type="submit" class="btn-me-candidatar">Candidatar-se</button>
                            </div>
                        </div>
                        <div class="input-descricao-servico">
                            <div class="descricao-post">
                                <label for="input" class="text">Descrição do serviço</label>
                                <textarea type="text" placeholder="${resultado.descricao}" name="input"
                                    class="input" maxlength="300" rows="4" cols="50" disabled></textarea>
                            </div>
                        </div>
                        <hr>
                        <div class="footer-servico">
                            <p>Valor: R$ ${resultado.valor},00</p>
                            <p>Prazo: ${resultado.prazo_combinar}</p>
                        </div>
                        <h4>${resultado.endereco}</h4>
                    </form>
                </div>
            `;
                    swiperWrapper.innerHTML += card;
                });

                resultadoBusca.style.display = 'block';
                setTimeout(() => {
                    resultadoBusca.classList.add('animate-slide-in');
                }, 100);

                // Inicialize o swiper para os resultados de serviços
                initSwiperResultados();

                document.querySelectorAll('.btn-me-candidatar').forEach(button => {
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                
                        // Verificar se o usuário está autenticado
                        fetch('/isAuthenticated')
                            .then(response => response.json())
                            .then(data => {
                                if (data.authenticated) {
                                    // Se estiver autenticado, abre o modal
                                    window.alert("Proposta enviada");  // Função que abre o modal
                                } else {
                                    // Se não estiver autenticado, redireciona para a página de login
                                    window.location.href = '/login';
                                }
                            })
                            .catch(error => {
                                console.error('Erro ao verificar autenticação:', error);
                            });
                    });
                });
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            loader.classList.remove('show-loader');
        });
}


function buscarPedreiros(queryString, resultadosContainer, loader, resultadoBusca) {
    // Exibe o loader
    loader.classList.add('show-loader');

    fetch(`/buscar?${queryString}&tipo=pedreiro`)
        .then(response => response.json())
        .then(data => {
            // Remove o loader
            loader.classList.remove('show-loader');

            // Limpa o container de resultados e o swiper-wrapper
            resultadosContainer.innerHTML = '';
            const swiperWrapper = document.getElementById('swiper-wrapper');
            swiperWrapper.innerHTML = '';

            if (data.mensagem) {
                resultadosContainer.innerHTML = `<p>${data.mensagem}</p>`;
            } else {
                // Criar um Set para controlar pedreiros já adicionados e evitar duplicações
                const pedreirosAdicionados = new Set();

                data.resultados.forEach(resultado => {
                    if (!pedreirosAdicionados.has(resultado.id)) {
                        pedreirosAdicionados.add(resultado.id); // Marca o pedreiro como já adicionado

                        const card = `
                            <div class="swiper-slide card-resultado-busca">
                                <form class="super-container card-pedreiro ">
                                    <div class="header-card-pedreiro">
                                        <h3>${resultado.nome}</h3>
                                        <i class="fa-solid fa-certificate" style="opacity: ${resultado.premium ? '1' : '0'};"></i>
                                    </div>
                                    
                                    <div class="container-card-pedreiro-top">
                                        <img src="/imagensPedreiro/${resultado.img_perfil}" alt="Foto de Perfil" class="img-perfil-card-pedreiro">
                                        <div class="info-principais-servico">
                                            <div class="distancia-servico">
                                                <span>Avaliação</span>
                                                <p><span>${resultado.distancia}</span> km de você</p>
                                            </div>
                                            <button id="fazer-proposta" type="button" class="btn btn-primary btn-fazer-proposta" data-id="${resultado.id}" data-nome="${resultado.nome}">Fazer Proposta</button>
                                        </div>
                                    </div>

                                    <hr>
                                    <div class="input-servicos-oferecidos">
                                        <div class="descricao-post">
                                            <h5>Serviços oferecidos</h5>
                                            <p>${resultado.nome_servico}</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        `;
                        swiperWrapper.innerHTML += card;           

                        document.querySelectorAll('.btn-fazer-proposta').forEach(button => {
                            button.addEventListener('click', function(event) {
                                event.preventDefault();

                                // Captura o id e o nome do pedreiro diretamente do botão
                                const pedreiroId = this.getAttribute('data-id');
                                const pedreiroNome = this.getAttribute('data-nome');
                            
                                // Verificar se o usuário está autenticado
                                fetch('/isAuthenticated')
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.authenticated) {
                                            // Se estiver autenticado, abre o modal e o overlay
                                            const modalCards = document.getElementById("modal-cards-proposta");
                                            const modalOverlay = document.getElementById("modal-cards-overlay");
                                            modalCards.style.display = "flex";
                                            modalOverlay.style.display = "block";

                                            // Atualiza o modal com o nome do pedreiro
                                            const modalTitulo = document.getElementById('modal-nome-pedreiro');
                                            modalTitulo.textContent = `${pedreiroNome}`;
                                            
                                            // Oculta o id do pedreiro em um campo hidden no formulário do modal
                                            const modalForm = document.getElementById('modal-form');
                                            const hiddenIdInput = modalForm.querySelector('input[name="pedreiroId"]');
                                            hiddenIdInput.value = pedreiroId;

                                            document.getElementById('cep').value = data.cep;
                                            
                                        } else {
                                            // Se não estiver autenticado, redireciona para a página de login
                                            window.location.href = '/login';
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Erro ao verificar autenticação:', error);
                                    });
                            });
                        });
                        
                        // Código para fechar o modal
                        const closeModalBtn = document.getElementById("modal-cards-close-btn");
                        const modalOverlay = document.getElementById("modal-cards-overlay");
                        const modalCards = document.getElementById("modal-cards-proposta");
                        
                        closeModalBtn.addEventListener('click', function() {
                            modalCards.style.display = "none";
                            modalOverlay.style.display = "none";
                        });
                        
                        modalOverlay.addEventListener('click', function() {
                            modalCards.style.display = "none";
                            modalOverlay.style.display = "none";
                        });
                                                
                        // function abrirModalProposta() {
                        //     // Aqui você implementa a lógica para abrir o modal de proposta
                        //     document.getElementById('modalProposta').style.display = 'block';
                        // }
                        
                        
                    }
                });

                resultadoBusca.style.display = 'block';
                setTimeout(() => {
                    resultadoBusca.classList.add('animate-slide-in');
                }, 100);

                // Inicialize o swiper dos resultados de busca
                initSwiperResultados();
            }
        }) 
        .catch(error => {
            console.error('Erro:', error);
            loader.classList.remove('show-loader');
        });
}




// Variáveis para armazenar as instâncias do swiper
let swiperBanners, swiperResultados;

// Função para inicializar o swiper de banners
function initSwiperBanners() {
    if (swiperBanners) {
        swiperBanners.destroy(); // Destrói a instância anterior, se existir
    }

    swiperBanners = new Swiper(".myCaroussel", {
        slidesPerView: "auto",
        spaceBetween: 10,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

// Função para inicializar o swiper de resultados de busca
function initSwiperResultados() {
    if (swiperResultados) {
        swiperResultados.destroy(); // Destroi a instância anterior, se existir
    }

    swiperResultados = new Swiper(".resultado-busca .mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 10,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}


// Inicializa todos os swipers na primeira carga
document.addEventListener('DOMContentLoaded', function () {
    initSwiperBanners(); // Inicia o swiper dos banners
});


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


// Função para inicializar o swiper com os resultados
// function initSwiper() {
    
// }

// swiper = new Swiper(".mySwiper", {
//     slidesPerView: "auto",
//     spaceBetween: 10,
//     pagination: {
//         el: ".swiper-pagination",
//         clickable: true,
//     },
// });

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

// // Evento quando a página carrega completamente com os resultados
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

// document.getElementById('buscaForm').addEventListener('submit', function (event) {
        //     event.preventDefault(); // Impede o refresh da página

        //     const loader = document.getElementById('loader');
        //     const resultadosContainer = document.getElementById('swiper-wrapper');
        //     const resultadoBusca = document.getElementById('resultado-busca');

        //     // Exibe o loader e esconde os resultados enquanto os dados estão sendo carregados
        //     loader.classList.add('show-loader');
        //     loader.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Faz a página rolar para o loader
        //     resultadoBusca.style.display = 'none';

        //     // Captura os dados do formulário
        //     const formData = new FormData(this);
        //     const queryString = new URLSearchParams(formData).toString();

        //     // Faz a requisição AJAX
        //     fetch(`/buscar?${queryString}`)
        //         .then(response => response.json())
        //         .then(data => {
        //             // Oculta o loader e exibe os resultados
        //             loader.classList.remove('show-loader');

        //             // Limpa o container antes de exibir novos resultados
        //             resultadosContainer.innerHTML = '';

        //             if (data.mensagem) {
        //                 resultadosContainer.innerHTML = `<p>${data.mensagem}</p>`;
        //             } else {
        //                 // Exibe os resultados recebidos
        //                 data.resultados.forEach(resultado => {
        //                     const card = `
        //                 <div class="swiper-slide card-resultado-busca">
        //                     <form class="super-container">
        //                         <h3>${resultado.nome_servico}</h3>
        //                         <div class="container-servico-top">
        //                             <div class="background-icon-servico">
        //                                 <img src="/imgs-fixas/${resultado.imagem_servico}" alt="">
        //                             </div>
        //                             <div class="info-principais-servico">
        //                                 <div class="distancia-servico">
        //                                     <span>Distância</span>
        //                                     <p><span>${resultado.distancia}</span> km de você</p>
        //                                 </div>
        //                                 <button type="submit">Candidatar-se</button>
        //                             </div>
        //                         </div>
        //                         <div class="input-descricao-servico">
        //                             <div class="descricao-post">
        //                                 <label for="input" class="text">Descrição do serviço</label>
        //                                 <textarea type="text" placeholder="${resultado.descricao}" name="input"
        //                                     class="input" maxlength="300" rows="4" cols="50" disabled></textarea>
        //                             </div>
        //                         </div>
        //                         <hr>
        //                         <div class="footer-servico">
        //                             <p>Valor: R$ ${resultado.valor},00</p>
        //                             <p>Prazo: ${resultado.prazo_combinar}</p>
        //                         </div>
        //                         <h4>${resultado.endereco}</h4>
        //                     </form>
        //                 </div>
        //             `;
        //                     resultadosContainer.innerHTML += card;
        //                 });

        //                 // Inicializa o Swiper novamente após adicionar os novos slides
        //                 initSwiper();

        //                 // Torna o container de resultados visível
        //                 resultadoBusca.style.display = 'block';
        //                 setTimeout(() => {
        //                     resultadoBusca.classList.add('animate-slide-in');
        //                 }, 100);
        //             }
        //         })
        //         .catch(error => {
        //             console.error('Erro:', error);
        //             loader.classList.remove('show-loader'); // Oculta o loader mesmo em caso de erro
        //         });
        // });


        // function initSwiper() {
        //     if (swiper) {
        //         swiper.destroy(); // Destrói a instância anterior, se existir
        //     }

        //     swiper = new Swiper(".mySwiper", {
        //         slidesPerView: "auto",
        //         spaceBetween: 10,
        //         pagination: {
        //             el: ".swiper-pagination",
        //             clickable: true,
        //         },
        //     });
        // }



