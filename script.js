// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Hesaplama Dünyası ana sayfası yüklendi!");

    // Örnek: Butonlara tıklandığında konsola mesaj yazdırma
    // Gerçek uygulamada bu kısım her sayfanın kendi JS dosyasına veya
    // daha karmaşık genel fonksiyonlara ayrılabilir.
    const toolButtons = document.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // event.preventDefault(); // Eğer linke gitmesini istemezsek
            console.log(`${this.textContent.trim()} butonuna tıklandı.`);
            // Burada, SPA (Single Page Application) mantığıyla içerik yükleme vs. yapılabilir
            // ama şu anki yapıda direkt linklere yönleniyoruz.
        });
    });

    // İleride eklenebilecek genel fonksiyonlar:
    // - Tema değiştirici (açık/koyu mod)
    // - Dil seçimi
    // - Animasyonlu scroll efektleri vb.
});