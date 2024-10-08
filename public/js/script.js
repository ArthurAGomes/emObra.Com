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
