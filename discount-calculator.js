// discount-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const discountForm = document.getElementById('discountForm');
    const originalPriceInput = document.getElementById('originalPrice');
    const discountRate1Input = document.getElementById('discountRate1');
    const discountRate2Input = document.getElementById('discountRate2');
    const resultArea = document.getElementById('resultArea');
    const errorMessageBox = document.getElementById('error-message-box');
    const currentYearSpan = document.getElementById('current-year');

    // Sonuç span'leri
    const resultOriginalPriceSpan = document.getElementById('resultOriginalPrice');
    const firstDiscountInfoDiv = document.getElementById('firstDiscountInfo');
    const appliedDiscountRate1Span = document.getElementById('appliedDiscountRate1');
    const resultDiscountAmount1Span = document.getElementById('resultDiscountAmount1');
    const priceAfterFirstDiscountInfoDiv = document.getElementById('priceAfterFirstDiscountInfo');
    const resultPriceAfterDiscount1Span = document.getElementById('resultPriceAfterDiscount1');
    const secondDiscountInfoDiv = document.getElementById('secondDiscountInfo');
    const appliedDiscountRate2Span = document.getElementById('appliedDiscountRate2');
    const resultDiscountAmount2Span = document.getElementById('resultDiscountAmount2');
    const resultFinalPriceSpan = document.getElementById('resultFinalPrice');
    const resultTotalSavingsSpan = document.getElementById('resultTotalSavings');
    const resultTotalEffectiveDiscountDiv = document.getElementById('resultTotalEffectiveDiscount');
    const effectiveDiscountRateValueSpan = document.getElementById('effectiveDiscountRateValue');


    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    function formatCurrency(value) {
        if (isNaN(value) || value === null) return "0,00"; // Virgül ile
        return value.toFixed(2).replace('.', ',');
    }

    function formatPercentage(value) {
        if (isNaN(value) || value === null) return "0";
        return value.toFixed(2).replace('.', ','); // Yüzde için de virgül
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

    discountForm.addEventListener('submit', function(event) {
        event.preventDefault();
        hideError();
        resultArea.style.display = 'none'; // Önceki sonuçları gizle

        // Girişleri al ve doğrula
        const originalPrice = parseFloat(originalPriceInput.value);
        const discountRate1 = parseFloat(discountRate1Input.value) || 0; // Boşsa 0 kabul et
        let discountRate2 = parseFloat(discountRate2Input.value) || 0; // Boşsa 0 kabul et

        if (isNaN(originalPrice) || originalPrice < 0) {
            showError("Lütfen geçerli bir orijinal fiyat girin.");
            return;
        }
        if (discountRate1 < 0 || discountRate1 > 100) {
            showError("1. İndirim oranı 0 ile 100 arasında olmalıdır.");
            return;
        }
        if (discountRate2 < 0 || discountRate2 > 100) {
            showError("2. İndirim oranı 0 ile 100 arasında olmalıdır.");
            return;
        }

        // Hesaplamalar
        let priceAfterDiscount1 = originalPrice;
        let discountAmount1 = 0;

        if (discountRate1 > 0) {
            discountAmount1 = originalPrice * (discountRate1 / 100);
            priceAfterDiscount1 = originalPrice - discountAmount1;
            firstDiscountInfoDiv.style.display = 'flex'; // veya block
            appliedDiscountRate1Span.textContent = formatPercentage(discountRate1);
            resultDiscountAmount1Span.textContent = formatCurrency(discountAmount1);
            priceAfterFirstDiscountInfoDiv.style.display = 'flex';
            resultPriceAfterDiscount1Span.textContent = formatCurrency(priceAfterDiscount1);
        } else {
            firstDiscountInfoDiv.style.display = 'none';
            priceAfterFirstDiscountInfoDiv.style.display = 'none';
        }


        let finalPrice = priceAfterDiscount1;
        let discountAmount2 = 0;

        if (discountRate2 > 0 && discountRate1 > 0) { // 2. indirim, sadece 1. indirim sonrası fiyata uygulanır
            discountAmount2 = priceAfterDiscount1 * (discountRate2 / 100);
            finalPrice = priceAfterDiscount1 - discountAmount2;
            secondDiscountInfoDiv.style.display = 'flex';
            appliedDiscountRate2Span.textContent = formatPercentage(discountRate2);
            resultDiscountAmount2Span.textContent = formatCurrency(discountAmount2);
        } else if (discountRate2 > 0 && discountRate1 === 0) { // Sadece 2. indirim alanı doluysa, bunu ana indirim gibi kabul et
            discountAmount1 = originalPrice * (discountRate2 / 100); // discountAmount1'e ata
            finalPrice = originalPrice - discountAmount1;
            firstDiscountInfoDiv.style.display = 'flex';
            appliedDiscountRate1Span.textContent = formatPercentage(discountRate2); // Oranı 1. alana yaz
            resultDiscountAmount1Span.textContent = formatCurrency(discountAmount1);
            priceAfterFirstDiscountInfoDiv.style.display = 'none'; // 1. indirim sonrası fiyatı gösterme
            secondDiscountInfoDiv.style.display = 'none'; // 2. indirim bilgisini gösterme
            discountRate2 = 0; // Kafa karışıklığını önlemek için sıfırla
        }
        else {
            secondDiscountInfoDiv.style.display = 'none';
        }


        const totalSavings = originalPrice - finalPrice;

        // Sonuçları Ekrana Yazdır
        resultOriginalPriceSpan.textContent = formatCurrency(originalPrice);
        resultFinalPriceSpan.textContent = formatCurrency(finalPrice);
        resultTotalSavingsSpan.textContent = formatCurrency(totalSavings);

        // Toplam efektif indirim oranı (eğer iki indirim de varsa veya en az bir indirim varsa)
        if (totalSavings > 0 && originalPrice > 0) {
            const effectiveDiscountRate = (totalSavings / originalPrice) * 100;
            effectiveDiscountRateValueSpan.textContent = formatPercentage(effectiveDiscountRate);
            resultTotalEffectiveDiscountDiv.style.display = 'block';
        } else {
            resultTotalEffectiveDiscountDiv.style.display = 'none';
        }

        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    discountForm.addEventListener('reset', function() {
        hideError();
        resultArea.style.display = 'none';
        originalPriceInput.value = '';
        discountRate1Input.value = '';
        discountRate2Input.value = '';
        originalPriceInput.focus();
    });
});