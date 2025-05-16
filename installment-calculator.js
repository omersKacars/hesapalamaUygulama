// installment-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const installmentForm = document.getElementById('installmentForm');
    const cashPriceInput = document.getElementById('cashPrice');
    const downPaymentInput = document.getElementById('downPayment');
    const numberOfInstallmentsInput = document.getElementById('numberOfInstallments');
    const monthlyPaymentInput = document.getElementById('monthlyPayment');
    const resultArea = document.getElementById('resultArea');
    const errorMessageBox = document.getElementById('error-message-box');
    const currentYearSpan = document.getElementById('current-year');

    // Sonuç span'leri
    const resultCashPriceSpan = document.getElementById('resultCashPrice');
    const resultDownPaymentSpan = document.getElementById('resultDownPayment');
    const resultRemainingAmountSpan = document.getElementById('resultRemainingAmount');
    const resultMonthlyPaymentSpan = document.getElementById('resultMonthlyPayment');
    const resultNumberOfInstallmentsSpan = document.getElementById('resultNumberOfInstallments');
    const resultTotalInstallmentPaymentSpan = document.getElementById('resultTotalInstallmentPayment');
    const resultTotalCostSpan = document.getElementById('resultTotalCost');
    const resultTotalDifferenceSpan = document.getElementById('resultTotalDifference');
    const summaryTextSpan = document.getElementById('summaryText');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    function formatCurrency(value) {
        if (isNaN(value) || value === null) return "0,00";
        return value.toFixed(2).replace('.', ',');
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

    installmentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        hideError();
        resultArea.style.display = 'none'; // Önceki sonuçları gizle

        // Girişleri al ve doğrula
        const cashPrice = parseFloat(cashPriceInput.value);
        const downPayment = parseFloat(downPaymentInput.value) || 0; // Boşsa 0
        const numberOfInstallments = parseInt(numberOfInstallmentsInput.value, 10);
        const monthlyPayment = parseFloat(monthlyPaymentInput.value);

        if (isNaN(cashPrice) || cashPrice <= 0) {
            showError("Lütfen geçerli bir peşin fiyat girin.");
            return;
        }
        if (isNaN(downPayment) || downPayment < 0) {
            showError("Peşinat tutarı 0 veya daha büyük olmalıdır.");
            return;
        }
        if (downPayment > cashPrice) {
            showError("Peşinat tutarı, ürünün peşin fiyatından büyük olamaz.");
            return;
        }
        if (isNaN(numberOfInstallments) || numberOfInstallments <= 0) {
            showError("Lütfen geçerli bir taksit sayısı girin (en az 1).");
            return;
        }
        if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
            showError("Lütfen geçerli bir aylık taksit tutarı girin.");
            return;
        }

        // Hesaplamalar
        const remainingAmountAfterDownPayment = cashPrice - downPayment;
        const totalInstallmentPayment = monthlyPayment * numberOfInstallments;
        const totalCost = downPayment + totalInstallmentPayment;
        const totalDifference = totalCost - cashPrice;

        // Sonuçları Ekrana Yazdır
        resultCashPriceSpan.textContent = formatCurrency(cashPrice);
        resultDownPaymentSpan.textContent = formatCurrency(downPayment);
        resultRemainingAmountSpan.textContent = formatCurrency(remainingAmountAfterDownPayment);

        resultMonthlyPaymentSpan.textContent = formatCurrency(monthlyPayment);
        resultNumberOfInstallmentsSpan.textContent = numberOfInstallments;
        resultTotalInstallmentPaymentSpan.textContent = formatCurrency(totalInstallmentPayment);

        resultTotalCostSpan.textContent = formatCurrency(totalCost);
        resultTotalDifferenceSpan.textContent = formatCurrency(totalDifference);

        // Özet metni
        let summary = `Bu alışveriş için toplam <strong>${formatCurrency(totalCost)} ₺</strong> ödeme yapacaksınız. `;
        if (totalDifference > 0) {
            summary += `Bu, ürünün peşin fiyatına göre <strong>${formatCurrency(totalDifference)} ₺</strong> daha fazla demektir.`;
        } else if (totalDifference < 0) {
            summary += `Bu, ürünün peşin fiyatından <strong>${formatCurrency(Math.abs(totalDifference))} ₺</strong> daha az demektir (bir indirim durumu).`;
        } else {
            summary += `Ürünün peşin fiyatı ile taksitli maliyeti arasında bir fark bulunmamaktadır.`;
        }
        summaryTextSpan.innerHTML = summary;


        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    installmentForm.addEventListener('reset', function() {
        hideError();
        resultArea.style.display = 'none';
        // Inputları temizle
        cashPriceInput.value = '';
        downPaymentInput.value = '0'; // Varsayılan peşinat
        numberOfInstallmentsInput.value = '';
        monthlyPaymentInput.value = '';
        cashPriceInput.focus();
    });
});
