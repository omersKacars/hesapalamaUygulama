// vat-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const vatForm = document.getElementById('vatForm');
    const calculationTypeRadios = document.querySelectorAll('input[name="calculationType"]');
    const amountInput = document.getElementById('amount');
    const amountLabel = document.getElementById('amountLabel');
    const vatRateCustomInput = document.getElementById('vatRateCustom');
    const vatRateButtons = document.querySelectorAll('.btn-vat-rate');
    const resultArea = document.getElementById('resultArea');
    const errorMessageBox = document.getElementById('error-message-box');
    const currentYearSpan = document.getElementById('current-year');

    // Sonuç span'leri
    const resultNetPriceSpan = document.getElementById('resultNetPrice');
    const labelNetPriceSpan = document.getElementById('labelNetPrice');
    const resultVatAmountSpan = document.getElementById('resultVatAmount');
    const resultGrossPriceSpan = document.getElementById('resultGrossPrice');
    const labelGrossPriceSpan = document.getElementById('labelGrossPrice');
    const resultSummaryTextSpan = document.getElementById('resultSummaryText');

    let currentVatRate = 20; // Varsayılan KDV oranı

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Yardımcı Fonksiyonlar ---
    function formatCurrency(value) {
        if (isNaN(value) || value === null) return "0.00";
        return value.toFixed(2).replace('.', ','); // Türkçe format
    }

    function showError(message) {
        errorMessageBox.textContent = message;
        errorMessageBox.style.display = 'block';
        resultArea.style.display = 'none';
        errorMessageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
        errorMessageBox.style.display = 'none';
        errorMessageBox.textContent = '';
    }

    function updateAmountLabel(calculationType) {
        if (calculationType === 'grossFromNet') {
            amountLabel.textContent = 'KDV Hariç Tutar (₺):';
        } else { // netFromGross
            amountLabel.textContent = 'KDV Dahil Tutar (₺):';
        }
    }

    function setActiveVatButton(selectedRate) {
        vatRateButtons.forEach(btn => {
            if (parseFloat(btn.dataset.rate) === selectedRate) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        // Eğer özel bir oran seçilmişse ve bu butonlardan biriyle eşleşmiyorsa,
        // hiçbir butonu aktif yapma (veya özel input'u vurgula)
        if (!vatRateButtons_array.some(btn => parseFloat(btn.dataset.rate) === selectedRate)) {
            vatRateButtons.forEach(btn => btn.classList.remove('active'));
        }
    }
    const vatRateButtons_array = Array.from(vatRateButtons); // forEach için


    // --- Olay Dinleyicileri ---
    calculationTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateAmountLabel(e.target.value);
            // Hesaplama türü değiştiğinde formu ve sonuçları sıfırla veya yeniden hesapla
            // Şimdilik sadece etiket değişsin, kullanıcı hesapla butonuna bassın.
            // resultArea.style.display = 'none'; // Opsiyonel: sonucu gizle
        });
    });
    // Başlangıçta etiketi ayarla
    updateAmountLabel(document.querySelector('input[name="calculationType"]:checked').value);


    vatRateButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentVatRate = parseFloat(button.dataset.rate);
            vatRateCustomInput.value = ''; // Özel oranı temizle
            setActiveVatButton(currentVatRate);
        });
    });

    vatRateCustomInput.addEventListener('input', () => {
        const customRate = parseFloat(vatRateCustomInput.value);
        if (!isNaN(customRate) && customRate >= 0) {
            currentVatRate = customRate;
            setActiveVatButton(currentVatRate); // Butonlardaki aktifliği kaldır/ayarla
        } else if (vatRateCustomInput.value.trim() === '') {
            // Özel alan boşaldı, varsayılan bir oranı (örn. en son aktif olanı) tekrar seçebiliriz.
            // Veya kullanıcıyı bir buton seçmeye yönlendirebiliriz.
            // Şimdilik, eğer özel oran boşsa ve bir buton aktifse o kalsın.
            const activeButton = document.querySelector('.btn-vat-rate.active');
            if (activeButton) {
                currentVatRate = parseFloat(activeButton.dataset.rate);
            } else {
                // Hiçbir buton aktif değilse ve özel alan boşsa, varsayılan 20%
                currentVatRate = 20;
                setActiveVatButton(20);
            }
        }
    });
    // Başlangıçta aktif KDV butonuna göre currentVatRate'i ayarla
    const initialActiveButton = document.querySelector('.btn-vat-rate.active');
    if (initialActiveButton) {
        currentVatRate = parseFloat(initialActiveButton.dataset.rate);
    }


    vatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        hideError();
        resultArea.style.display = 'none';

        const amount = parseFloat(amountInput.value);
        const calculationType = document.querySelector('input[name="calculationType"]:checked').value;

        if (isNaN(amount) || amount < 0) {
            showError("Lütfen geçerli bir tutar girin.");
            return;
        }
        if (isNaN(currentVatRate) || currentVatRate < 0) {
            showError("Lütfen geçerli bir KDV oranı seçin veya girin.");
            return;
        }

        let netPrice = 0;
        let vatAmount = 0;
        let grossPrice = 0;
        let summary = "";

        const vatMultiplier = currentVatRate / 100;

        if (calculationType === 'grossFromNet') {
            // KDV Hariçten -> KDV Dahil
            netPrice = amount;
            vatAmount = netPrice * vatMultiplier;
            grossPrice = netPrice + vatAmount;

            labelNetPriceSpan.textContent = "Girilen KDV Hariç Fiyat:";
            labelGrossPriceSpan.textContent = "Hesaplanan KDV Dahil Fiyat:";
            resultNetPriceSpan.parentElement.classList.remove('highlight-result');
            resultGrossPriceSpan.parentElement.classList.add('highlight-result');
            summary = `${formatCurrency(netPrice)} ₺ (Net) + ${formatCurrency(vatAmount)} ₺ (KDV) = <strong>${formatCurrency(grossPrice)} ₺ (Brüt)</strong>`;

        } else { // netFromGross
            // KDV Dahilden -> KDV Hariç
            grossPrice = amount;
            // KDV Tutarı = Brüt Fiyat * (KDV Oranı / (100 + KDV Oranı))
            // Net Fiyat = Brüt Fiyat / (1 + KDV Oranı/100)
            netPrice = grossPrice / (1 + vatMultiplier);
            vatAmount = grossPrice - netPrice; // Veya: grossPrice * (vatMultiplier / (1 + vatMultiplier));

            labelNetPriceSpan.textContent = "Hesaplanan KDV Hariç Fiyat:";
            labelGrossPriceSpan.textContent = "Girilen KDV Dahil Fiyat:";
            resultGrossPriceSpan.parentElement.classList.remove('highlight-result');
            resultNetPriceSpan.parentElement.classList.add('highlight-result');
            summary = `<strong>${formatCurrency(netPrice)} ₺ (Net)</strong> = ${formatCurrency(grossPrice)} ₺ (Brüt) - ${formatCurrency(vatAmount)} ₺ (KDV)`;
        }

        resultNetPriceSpan.textContent = formatCurrency(netPrice);
        resultVatAmountSpan.textContent = formatCurrency(vatAmount);
        resultGrossPriceSpan.textContent = formatCurrency(grossPrice);
        resultSummaryTextSpan.innerHTML = summary; // innerHTML çünkü <strong> kullandık

        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    vatForm.addEventListener('reset', function() {
        hideError();
        resultArea.style.display = 'none';
        amountInput.value = '';
        vatRateCustomInput.value = '';
        currentVatRate = 20; // Varsayılan KDV
        setActiveVatButton(20);
        // Hesaplama türünü varsayılana döndür
        document.querySelector('input[name="calculationType"][value="grossFromNet"]').checked = true;
        updateAmountLabel('grossFromNet');
        amountInput.focus();
    });
});