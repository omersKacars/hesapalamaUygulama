// currency-converter.js
document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const swapButton = document.getElementById('swap-currencies');
    const conversionRateInfoP = document.getElementById('conversion-rate-info');
    const conversionResultP = document.getElementById('conversion-result');
    const lastUpdatedInfoP = document.getElementById('last-updated-info');
    const errorMessageContainer = document.getElementById('error-message-box');
    const resultAreaDiv = document.getElementById('result-area');
    const currentYearSpan = document.getElementById('current-year');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const API_BASE_URL = 'https://api.frankfurter.app';
    let currencies = {}; // Örn: { "USD": "US Dollar", "EUR": "Euro" }
    let ratesCache = {}; // Örn: { "USD-EUR_2023-10-27": 0.95 }

    // --- Yardımcı Fonksiyonlar ---
    function showLoadingState(isLoading) {
        if (isLoading) {
            conversionRateInfoP.textContent = 'Kur bilgisi hesaplanıyor...';
            conversionResultP.innerHTML = '<strong>Sonuç:</strong> Hesaplanıyor...';
            lastUpdatedInfoP.textContent = '';
            resultAreaDiv.classList.add('loading');
            // Butonları ve inputları geçici olarak devre dışı bırakabiliriz
            amountInput.disabled = true;
            fromCurrencySelect.disabled = true;
            toCurrencySelect.disabled = true;
            swapButton.disabled = true;
        } else {
            resultAreaDiv.classList.remove('loading');
            amountInput.disabled = false;
            fromCurrencySelect.disabled = false;
            toCurrencySelect.disabled = false;
            swapButton.disabled = false;
        }
    }

    function displayErrorMessage(message, isCritical = false) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
        resultAreaDiv.style.display = isCritical ? 'none' : 'block'; // Kritik hatada sonuç alanını gizle
        if (isCritical) {
            // Diğer elemanları da devre dışı bırak
            amountInput.disabled = true;
            fromCurrencySelect.disabled = true;
            toCurrencySelect.disabled = true;
            swapButton.disabled = true;
        }
    }

    function hideErrorMessage() {
        errorMessageContainer.style.display = 'none';
        if (resultAreaDiv.style.display === 'none') { // Eğer gizlendiyse göster
            resultAreaDiv.style.display = 'block';
        }
    }

    function populateSelectWithOptions(selectElement, optionsObject, defaultValue) {
        selectElement.innerHTML = ''; // Önceki seçenekleri temizle
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "";
        placeholderOption.textContent = "Seçiniz...";
        placeholderOption.disabled = true; // Seçilemez ama ilk görünen olur
        // selectElement.appendChild(placeholderOption); // İsteğe bağlı

        const sortedCurrencyCodes = Object.keys(optionsObject).sort();

        for (const code of sortedCurrencyCodes) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${code} - ${optionsObject[code]}`;
            selectElement.appendChild(option);
        }

        if (optionsObject[defaultValue]) {
            selectElement.value = defaultValue;
        } else if (sortedCurrencyCodes.length > 0 && !defaultValue) {
             // Varsayılan yoksa ve liste boş değilse ilkini seçebiliriz ya da placeholder'ı aktif edebiliriz
            // selectElement.value = sortedCurrencyCodes[0];
            // Ya da placeholder'ın seçili kalmasını sağlamak için
            if (placeholderOption.parentElement) placeholderOption.selected = true;
        }
    }

    async function fetchAvailableCurrencies() {
        try {
            const response = await fetch(`${API_BASE_URL}/currencies`);
            if (!response.ok) {
                throw new Error(`Para birimi listesi alınamadı: ${response.status} ${response.statusText}`);
            }
            currencies = await response.json();
            populateSelectWithOptions(fromCurrencySelect, currencies, 'USD');
            populateSelectWithOptions(toCurrencySelect, currencies, 'TRY');
            // Para birimleri yüklendikten sonra ilk çeviriyi yapalım
            await performConversion();
        } catch (error) {
            console.error('Para birimleri yüklenirken hata:', error);
            displayErrorMessage('Para birimleri yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.', true);
            // Yedek, statik liste (API çalışmazsa diye)
            currencies = { USD: "ABD Doları", EUR: "Euro", TRY: "Türk Lirası", GBP: "İngiliz Sterlini", JPY: "Japon Yeni" };
            populateSelectWithOptions(fromCurrencySelect, currencies, 'USD');
            populateSelectWithOptions(toCurrencySelect, currencies, 'TRY');
        }
    }

    async function getConversionRate(from, to, date = 'latest') {
        if (from === to) return { rate: 1, date: new Date().toISOString().split('T')[0] };

        const cacheKey = `${from}-${to}_${date}`;
        if (ratesCache[cacheKey]) {
            console.log("Önbellekten kullanıldı:", cacheKey);
            return ratesCache[cacheKey];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${date}?from=${from}&to=${to}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Bilinmeyen API hatası" }));
                throw new Error(`Kur alınamadı (${from} -> ${to}): ${errorData.message || response.status}`);
            }
            const data = await response.json();

            if (!data.rates || typeof data.rates[to] === 'undefined') {
                throw new Error('API yanıtında beklenen kur bulunamadı.');
            }

            const rateData = { rate: data.rates[to], date: data.date };
            ratesCache[cacheKey] = rateData; // Önbelleğe al
            return rateData;
        } catch (error) {
            console.error(error.message);
            // Hata mesajını doğrudan getConversionRate'den göstermek yerine,
            // çağıran fonksiyona null döndürerek orada yönetilmesini sağlayalım.
            throw error; // Hata'yı yukarı fırlat
        }
    }

    let conversionTimeout;
    async function performConversion() {
        clearTimeout(conversionTimeout); // Önceki zamanlayıcıyı temizle (debounce için)

        conversionTimeout = setTimeout(async () => {
            hideErrorMessage();
            const amountValue = parseFloat(amountInput.value);
            const fromCurrency = fromCurrencySelect.value;
            const toCurrency = toCurrencySelect.value;

            if (!fromCurrency || !toCurrency) {
                conversionRateInfoP.textContent = 'Lütfen kaynak ve hedef para birimlerini seçin.';
                conversionResultP.innerHTML = '<strong>Sonuç:</strong> -';
                return;
            }
            if (isNaN(amountValue)) {
                conversionRateInfoP.textContent = 'Lütfen geçerli bir miktar girin.';
                conversionResultP.innerHTML = '<strong>Sonuç:</strong> -';
                return;
            }
            if (amountValue <= 0) {
                conversionRateInfoP.textContent = 'Miktar 0\'dan büyük olmalıdır.';
                conversionResultP.innerHTML = '<strong>Sonuç:</strong> -';
                return;
            }

            showLoadingState(true);

            try {
                const rateData = await getConversionRate(fromCurrency, toCurrency);
                const convertedAmount = amountValue * rateData.rate;

                conversionRateInfoP.textContent = `1 ${fromCurrency} = ${rateData.rate.toFixed(5)} ${toCurrency}`; // Daha fazla hassasiyet
                conversionResultP.innerHTML = `<strong>Sonuç:</strong> ${convertedAmount.toFixed(2)} ${toCurrency}`;
                lastUpdatedInfoP.textContent = `Oranlar en son ${new Date(rateData.date).toLocaleDateString('tr-TR')} tarihinde güncellendi.`;

            } catch (error) {
                displayErrorMessage(`(${fromCurrency} -> ${toCurrency}) kuru alınamadı. Lütfen farklı bir birim deneyin veya daha sonra tekrar deneyin.`);
                conversionRateInfoP.textContent = 'Kur bilgisi alınamadı.';
                conversionResultP.innerHTML = '<strong>Sonuç:</strong> -';
                lastUpdatedInfoP.textContent = '';
            } finally {
                showLoadingState(false);
            }
        }, 300); // 300ms debounce süresi
    }

    function handleSwapCurrencies() {
        const tempFrom = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempFrom;

        performConversion();
    }

    // --- Event Listeners ---
    amountInput.addEventListener('input', performConversion);
    fromCurrencySelect.addEventListener('change', performConversion);
    toCurrencySelect.addEventListener('change', performConversion);
    swapButton.addEventListener('click', handleSwapCurrencies);

    // --- Sayfa Yüklendiğinde Başlat ---
    async function initializeApp() {
        showLoadingState(true);
        await fetchAvailableCurrencies(); // Bu fonksiyon içinde ilk çeviri de tetikleniyor
        // fetchAvailableCurrencies hata alsa bile showLoadingState(false) çağrılmalı.
        // Ancak fetchAvailableCurrencies içindeki catch bloğu bunu zaten dolaylı yoldan yapıyor
        // veya performConversion içindeki finally bloğu son yükleme durumunu kaldırıyor.
        // İlk yüklemede showLoadingState(false) burada da çağrılabilir.
        if (resultAreaDiv.classList.contains('loading')) { // Hala yükleme varsa
             showLoadingState(false);
        }
    }

    initializeApp();
});