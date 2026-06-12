function setupCountrySearch(searchId, hiddenId, listId, defaultCode) {
    const searchBox = document.getElementById(searchId);
    const hiddenInput = document.getElementById(hiddenId);
    const listBox = document.getElementById(listId);

    const defaultCountry = window.countries.find(c => c.code === defaultCode);

    // default selected display
    searchBox.innerHTML = `
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
                <span class="fi fi-${defaultCountry.flag} text-xl"></span>
                <span class="text-slate-700 font-medium">${defaultCountry.name}</span>
            </div>

            <span class="material-symbols-outlined text-slate-400">
                keyboard_arrow_down
            </span>
        </div>
    `;

    hiddenInput.value = defaultCountry.code;

    // =====================
    // RENDER DROPDOWN LIST
    // =====================
    function renderList(keyword = "") {
        const filtered = window.countries.filter(c =>
            c.code.toLowerCase().includes(keyword.toLowerCase()) ||
            c.name.toLowerCase().includes(keyword.toLowerCase())
        );

        listBox.innerHTML = filtered.map(c => `
            <button type="button"
                class="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3"
                onclick="selectCountry('${searchId}', '${hiddenId}', '${listId}', '${c.code}')">

                <span class="fi fi-${c.flag} text-xl"></span>

                <span class="text-slate-700 font-medium">
                    ${c.name}
                </span>

            </button>
        `).join("");

        listBox.classList.remove("hidden");
    }

    // open on focus typing
    searchBox.addEventListener("click", () => {
        renderList("");
    });
}

function selectCountry(searchId, hiddenId, listId, code) {
    const country = window.countries.find(c => c.code === code);

    document.getElementById(searchId).innerHTML = `
        <span class="fi fi-${country.flag} text-xl"></span>
        <span class="text-slate-700 font-medium">${country.name}</span>
    `;
    document.getElementById(hiddenId).value = country.code;
    document.getElementById(listId).classList.add("hidden");
}

async function getHolidays() {
    const countryCode = document.getElementById("country").value;
    const year = new Date().getFullYear();

    const resultBox = document.getElementById("resultBox");
    const resultTitle = document.getElementById("resultTitle");
    const resultGrid = document.getElementById("resultGrid");

    try {
        // Unhide result box cleanly
        resultBox.classList.remove("hidden");
        
        // FIX: Force the loading state to span the entire width so it never breaks grid columns
        resultGrid.innerHTML = `<div class="col-span-full text-center text-slate-500 py-4 font-medium animate-pulse">⏳ Loading holidays...</div>`;
        resultTitle.innerText = `Searching...`;

        const data = await apiRequest(`/holidays/${year}/${countryCode}`);
        
        if (!data.success || !data.holidays || data.holidays.length === 0) {
            resultTitle.innerText = "No Results";
            resultGrid.innerHTML = `<div class="col-span-full text-center text-red-500 py-4">No public holidays found for this selection.</div>`;
            return;
        }

        const selectedCountry = window.countries?.find(c => c.code === countryCode);
        const countryName = selectedCountry ? selectedCountry.name : countryCode;
        resultTitle.textContent = `Public Holidays in ${countryName} (${year})`;

        resultGrid.innerHTML = data.holidays.map(h => `
            <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-semibold text-[#1a1b1f] line-clamp-2">${h.name}</h3>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-50">
                    <p class="text-slate-500 flex items-center gap-2 text-sm font-medium">
                        <span>📅</span> ${h.date?.iso || "No date"}
                    </p>
                    <p class="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                        ${h.type?.join(", ") || "Public holiday"}
                    </p>
                </div>
            </div>
        `).join("");

    } catch (err) {
        resultTitle.innerText = "Error Occurred";
        resultGrid.innerHTML = `<div class="col-span-full text-center text-red-500 py-4">Error: ${err.message}</div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupCountrySearch("countrySearch", "country", "countryList", "MY");

    // close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const searchBox = document.getElementById("countrySearch");
        const listBox = document.getElementById("countryList");

        if (!searchBox.contains(e.target) && !listBox.contains(e.target)) {
            listBox.classList.add("hidden");
        }
    });
});