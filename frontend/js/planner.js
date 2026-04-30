/**
 * js/planner.js
 * Handles fetching and rendering the AI Smart Plan
 */

async function loadSmartPlan() {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    const formatUTC = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        
        // Use UTC methods to extract the exact digits stored in the DB
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };

    if (!tripId) {
        console.error("No Trip ID found in URL");
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        // Fetch trip data
        const response = await apiRequest(`/planner/${tripId}`);
        console.log("Plan Data Received:", response); 

        // Handle both direct and wrapped response objects
        const data = response.trip || response;

        // Validation
        if (!data || (!data.destination && !data.city)) {
            throw new Error("Trip data is incomplete. Please check backend response.");
        }

        // Show UI and hide loader
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('detailsContent').classList.remove('hidden');

        // --- 1. FILL TRIP BASICS ---
        document.getElementById('tripTitle').innerText = data.title || "Adventure Plan";
        document.getElementById('cityName').innerText = data.destination || data.city;

        // const start = data.startDate ? new Date(data.startDate).toLocaleDateString() : 'TBD';
        // const end = data.endDate ? new Date(data.endDate).toLocaleDateString() : 'TBD';
        
        const start = data.startDate ? formatUTC(data.startDate) : 'TBD';
        const end = data.endDate ? formatUTC(data.endDate) : 'TBD';
        document.getElementById('dateRange').innerText = `${start} - ${end}`;
        
        document.getElementById('budgetDisplay').innerText = `RM ${data.budget || data.budgetPerPax || '0'}`;
        document.getElementById('tripPreferences').innerText = data.preferences || "No extra preferences added for this journey.";

        // --- 2. FILL WEATHER ---
        const w = response.weather || { temperature: '--', condition: 'Unavailable', humidity: '--' };
        document.getElementById('tempText').innerText = `${w.temperature}°C`;
        document.getElementById('conditionText').innerText = w.condition;
        document.getElementById('humidityText').innerText = `${w.humidity}%`;

        // Update Weather Icon
        const iconElement = document.getElementById('weatherIcon');
        const cond = w.condition.toLowerCase();
        if (cond.includes('rain')) iconElement.innerText = 'umbrella';
        else if (cond.includes('cloud')) iconElement.innerText = 'cloud';
        else if (cond.includes('sun') || cond.includes('clear')) iconElement.innerText = 'wb_sunny';
        else iconElement.innerText = 'thermostat';

        // --- 3. FILL AI RECOMMENDATION ---
        const adviceBox = document.getElementById('smartAdvice');
        if (adviceBox) {
            adviceBox.innerText = response.recommendation || `Enjoy your trip to ${trip.destination || trip.city}!`;
        }

        // --- 4. FILL ATTRACTIONS ---
        const list = document.getElementById('placesList');
        const attractions = response.attractions || [];

        if (attractions.length > 0) {
            list.innerHTML = attractions.map(place => `
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span class="material-symbols-outlined">explore</span>
                        </div>
                        <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                            ${place.category ? place.category.replace(/_/g, ' ') : 'SIGHTSEEING'}
                        </span>
                    </div>
                    <h4 class="text-lg font-bold text-slate-800 mb-1">${place.name}</h4>
                    <p class="text-sm text-slate-500 leading-snug flex items-start gap-1">
                        <span class="material-symbols-outlined text-xs mt-1">location_on</span>
                        ${place.address || 'Address not listed'}
                    </p>
                </div>
            `).join('');
        } else {
            list.innerHTML = `
                <div class="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p class="text-slate-400 font-medium">No nearby attractions found for this specific location.</p>
                </div>`;
        }

    } catch (err) {
        console.error("Planner Component Error:", err);
        document.getElementById('loader').innerHTML = `
            <div class="p-12 text-center bg-white rounded-[2rem] adventure-shadow max-w-sm">
                <span class="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                <h3 class="text-xl font-bold text-slate-800">Connection Error</h3>
                <p class="text-slate-500 mt-2 text-sm">${err.message}</p>
                <button onclick="location.reload()" class="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Retry</button>
                <br/>
                <a href="dashboard.html" class="inline-block mt-4 text-blue-600 text-sm font-semibold underline">Back to Dashboard</a>
            </div>`;
    }
}

// Initializing
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSmartPlan();
});