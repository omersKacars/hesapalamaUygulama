// radiator-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const radiatorForm = document.getElementById('radiatorForm');
    const resultArea = document.getElementById('resultArea');
    const errorMessageBox = document.getElementById('error-message-box');
    const currentYearSpan = document.getElementById('current-year');

    // Sonuç span'leri
    const resultRoomVolumeSpan = document.getElementById('resultRoomVolume');
    const resultHeatLossWattSpan = document.getElementById('resultHeatLossWatt');
    const resultHeatLossKcalSpan = document.getElementById('resultHeatLossKcal');
    const resultRadiatorLengthSpan = document.getElementById('resultRadiatorLength');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Kcal/h 'yi Watt'a çevirme faktörü (1 Kcal/h ≈ 1.163 Watt)
    // Watt'ı Kcal/h'ye çevirme faktörü (1 Watt ≈ 0.86 Kcal/h)
    const WATT_TO_KCAL_FACTOR = 0.859845; // Daha hassas: 1 / 1.163

    radiatorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        hideError();
        resultArea.style.display = 'none';

        // Form verilerini al
        const roomWidth = parseFloat(document.getElementById('roomWidth').value);
        const roomLength = parseFloat(document.getElementById('roomLength').value);
        const roomHeight = parseFloat(document.getElementById('roomHeight').value);

        const insulationSelect = document.getElementById('insulationType');
        const insulationFactor = parseFloat(insulationSelect.options[insulationSelect.selectedIndex].dataset.factor);

        const regionFactorWattPerM3 = parseFloat(document.getElementById('regionFactor').value);
        const radiatorOutputWattPerMtool = parseFloat(document.getElementById('radiatorOutput').value);

        // Giriş doğrulaması
        let isValid = true;
        let errorMessage = "Lütfen tüm alanları geçerli değerlerle doldurun.";

        if (isNaN(roomWidth) || roomWidth <= 0) isValid = false;
        if (isNaN(roomLength) || roomLength <= 0) isValid = false;
        if (isNaN(roomHeight) || roomHeight <= 0) isValid = false;
        if (isNaN(insulationFactor) || insulationFactor <= 0) isValid = false; // data-factor kontrolü
        if (isNaN(regionFactorWattPerM3) || regionFactorWattPerM3 <= 0) isValid = false;
        if (isNaN(radiatorOutputWattPerMtool) || radiatorOutputWattPerMtool <= 0) isValid = false;

        if (!isValid) {
            showError(errorMessage);
            return;
        }

        // 1. Oda Hacmi Hesaplanması
        const roomVolumeM3 = roomWidth * roomLength * roomHeight;

        // 2. Temel Isı İhtiyacı (Watt cinsinden)
        let baseHeatLossWatt = roomVolumeM3 * regionFactorWattPerM3;

        // 3. Yalıtım Faktörünün Uygulanması
        let totalHeatLossWatt = baseHeatLossWatt * insulationFactor;

        // 4. Isı İhtiyacını Kcal/h'ye çevirme
        const totalHeatLossKcal = totalHeatLossWatt * WATT_TO_KCAL_FACTOR;

        // 5. Gerekli Radyatör Metretülü
        const requiredRadiatorLengthM = totalHeatLossWatt / radiatorOutputWattPerMtool;

        // Sonuçları Ekrana Yazdır
        resultRoomVolumeSpan.textContent = roomVolumeM3.toFixed(2);
        resultHeatLossWattSpan.textContent = totalHeatLossWatt.toFixed(0);
        resultHeatLossKcalSpan.textContent = totalHeatLossKcal.toFixed(0);
        resultRadiatorLengthSpan.textContent = requiredRadiatorLengthM.toFixed(2);

        resultArea.style.display = 'block';
        // Sonuçlar gösterildiğinde sayfayı sonuçların olduğu bölüme kaydır
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    radiatorForm.addEventListener('reset', function() {
        hideError();
        resultArea.style.display = 'none';
        document.getElementById('roomWidth').focus();
    });

    function showError(message) {
        errorMessageBox.textContent = message;
        errorMessageBox.style.display = 'block';
        // Hata mesajına kaydır
        errorMessageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }

    function hideError() {
        errorMessageBox.style.display = 'none';
        errorMessageBox.textContent = '';
    }
});