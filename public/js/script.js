// document.getElementById('upload-file').addEventListener('change', function() {
//     document.getElementById('upload-form').submit();
// });

let swiper;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-buscar-servico').addEventListener('click', function(event) {
        event.preventDefault();
        buscarResultados();
    });

    document.getElementById('btn-buscar-pedreiro').addEventListener('click', function(event) {
        event.preventDefault();
        buscarResultados();
    });

    initSwiper();
});

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

function buscarResultados() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';

    const form = document.getElementById('buscaForm');
    const formData = new FormData(form);

    console.log('Dados do formulário:', Object.fromEntries(formData.entries()));

    fetch('/buscar?' + new URLSearchParams(formData))
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        })
        .then(data => {
            loader.style.display = 'none';
            console.log('Dados recebidos do backend:', data);

            const resultadoContainer = document.querySelector('.resultado-busca .swiper-wrapper');
            resultadoContainer.innerHTML = '';

            let resultados = [];
            if (data.servicos && data.servicos.length > 0) {
                resultados = resultados.concat(data.servicos);
            }
            if (data.resultados && data.resultados.length > 0) {
                resultados = resultados.concat(data.resultados);
            }

            if (resultados.length > 0) {
                resultados.forEach(resultado => {
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide', 'card-resultado-busca');

                    const imagemServico = resultado.img_servico || 'default.jpg';

                    slide.innerHTML = `
                        <h3>${resultado.descricao}</h3>
                        <div class="container-servico-top">
                            <div class="background-icon-servico">
                                <img src="/imgs-fixas/${imagemServico}" alt="">
                            </div>
                            <div class="info-principais-servico">
                                <div class="distancia-servico">
                                    <span>Distância</span>
                                    <p><span>${resultado.distancia || 0}</span> km de você</p>
                                </div>
                                <button type="submit">Candidatar-se</button>
                            </div>
                        </div>
                        <div class="input-descricao-servico">
                            <div class="descricao-post">
                                <label for="input" class="text">Descrição do serviço</label>
                                <textarea type="text" placeholder="${resultado.descricao}" name="input" class="input" maxlength="300" rows="4" cols="50" disabled></textarea>
                            </div>
                        </div>
                        <hr>
                        <div class="footer-servico">
                            <p>Valor: R$ ${resultado.valor},00</p>
                            <p>Prazo: ${resultado.prazo_combinar}</p>
                        </div>
                        <h4>${resultado.endereco || resultado.address || 'Endereço não disponível'}</h4>
                    `;

                    resultadoContainer.appendChild(slide);
                });

                // Destruir o Swiper existente e inicializar novamente
                if (swiper) {
                    swiper.destroy();
                }
                initSwiper();

                // Mostrar a seção de resultados
                document.querySelector('.resultado-busca').style.display = 'block';

                // Desabilitar o formulário de busca
                document.getElementById('buscaForm').querySelectorAll('input, button').forEach(element => {
                    element.disabled = true;
                });

                // Adicionar um botão para nova busca
                const novaBuscaBtn = document.createElement('button');
                novaBuscaBtn.textContent = 'Nova Busca';
                novaBuscaBtn.addEventListener('click', () => {
                    location.reload();
                });
                document.querySelector('.buscador').appendChild(novaBuscaBtn);
            } else {
                resultadoContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            console.error('Erro:', error);
            const resultadoContainer = document.querySelector('.resultado-busca .swiper-wrapper');
            resultadoContainer.innerHTML = '<p>Ocorreu um erro ao buscar os resultados.</p>';
        });
}