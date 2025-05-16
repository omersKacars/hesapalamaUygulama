// calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');
    const modeSelector = document.getElementById('calc-mode');
    const calculatorContainer = document.querySelector('.calculator-container');
    const scientificButtons = document.querySelectorAll('.btn-scientific');
    const allButtons = document.querySelectorAll('.calculator-buttons button');
    const angleToggleButton = document.querySelector('button[data-operation="toggle-angle"]');
    const invToggleButton = document.querySelector('button[data-operation="inv"]');
    const currentYearSpan = document.getElementById('current-year');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    let currentInput = '0';
    let previousInput = '';
    let operation = undefined;
    let resultDisplayed = false;
    let memory = 0;
    let angleUnit = 'DEG'; // DEG veya RAD
    let inverseFunctions = false; // INV modu aktif mi?
    let expression = ''; // İfadeyi tutmak için

    // --- MOD YÖNETİMİ ---
    function setCalculatorMode(mode) {
        if (mode === 'scientific') {
            calculatorContainer.classList.add('scientific-mode');
            calculatorContainer.classList.remove('standard-mode');
            scientificButtons.forEach(btn => btn.style.display = 'flex'); // veya 'grid-item'
        } else { // standard
            calculatorContainer.classList.add('standard-mode');
            calculatorContainer.classList.remove('scientific-mode');
            scientificButtons.forEach(btn => btn.style.display = 'none');
        }
        // Mod değiştiğinde hesap makinesini sıfırla
        allClear();
    }

    modeSelector.addEventListener('change', (e) => {
        setCalculatorMode(e.target.value);
    });
    // Başlangıç modu
    setCalculatorMode(modeSelector.value);


    // --- EKRAN GÜNCELLEME ---
    function updateDisplay() {
        currentOperandTextElement.innerText = formatDisplayNumber(currentInput);
        if (operation != null || expression.length > 0) {
            // Eğer bir işlem veya ifade varsa, previousInput'u veya ifadeyi göster
            let displayExpression = expression;
            // Operatörleri daha okunabilir hale getir
            displayExpression = displayExpression.replace(/\*/g, '×').replace(/\//g, '÷');
            previousOperandTextElement.innerText = displayExpression;

        } else {
            previousOperandTextElement.innerText = previousInput; // Sadece önceki sayıyı veya boş göster
        }
        adjustFontSize();
    }

    function formatDisplayNumber(numberStr) {
        if (numberStr === '' || numberStr === null || numberStr === undefined) return '';
        if (numberStr === 'Error') return 'Hata';
        if (numberStr.toLowerCase() === 'infinity') return 'Sonsuz';
        if (numberStr.toLowerCase() === 'nan') return 'Tanımsız';


        // Çok uzun sayıları bilimsel notasyona çevirme (opsiyonel)
        // const number = parseFloat(numberStr);
        // if (Math.abs(number) > 1e12 || (Math.abs(number) < 1e-6 && number !== 0)) {
        //     return number.toExponential(5);
        // }

        // Virgül ayıracı ekleme (Türkiye formatı)
        // const parts = numberStr.toString().split('.');
        // parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Binlik ayıracı
        // return parts.join(','); // Ondalık ayıracı

        // Şimdilik basit tutalım, sadece olduğu gibi gösterelim
        return numberStr.toString();
    }

    function adjustFontSize() {
        const maxLength = calculatorContainer.classList.contains('scientific-mode') ? 20 : 12; // Mod'a göre maksimum karakter
        const defaultSize = calculatorContainer.classList.contains('scientific-mode') ? '1.8rem' : '2.2rem';
        const smallSize = calculatorContainer.classList.contains('scientific-mode') ? '1.2rem' : '1.5rem';

        if (currentOperandTextElement.innerText.length > maxLength) {
            currentOperandTextElement.style.fontSize = smallSize;
        } else {
            currentOperandTextElement.style.fontSize = defaultSize;
        }
    }

    // --- TEMEL İŞLEMLER ---
    function appendNumber(number) {
        if (number === '.' && currentInput.includes('.')) return;
        if (resultDisplayed && operation === undefined) { // Sonuç gösterildiyse ve yeni bir işlem başlamadıysa, yeni sayı için sıfırla
            currentInput = '';
            resultDisplayed = false;
        }
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            if(currentInput.length >= 20) return; // Maksimum giriş uzunluğu
            currentInput = currentInput.toString() + number.toString();
        }
        expression += number.toString(); // İfadeye sayıyı ekle
        updateDisplay();
    }

    function chooseOperation(op) {
        if (currentInput === '' && expression === '') return; // Hiçbir şey girilmemişse
        if (currentInput === '' && !isOperator(expression.slice(-1)) && expression.slice(-1) !== '(') {
             // Eğer son girilen bir operatör değilse ve mevcut giriş boşsa (örn: 5 * sonra -)
        } else if (currentInput !== '') {
            // currentInput'u ifadeye ekle
        }

        // Operatörleri değiştirme (örn: + sonra - basılırsa sonuncusu geçerli olur)
        if (isOperator(expression.slice(-1))) {
            expression = expression.slice(0, -1);
        }

        expression += op;
        currentInput = ''; // Yeni sayı girişi için currentInput'u sıfırla
        operation = op; // Bu değişkeni RPN veya doğrudan değerlendirme için kullanacağız
        resultDisplayed = false;
        updateDisplay();
    }

    function isOperator(char) {
        return ['+', '-', '*', '/'].includes(char);
    }


    function calculate() {
        if (expression === '') return;
        // Parantezlerin kapalı olduğundan emin ol
        let openP = (expression.match(/\(/g) || []).length;
        let closeP = (expression.match(/\)/g) || []).length;
        while(openP > closeP) {
            expression += ')'; // Otomatik kapat
            closeP++;
        }

        try {
            // BURASI EN KRİTİK KISIM: GÜVENLİ İFADE DEĞERLENDİRME
            // Şimdilik, basit bir `eval` alternatifi deneyelim, ancak bu GÜVENLİ DEĞİLDİR.
            // Daha sonra Shunting-Yard ve RPN ile değiştirilecek.
            // let result = new Function('return ' + sanitizeExpression(expression))();

            // Güvenli Değerlendirme Fonksiyonu (YER TUTUCU - GERÇEK UYGULAMA GEREKİR)
            let result = evaluateSafe(expression);

            if (isNaN(result) || !isFinite(result)) {
                if (result === Infinity || result === -Infinity) {
                    currentInput = 'Infinity';
                } else {
                    throw new Error("Geçersiz işlem");
                }
            } else {
                // Sonucu belirli bir ondalık basamağa yuvarla
                result = parseFloat(result.toFixed(10));
                currentInput = result.toString();
            }

            previousInput = expression + ' ='; // Ya da sadece ifadeyi bırak
            expression = currentInput; // Bir sonraki işlem için sonucu ifadeye ata
            operation = undefined;
            resultDisplayed = true;
        } catch (e) {
            console.error("Hesaplama Hatası:", e);
            currentInput = 'Error';
            expression = ''; // Hata durumunda ifadeyi temizle
        }
        updateDisplay();
    }

    // YER TUTUCU - GÜVENLİ DEĞİL, GELİŞTİRİLECEK
    function sanitizeExpression(expr) {
        // Temel sanitizasyon, ancak tam güvenliği sağlamaz
        // Sadece sayılar, operatörler, parantezler, nokta, e, pi, ve bilinen fonksiyonlara izin ver
        // Örneğin:
        // expr = expr.replace(/π/g, 'Math.PI');
        // expr = expr.replace(/e(?![a-zA-Z])/g, 'Math.E'); // 'exp' ile karışmasın diye
        // expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)'); // √(...) formatı
        // expr = expr.replace(/(\d+)!/g, (match, n) => factorial(parseInt(n)).toString());
        // Bilimsel fonksiyonları Math objesine yönlendir (sin, cos, tan, log, ln vb.)

        // Bu çok basit ve eksik bir yöntemdir. Shunting-yard + RPN daha iyi.
        return expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/--/g, '+') // Çift eksi
            .replace(/\+-/g, '-');
    }

    // YER TUTUCU - GÜVENLİ DEĞİL, GELİŞTİRİLECEK (Shunting-Yard + RPN ile değiştirilecek)
    function evaluateSafe(expressionString) {
        console.log("Değerlendirilecek İfade (güvensiz):", expressionString);
        // Bu fonksiyon, Math objesinin güvenli bir alt kümesini kullanarak ifadeyi değerlendirmeli
        // VEYA kendi ayrıştırıcı ve değerlendiricimizi yazmalıyız.
        // Şimdilik, test için basitleştirilmiş ve GÜVENLİ OLMAYAN bir yöntem:
        try {
            // Math fonksiyonlarını kullanılabilir hale getirelim (scope içinde)
            const sin = (x) => Math.sin(angleUnit === 'DEG' ? x * Math.PI / 180 : x);
            const cos = (x) => Math.cos(angleUnit === 'DEG' ? x * Math.PI / 180 : x);
            const tan = (x) => Math.tan(angleUnit === 'DEG' ? x * Math.PI / 180 : x);
            const asin = (x) => (angleUnit === 'DEG' ? Math.asin(x) * 180 / Math.PI : Math.asin(x));
            const acos = (x) => (angleUnit === 'DEG' ? Math.acos(x) * 180 / Math.PI : Math.acos(x));
            const atan = (x) => (angleUnit === 'DEG' ? Math.atan(x) * 180 / Math.PI : Math.atan(x));

            const log = (x) => Math.log10(x);
            const ln = (x) => Math.log(x);
            const sqrt = (x) => Math.sqrt(x);
            const PI = Math.PI;
            const E = Math.E;
            const pow = (base, exp) => Math.pow(base, exp); // x^y
            const exp = (x) => Math.exp(x); // e^x

            // Faktöriyel
            const fact = (num) => {
                if (num < 0) return NaN;
                if (num === 0) return 1;
                let result = 1;
                for (let i = 2; i <= num; i++) result *= i;
                return result;
            };

            // İfadeyi Math fonksiyonlarına uygun hale getir
            let safeExpr = expressionString
                .replace(/π/g, 'PI')
                .replace(/e(?![a-zA-Z])/g, 'E') // 'exp' ile karışmasın diye
                .replace(/(\d+)!/g, (match, n) => `fact(${n})`) // 5! -> fact(5)
                .replace(/√\(([^)]+)\)/g, 'sqrt($1)') // √(...) -> sqrt(...)
                .replace(/log\(([^)]+)\)/g, 'log($1)')
                .replace(/ln\(([^)]+)\)/g, 'ln($1)')
                .replace(/sin\(([^)]+)\)/g, 'sin($1)')
                .replace(/cos\(([^)]+)\)/g, 'cos($1)')
                .replace(/tan\(([^)]+)\)/g, 'tan($1)')
                .replace(/asin\(([^)]+)\)/g, 'asin($1)')
                .replace(/acos\(([^)]+)\)/g, 'acos($1)')
                .replace(/atan\(([^)]+)\)/g, 'atan($1)')
                .replace(/(\w+)\^(\w+|\([^)]+\))/g, 'pow($1, $2)') // x^y veya x^(y+z)
                .replace(/exp\(([^)]+)\)/g, 'exp($1)') // e^(...) -> exp(...)
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/--/g, '+')
                .replace(/\+-/g, '-');

            // En son güvenlik katmanı olarak, sadece izin verilen karakterler ve fonksiyon adları
            const allowedPattern = /^[0-9\.\+\-\*\/\(\)\sPIEfactsqrtloglnsincostanpowexpasinacosatan,]+$/;
            if (!allowedPattern.test(safeExpr)) {
                console.error("İfade geçersiz karakterler içeriyor:", safeExpr);
                throw new Error("Geçersiz ifade");
            }
            console.log("Değerlendirilecek Güvenli İfade:", safeExpr);
            return new Function('sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'PI', 'E', 'fact', 'pow', 'exp', 'return ' + safeExpr)(sin, cos, tan, asin, acos, atan, log, ln, sqrt, PI, E, fact, pow, exp);

        } catch (e) {
            console.error("EvaluateSafe Hatası:", e, "İfade:", expressionString);
            throw e; // Hata'yı yukarı fırlat
        }
    }


    function allClear() {
        currentInput = '0';
        previousInput = '';
        expression = '';
        operation = undefined;
        resultDisplayed = false;
        updateDisplay();
    }

    function clearEntry() {
        if (resultDisplayed) { // Sonuç gösteriliyorsa AC gibi davran
            allClear();
            return;
        }
        // Eğer currentInput boşsa ve expression'da bir şeyler varsa, son token'ı silmeyi dene
        if (currentInput === '' && expression.length > 0) {
            // Bu kısım daha karmaşık bir ifade token silme gerektirir.
            // Şimdilik, sadece currentInput'u etkilesin.
            // İfadeyi yeniden oluşturmak veya son elemanı güvenli silmek zor.
        }
        currentInput = '0'; // Sadece mevcut girişi sıfırla
        // Expression'dan son sayıyı silmek daha mantıklı olabilir.
        // Örneğin, '2+345' CE -> '2+' olmalı, currentInput '0'
        // Bu, ifade yönetimini daha karmaşık hale getirir.
        // Şimdilik CE sadece currentInput'u '0' yapsın.
        // Eğer expression varsa ve currentInput boşsa, son operatörü sil gibi bir mantık eklenebilir.
        updateDisplay();
    }

    function deleteLast() {
        if (resultDisplayed) {
            // Sonuç gösteriliyorsa, ifadeyi sonuçla değiştir ve son karakterini sil
            expression = currentInput.toString();
            resultDisplayed = false; // Artık sonuç değil, düzenlenebilir ifade
        }

        if (expression.length > 0) {
            expression = expression.slice(0, -1);
            // Silme sonrası expression'ın son durumuna göre currentInput'u ayarla
            // Eğer ifade boşaldıysa veya sonu operatörse, currentInput '0'
            // Eğer sonu sayı ise, currentInput o sayı olmalı. Bu karmaşık.
            // Şimdilik, expression değiştiğinde currentInput'u yeniden senkronize etmeye çalışmayalım,
            // Kullanıcı yeni bir sayı girdiğinde currentInput güncellenecek.
        }
        // CurrentInput'u da ayrıca yönetebiliriz ama expression ile senkron tutmak zor.
        // En basit yaklaşım, silme işleminin doğrudan expression'ı etkilemesi.
        // Ve currentInput'un sadece ekranda gösterilen "aktif giriş" olması.
        if (currentInput.length > 1 && currentInput !== '0' && currentInput !== 'Error' && currentInput !== 'Infinity') {
            currentInput = currentInput.slice(0, -1);
        } else if (currentInput.length === 1 && currentInput !== '0') {
            currentInput = '0';
        }

        // Eğer expression tamamen silinmişse, her şeyi sıfırla
        if (expression === '') {
            allClear();
        } else {
             // Silme işleminden sonra, expression'ın sonuna göre operation'ı güncelle
            const lastChar = expression.slice(-1);
            if (isOperator(lastChar)) {
                operation = lastChar;
            } else {
                operation = undefined;
            }
        }
        updateDisplay();
    }


    function handlePercentage() {
        if (currentInput === '' || currentInput === 'Error') return;
        // Yüzdeyi nasıl hesaplayacağımız bağlama göre değişir:
        // 1. Sadece bir sayı varsa: X % -> X / 100
        // 2. Bir işlem varsa: A + B % -> A + (A * B / 100)
        //                       A - B % -> A - (A * B / 100)
        //                       A * B % -> A * (B / 100)
        //                       A / B % -> A / (B / 100)

        // Şimdilik en basit senaryo: mevcut sayının %'si
        // Daha karmaşık ifade içinde yüzde için parser'ın bunu anlaması gerekir.
        // Örneğin "100+10%" ifadesinde, %'nin 10'a mı yoksa (100 * 10/100)'e mi uygulanacağı.
        // Genellikle hesap makineleri `A op B%` yi `A op (A*B/100)` olarak alır.
        // `B%` tek başına ise `B/100`
        try {
            // Expression üzerinden parse etmek daha doğru olur.
            // Şimdilik, currentInput üzerinden gidelim ve expression'ı buna göre güncelleyelim.
            const currentValue = parseFloat(currentInput);
            if (isNaN(currentValue)) return;

            // Eğer ifade "sayı operatör sayı" formundaysa (örn: 100+50), B% = (A*B/100)
            // Bu, ifadeyi ayrıştırmayı gerektirir.
            // Basit implementasyon: Sadece currentInput'u (sayıyı) /100 yap.
            // Bu, 50% -> 0.5 yapar.
            // Ancak 100 + 50% -> 100 + 50 olmalı. Bu, B'nin (A*B/100) ile değiştirilmesini gerektirir.

            // Geçici basit çözüm:
            const percentValue = currentValue / 100;
            // Expression'daki son sayıyı bu yüzde değeriyle değiştirmek gerekir.
            // Bu, currentInput'un expression'daki son sayısal token olması durumunda geçerli.
            // Örn: expression = "100+50", currentInput = "50"
            // % basılınca expression "100+0.5" olmalı (eğer 50'nin yüzdesi isteniyorsa)
            // VEYA "100+50" (100'ün %50'si) -> expression = "100+ (100*50/100)"

            // Şimdilik, yüzdeyi doğrudan bir işleme sokmuyoruz, sadece sayıyı değiştiriyoruz.
            // Kullanıcı "100 * 0.1 =" gibi bir şey yapmalı.
            // Veya ifade parser'ımız "%" operatörünü özel olarak ele almalı.
            // Bu özellik "profesyonel" seviye için önemlidir.
            // Bu kısım `evaluateSafe` içinde daha iyi ele alınmalı.
            // Örneğin: 100+10% -> 100 + (100*0.10) = 110
            //          100-10% -> 100 - (100*0.10) = 90
            //          100*10% -> 100 * 0.10 = 10
            //          100/10% -> 100 / 0.10 = 1000

            // `evaluateSafe` içinde "%" operatörünü işlememiz gerekecek.
            // Şimdilik buton, ifadeye "%" eklesin. Parser bunu anlasın.
            if (currentInput !== '' && currentInput !== '0') {
                 expression += '%';
                 currentInput = ''; // Yüzde sonrası yeni giriş beklenir veya eşittir.
                 updateDisplay();
            }

        } catch (e) {
            currentInput = 'Error';
            updateDisplay();
        }
    }

    function negateNumber() {
        if (currentInput === 'Error' || currentInput === 'Infinity') return;
        if (currentInput !== '' && currentInput !== '0') {
            if (currentInput.startsWith('-')) {
                currentInput = currentInput.substring(1);
            } else {
                currentInput = '-' + currentInput;
            }
            // Expression'daki son sayıyı da güncellemek gerekir.
            // Bu, expression'ı sondan başlayarak parse etmeyi gerektirir.
            // Örn: "1+23" negate -> "1+-23"
            // En kolay yol, negate edilen sayıyı parantez içine almak: "1+(-23)"
            // Veya, eğer currentInput expression'ın sonundaysa:
            const match = expression.match(/(-?\d*\.?\d+)$/);
            if (match && match[0] === (currentInput.startsWith('-') ? currentInput.substring(1) : currentInput)) { // Önceki hali eşleşiyorsa
                 expression = expression.substring(0, expression.length - match[0].length) + currentInput;
            } else if (match && match[0] === currentInput) { // Mevcut hali eşleşiyorsa (zaten - içeriyorsa)
                 expression = expression.substring(0, expression.length - match[0].length) + currentInput;
            }
            // Bu yaklaşım biraz kırılgan. İdealde, "currentInput" bir "token" olmalı.
        } else if (expression.includes('(-')) { // Negatif bir ifadenin başında olabilir
            // TODO: Daha akıllı negate. Örn: -(5+3)
        }
        updateDisplay();
    }

    // --- HAFIZA İŞLEMLERİ ---
    function handleMemory(action) {
        const currentValue = parseFloat(currentInput);
        if (action === 'clear') {
            memory = 0;
        } else if (action === 'recall') {
            currentInput = memory.toString();
            expression += memory.toString(); // MR sonrası ifadeye ekle
            resultDisplayed = false; // Hafızadan gelen değerle işlem yapılabilir
        } else if (!isNaN(currentValue) && currentInput !== '' && currentInput !== 'Error') {
            if (action === 'add') {
                memory += currentValue;
            } else if (action === 'subtract') {
                memory -= currentValue;
            }
        }
        // Hafıza işlemleri sonrası sonucu hemen hesapla veya bir sonraki girişe bırak
        // Genellikle M+, M- sonrası ekran değişmez, MR ekranı değiştirir.
        // Bazı hesap makineleri M+, M- sonrası mevcut sonucu da hesaplar.
        console.log("Hafıza:", memory);
        if(action !== 'recall') resultDisplayed = true; // M+, M- sonrası yeni sayı girişi beklenir
        updateDisplay();
    }

    // --- BİLİMSEL FONKSİYONLAR ---
    function handleScientificFunction(funcName) {
        // Bilimsel fonksiyonlar genellikle ifadeye `funcName(` olarak eklenir.
        // Örn: sin -> expression += "sin("
        // Kullanıcı sonra argümanı girer ve parantezi kapatır.
        // Veya, eğer currentInput'ta bir sayı varsa, `funcName(currentInput)` olarak uygulanabilir.
        // Çoğu bilimsel hesap makinesi: [sayı] [fonksiyon] -> fonksiyon(sayı) yapar.
        // Veya [fonksiyon] [sayı] [)] [=]

        // Strateji: Fonksiyon butonuna basıldığında "funcName(" ifadesini ekle.
        const funcMap = {
            'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
            'asin': 'asin(', 'acos': 'acos(', 'atan': 'atan(', // INV ile
            'log': 'log(', 'ln': 'ln(',
            'sqrt': 'sqrt(', // √ sembolü yerine
            'exp': 'exp(', // e^x
            // x^y butonu özel, 'pow(' ekleyip sonra ',' ve ikinci argümanı bekleyebilir. Veya ifadeye '^' ekler.
            // n! butonu özel, sayının sonuna '!' ekler.
        };

        if (funcName === 'pow') { // x^y
            if (currentInput !== '' && currentInput !== '0') {
                expression += '^'; // İfadeye ^ ekle
                currentInput = '';
            }
            updateDisplay();
            return;
        }
        if (funcName === 'factorial') { // n!
            if (currentInput !== '' && currentInput !== '0') {
                 // Expression'daki son sayının sonuna ! ekle
                const match = expression.match(/(\d*\.?\d+)$/);
                if(match && match[0] === currentInput) {
                    expression += '!';
                    currentInput = ''; // Faktöriyel sonrası yeni giriş veya eşittir.
                } else { // currentInput boş, expression sonunda sayı var
                    if(!isOperator(expression.slice(-1)) && expression.slice(-1) !== '(' && expression.slice(-1) !== ')') {
                        expression += '!';
                    }
                }
            }
            updateDisplay();
            return;
        }


        // Ters fonksiyonlar (INV aktifse)
        if (inverseFunctions) {
            if (funcName === 'sin') funcName = 'asin';
            else if (funcName === 'cos') funcName = 'acos';
            else if (funcName === 'tan') funcName = 'atan';
            // log -> 10^x , ln -> e^x (bu exp ile aynı)
            else if (funcName === 'log') funcName = 'pow10'; // 10^x için özel bir ad
            else if (funcName === 'ln') { /* exp ile aynı, veya ln'nin tersi exp(x) */ }
            // sqrt -> x^2
            else if (funcName === 'sqrt') funcName = 'sqr'; // x^2 için özel bir ad
        }


        // Eğer currentInput'ta bir değer varsa ve ifade boşsa veya operatörle bitiyorsa,
        // fonksiyonu doğrudan o değere uygula (örn: 5, sin -> sin(5))
        // Ancak bu, "sin(5+3)" gibi durumları zorlaştırır.
        // Daha tutarlı olan: "funcName(" eklemek.
        if (funcMap[funcName]) {
            expression += funcMap[funcName];
            currentInput = ''; // Fonksiyon sonrası argüman girişi beklenir
            resultDisplayed = false;
        } else if (funcName === 'sqr') { // x^2 (INV √)
            expression += '^2'; currentInput = '';
        } else if (funcName === 'pow10') { // 10^x (INV log)
            expression += '10^('; currentInput = '';
        }


        updateDisplay();
    }

    function handleConstant(constantName) {
        let valStr = '';
        if (constantName === 'PI') valStr = Math.PI.toString();
        else if (constantName === 'E') valStr = Math.E.toString();

        // Eğer ifade boşsa veya operatörle bitiyorsa, sabiti doğrudan ekle
        if (expression === '' || isOperator(expression.slice(-1)) || expression.slice(-1) === '(') {
            expression += valStr;
            currentInput = valStr; // Sabit doğrudan currentInput olur
        } else {
            // Eğer ifade bir sayıyla bitiyorsa, çarpma operatörü ekleyip sabiti ekle (örn: 2π)
            if (!isNaN(parseFloat(expression.slice(-1)))) {
                expression += '*' + valStr;
                currentInput = valStr;
            } else { // Diğer durumlar (örn: parantez sonrası)
                expression += valStr;
                currentInput = valStr;
            }
        }
        resultDisplayed = false; // Sabit sonrası işlem devam edebilir
        updateDisplay();
    }

    function toggleAngleUnit() {
        angleUnit = angleUnit === 'DEG' ? 'RAD' : 'DEG';
        angleToggleButton.innerText = angleUnit;
        // Açı birimi değiştiğinde, devam eden bir hesaplama varsa sonucu etkileyebilir.
        // Genellikle kullanıcı bunu hesaplama yapmadan önce ayarlar.
        // Sonucu yeniden hesaplamak iyi bir fikir olabilir ama karmaşık.
    }

    function toggleInverseFunctions() {
        inverseFunctions = !inverseFunctions;
        invToggleButton.classList.toggle('active', inverseFunctions); // CSS'te .active için stil eklenebilir

        // Buton metinlerini güncelle (sin <-> asin vb.)
        const funcButtons = {
            'sin': 'asin', 'cos': 'acos', 'tan': 'atan',
            'log': '10ˣ', 'ln': 'eˣ', 'sqrt': 'x²'
        };
        scientificButtons.forEach(btn => {
            const func = btn.dataset.function;
            if (func && funcButtons[func]) {
                if (inverseFunctions) {
                    if(func === 'log') btn.innerHTML = funcButtons[func];
                    else if(func === 'ln') btn.innerHTML = funcButtons[func]; // Zaten e^x butonu var, bu ln'nin tersi
                    else if(func === 'sqrt') btn.innerHTML = funcButtons[func];
                    else btn.innerHTML = `a${func}`; // asin, acos, atan
                } else {
                    btn.innerHTML = func; // Orijinal metin
                }
            }
        });
    }


    // --- OLAY DİNLEYİCİLERİ ---
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            const { number, operator, action, memory: memAction, function: sciFunc, constant, operation: opData } = button.dataset;

            if (number) appendNumber(number);
            if (operator) chooseOperation(button.innerText); // Operatör sembolünü doğrudan al
            if (opData) { // data-operation için özel durumlar
                if(opData === 'open-parenthesis') { expression += '('; updateDisplay(); }
                else if(opData === 'close-parenthesis') { expression += ')'; updateDisplay(); }
                else if(opData === 'percentage') handlePercentage();
                else if(opData === 'toggle-angle') toggleAngleUnit();
                else if(opData === 'inv') toggleInverseFunctions();
            }
            if (action) {
                if (action === 'all-clear') allClear();
                else if (action === 'clear-entry') clearEntry();
                else if (action === 'delete') deleteLast();
                else if (action === 'equals') calculate();
                else if (action === 'negate') negateNumber();
            }
            if (memAction) handleMemory(memAction);
            if (sciFunc) handleScientificFunction(sciFunc);
            if (constant) handleConstant(constantName);

        });
    });

    // Klavye Desteği
    document.addEventListener('keydown', (e) => {
        // console.log(e.key);
        if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
        if (e.key === '.') appendNumber('.');
        if (e.key === '+') { e.preventDefault(); chooseOperation('+'); }
        if (e.key === '-') { e.preventDefault(); chooseOperation('-'); }
        if (e.key === '*') { e.preventDefault(); chooseOperation('*'); } // veya ×
        if (e.key === '/') { e.preventDefault(); chooseOperation('/'); } // veya ÷
        if (e.key === '%') { e.preventDefault(); handlePercentage(); }
        if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
        if (e.key === 'Backspace') { e.preventDefault(); deleteLast(); }
        if (e.key === 'Escape') { e.preventDefault(); allClear(); }
        if (e.key === '(') { e.preventDefault(); expression += '('; updateDisplay(); }
        if (e.key === ')') { e.preventDefault(); expression += ')'; updateDisplay(); }
        // Diğer bilimsel fonksiyonlar için de kısayollar eklenebilir (örn: 's' for sin)
    });


    // Başlangıç ekranı
    updateDisplay();
});