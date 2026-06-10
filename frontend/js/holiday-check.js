document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const destinationInput = document.getElementById('destination');

  // Country mapping
  const countryMap = {
    malaysia: "MY",
    japan: "JP",
    "united kingdom": "GB",
    uk: "GB",
    usa: "US",
    "united states": "US",
    korea: "KR",
    singapore: "SG",
    thailand: "TH",
    indonesia: "ID",
    china: "CN"
  };

  startDateInput.addEventListener('change', checkHolidays);
  endDateInput.addEventListener('change', checkHolidays);
  destinationInput.addEventListener('input', checkHolidays);

  async function checkHolidays() {
    const start = startDateInput.value;
    const end = endDateInput.value;
    const destination = destinationInput.value.trim().toLowerCase();

    if (!start || !end || !destination) return;

    const year = new Date(start).getFullYear();

    // Convert destination → country code
    const countryCode = countryMap[destination] || "MY"; 
    // fallback = MY if not found

    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/holidays/${year}/${countryCode}`
      );

      const data = await res.json();
      const holidays = data.results || [];

      const warningBox = document.getElementById('holidayWarning');
      const list = document.getElementById('holidayList');

      list.innerHTML = "";

      const affected = holidays.filter(holiday => {
        return holiday.date >= start && holiday.date <= end;
      });

      if (affected.length > 0) {
        warningBox.classList.remove('hidden');

        affected.forEach(holiday => {
          const li = document.createElement('li');
          li.textContent = `${holiday.date} - ${holiday.name}`;
          list.appendChild(li);
        });

      } else {
        warningBox.classList.add('hidden');
      }

    } catch (err) {
      console.error("Holiday fetch error:", err);
    }
  }
});