function setupCurrencySearch(searchId, hiddenId, listId, defaultCode) {
    const searchInput = document.getElementById(searchId);
    const hiddenInput = document.getElementById(hiddenId);
    const listBox = document.getElementById(listId);

    const defaultCurrency = window.currencies.find(c => c.code === defaultCode);

    searchInput.value = `${defaultCurrency.code} - ${defaultCurrency.name}`;
    hiddenInput.value = defaultCurrency.code;

    function renderList(keyword = "") {
        const filtered = window.currencies.filter(c =>
            c.code.toLowerCase().includes(keyword.toLowerCase()) ||
            c.name.toLowerCase().includes(keyword.toLowerCase())
        );

        listBox.innerHTML = filtered.map(c => `
            <button type="button"
                class="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3"
                onclick="selectCurrency('${searchId}', '${hiddenId}', '${listId}', '${c.code}')">
                <span class="fi fi-${c.flag}"></span>
                <span class="font-bold text-slate-700">${c.code}</span>
                <span class="text-slate-500 text-sm">${c.name}</span>
            </button>
        `).join("");

        listBox.classList.remove("hidden");
    }

    searchInput.addEventListener("focus", () => renderList(""));
    searchInput.addEventListener("input", () => renderList(searchInput.value));
}

function selectCurrency(searchId, hiddenId, listId, code) {
    const currency = window.currencies.find(c => c.code === code);

    document.getElementById(searchId).value = `${currency.code} - ${currency.name}`;
    document.getElementById(hiddenId).value = currency.code;
    document.getElementById(listId).classList.add("hidden");
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value || 1;
    const base = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('result');

    try {
        resultText.innerText = "Converting...";
        resultBox.classList.remove("hidden");

        const data = await apiRequest(`/currency/convert?base=${base}&to=${to}&amount=${amount}`);

        if (data.success) {
            resultText.innerText = `${data.amount} ${data.base} = ${data.converted} ${data.to}`;
        } else {
            resultText.innerText = data.message;
        }
    } catch (err) {
        resultText.innerText = err.message || "Conversion failed";
        resultBox.classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupCurrencySearch("fromCurrencySearch", "fromCurrency", "fromCurrencyList", "MYR");
    setupCurrencySearch("toCurrencySearch", "toCurrency", "toCurrencyList", "EUR");
});