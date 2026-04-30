// FETCH USER TRIPS
async function fetchUserTrips() {
    const tripContainer = document.getElementById('tripContainer');
    const tripCountElement = document.getElementById('tripCount');

    if (!tripContainer) return;

    try {
        const response = await apiRequest('/trips'); 
        console.log("Backend Response:", response); 

        // Extract the array from response.data (as per your controller)
        const trips = response.data || [];

        if (tripCountElement) {
            tripCountElement.innerText = trips.length;
        }

        if (trips.length === 0) {
            tripContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <span class="material-symbols-outlined text-4xl text-slate-400">explore_off</span>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900">No trips found</h3>
                    <p class="text-slate-500 mt-2 mb-6">Looks like you haven't planned any trips yet.</p>
                    <button onclick="window.location.href='create-trip.html'" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all">
                        Start Planning
                    </button>
                </div>`;
            return;
        }

        // Render the high-fidelity cards
        tripContainer.innerHTML = trips.map(trip => {
            // Calculate days until trip
            const daysLeft = Math.ceil((new Date(trip.startDate) - new Date()) / (1000 * 60 * 60 * 24));
            const countdownText = daysLeft > 0 ? `${daysLeft} Days Left` : (daysLeft === 0 ? "Today!" : "Past Trip");

            // const formatUTC = (dateStr) => {
            //     const d = new Date(dateStr);
            //     // Use getUTC methods to ensure 23:59:59 on the 10th stays on the 10th
            //     return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
            // };
            const formatUTC = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                
                // Convert to string and pad with a leading '0' if the length is less than 2
                const day = String(d.getUTCDate()).padStart(2, '0');
                const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                const year = d.getUTCFullYear();

                return `${day}/${month}/${year}`;
            };
            
            const endDateDisplay = formatUTC(trip.endDate);

            return `
            <div class="group relative bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div class="h-64 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1600" 
                         alt="${trip.destination}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-wider">
                        ${countdownText}
                    </div>
                </div>
                <div class="p-8 space-y-4">
                    <div class="flex justify-between items-start">
                        <div class="max-w-[70%]">
                            <h4 class="text-xl font-bold text-slate-900 truncate">${trip.title}</h4>
                            <p class="text-slate-500 text-sm font-medium mt-1">
                                <span class="material-symbols-outlined text-xs align-middle">location_on</span> ${trip.destination}
                            </p>
                            <p class="text-slate-400 text-xs mt-1">
                                ${new Date(trip.startDate).toLocaleDateString()} - ${endDateDisplay}
                            </p>
                        </div>
                        <div class="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-center">
                            <p class="text-[10px] font-bold uppercase leading-none mb-1">Budget</p>
                            <p class="text-sm font-black">RM ${trip.budget || '0'}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                        ${trip.preferences && trip.preferences.length > 0 
                            ? (Array.isArray(trip.preferences) ? trip.preferences : trip.preferences.split(','))
                                .map(pref => `<span class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold rounded-full">#${pref.trim()}</span>`).join('')
                            : '<span class="text-slate-300 text-xs italic">No tags</span>'
                        }
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div class="flex gap-4">
                            <button onclick="deleteTrip('${trip._id}')" class="text-slate-300 hover:text-red-500 transition-colors">
                                <span class="material-symbols-outlined text-xl">delete_outline</span>
                            </button>
                            <button onclick="window.location.href='edit-trip.html?id=${trip._id}'" class="text-slate-300 hover:text-blue-500 transition-colors">
                                <span class="material-symbols-outlined text-xl">edit_note</span>
                            </button>
                        </div>
                        <button onclick="viewTripDetails('${trip._id}')" class="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Manage Trip <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Fetch Error:", err);
        tripContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-red-500 font-medium">Failed to load trips: ${err.message}</p>
            </div>`;
    }
}

// --- CREATE NEW TRIP ---
const createTripForm = document.getElementById('createTripForm');
if (createTripForm) {
    createTripForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Collect values from the HTML IDs
        const titleValue = document.getElementById('title').value;
        const budgetValue = document.getElementById('budgetPerPax').value; // Optional, if you have a budget field
        const destValue = document.getElementById('destination').value;
        const startValue = document.getElementById('startDate').value;
        const endValue = document.getElementById('endDate').value;
        const prefValue = document.getElementById('preferences').value;

        // 2. Prepare the data object
        const tripData = {
            title: titleValue,
            budget: budgetValue,
            destination: destValue,
            startDate: startValue,
            endDate: endValue,
            // Convert "food, hiking" into ["food", "hiking"] for the Backend Array
            preferences: prefValue ? prefValue.split(',').map(p => p.trim()) : []
        };

        try {
            await apiRequest('/trips', 'POST', tripData);
            alert('Trip created successfully! ✨');
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('Create Trip Error:', err);
            alert('Failed to create trip: ' + err.message);
        }
    });
}

// --- DELETE TRIP ---
// async function deleteTrip(id) {
//     if (confirm('Are you sure you want to delete this trip?')) {
//         try {
//             await apiRequest(`/trips/${id}`, 'DELETE');
//             fetchUserTrips(); // Refresh the list
//         } catch (err) {
//             alert('Delete failed: ' + err.message);
//         }
//     }
// }
// --- DELETE TRIP ---
async function deleteTrip(id) {
    if (confirm('Are you sure you want to delete this trip?')) {
        try {
            await apiRequest(`/trips/${id}`, 'DELETE');
            
            // 1. Show success message
            alert('Trip successfully deleted! ✨');

            // 2. Refresh the list (if on Dashboard) 
            // OR Redirect (if on Details page)
            const tripContainer = document.getElementById('tripContainer');
            if (tripContainer) {
                fetchUserTrips(); 
            } else {
                window.location.href = 'dashboard.html';
            }

        } catch (err) {
            console.error('Delete Error:', err);
            alert('Delete failed: ' + err.message);
        }
    }
}

// --- REDIRECT TO DETAILS ---
function viewTripDetails(id) {
    window.location.href = `trip-details.html?id=${id}`;
}

// Initialize fetch if on dashboard
if (document.getElementById('tripContainer')) {
    checkAuth();
    fetchUserTrips();
}

// --- EDIT TRIP LOGIC ---

// 1. Fetch current data and fill the form
async function loadTripToEdit() {
    const editForm = document.getElementById('editTripForm');
    if (!editForm) return; // Only run on edit-trip.html

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    try {
        const response = await apiRequest(`/trips/${tripId}`);
        const trip = response.data || response; // Handle nesting

        // Fill form fields
        document.getElementById('editTitle').value = trip.title;
        document.getElementById('editDestination').value = trip.destination;
        document.getElementById('editBudget').value = trip.budget;
        
        // Format dates to YYYY-MM-DD for HTML input
        if (trip.startDate) document.getElementById('editStartDate').value = trip.startDate.split('T')[0];
        if (trip.endDate) document.getElementById('editEndDate').value = trip.endDate.split('T')[0];
        
        document.getElementById('editPreferences').value = Array.isArray(trip.preferences) 
            ? trip.preferences.join(', ') 
            : trip.preferences;

    } catch (err) {
        alert("Failed to load trip data: " + err.message);
    }
}

// 2. Handle the Submit event for Update
const editTripForm = document.getElementById('editTripForm');
if (editTripForm) {
    editTripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('id');

        const updatedData = {
            title: document.getElementById('editTitle').value,
            destination: document.getElementById('editDestination').value,
            startDate: `${document.getElementById('editStartDate').value}T00:00:00.000Z`,
            endDate: `${document.getElementById('editEndDate').value}T23:59:59.999Z`,
            budget: document.getElementById('editBudget').value,
            preferences: document.getElementById('editPreferences').value.split(',').map(p => p.trim())
        };

        try {
            await apiRequest(`/trips/${tripId}`, 'PUT', updatedData);
            alert('Trip updated successfully! 🚀');
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error("Update Error:", err);
            // Helpful tip if they pick the same day and it still fails
            if (err.message.includes('endDate')) {
                alert('Update failed: Please ensure the End Date is at least the same day or after the Start Date.');
            } else {
                alert('Update failed: ' + err.message);
            }
        }
    });
}

// Run loader on page start
if (document.getElementById('editTripForm')) {
    checkAuth();
    loadTripToEdit();
}