// Junction coordinates data
const junctionData = {
    'Kukatpally': { lat: 17.493338, lng: 78.402547 },
    'Ameerpet': { lat: 17.434275, lng: 78.445403 },
    'Miyapur': { lat: 17.496653, lng: 78.361809 },
    'Bowenpally': { lat: 17.463865, lng: 78.472837 },
    'Secunderabad': { lat: 17.434962, lng: 78.500812 },
    'Madhapur': { lat: 17.451399, lng: 78.381218 }

    
};

// Initialize map
const map = L.map('map').setView([17.385044, 78.486671], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ' OpenStreetMap contributors'
}).addTo(map);

// Store markers and UI elements
let markers = {};
const areaSelect = document.getElementById('area-select');
const timeInput = document.getElementById('time');
const daySelect = document.getElementById('day');
const weatherSelect = document.getElementById('weather');
const predictBtn = document.getElementById('predict-btn');
const loadingOverlay = document.querySelector('.loading-overlay');
const resultsPanel = document.querySelector('.results-panel');

// Create marker for selected junction
function getTrafficColor(density) {
    if (density <= 0.33) {
        return { color: '#4CAF50', opacity: 0.4 }; // Low traffic - Green
    } else if (density <= 0.66) {
        return { color: '#ff9800', opacity: 0.6 }; // Medium traffic - Orange
    } else {
        return { color: '#f44336', opacity: 0.8 }; // High traffic - Red
    }
}

function createJunctionMarker(name, coords, density) {
    const trafficStyle = getTrafficColor(density);
    const marker = L.circle([coords.lat, coords.lng], {
        radius: 300, // Fixed radius in meters
        fillColor: trafficStyle.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: trafficStyle.opacity,
        className: `junction-marker ${name.toLowerCase()}`
    });

    marker.bindPopup(`
        <div class="junction-popup">
            <div class="name">${name} Junction</div>
            <div class="coordinates">
                ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}
            </div>
            <div class="traffic-info">
                Traffic Density: ${(density * 100).toFixed(1)}%
            </div>
        </div>
    `);

    return marker;
}

// Store current active marker
let currentMarker = null;

// Handle area selection
areaSelect.addEventListener('change', function(e) {
    const selectedArea = e.target.value;
    
    // Remove current marker if exists
    if (currentMarker) {
        currentMarker.remove();
        currentMarker = null;
    }

    if (selectedArea) {
        map.setView([
            junctionData[selectedArea].lat,
            junctionData[selectedArea].lng
        ], 15);
        validateInputs();
    }
});

// Update the prediction handler
predictBtn.addEventListener('click', async function() {
    const selectedArea = areaSelect.value;
    if (!selectedArea) return;

    // Remove current marker if exists
    if (currentMarker) {
        currentMarker.remove();
        currentMarker = null;
    }

    loadingOverlay.classList.add('active');

    try {
        const prediction = {
            density: Math.random(),
            mae: Math.random() * 0.1,
            rmse: Math.random() * 0.15
        };

        const marker = createJunctionMarker(selectedArea, junctionData[selectedArea], prediction.density);
        marker.addTo(map);
        marker.openPopup();
        currentMarker = marker;

        // Update prediction results
        function updateResults(prediction) {
            const densityMeter = document.querySelector('.meter-fill');
            const densityValue = document.getElementById('predicted-density');
            const maeValue = document.getElementById('mae-value');
            const rmseValue = document.getElementById('rmse-value');
        
            // Update density meter
            densityMeter.style.width = `${prediction.density * 100}%`;
            
            // Update values
            densityValue.textContent = prediction.density.toFixed(2);
            maeValue.textContent = prediction.mae.toFixed(4);
            rmseValue.textContent = prediction.rmse.toFixed(4);
        
            // Show results panel
            resultsPanel.classList.add('active');
        }
        showToast('Prediction completed successfully!');
    } catch (error) {
        showToast('Failed to get prediction. Please try again.', 'error');
    } finally {
        loadingOverlay.classList.remove('active');
    }
});

// Remove initial marker creation
// createJunctionMarkers();

// Form validation
function validateInputs() {
    const isTimeValid = timeInput.value !== '';
    const isDayValid = daySelect.value !== '';
    const isWeatherValid = weatherSelect.value !== '';
    const isAreaValid = areaSelect.value !== '';

    predictBtn.disabled = !(isTimeValid && isDayValid && isWeatherValid && isAreaValid);
}

// Add validation listeners
[timeInput, daySelect, weatherSelect].forEach(input => {
    input.addEventListener('change', validateInputs);
});

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.toast-container');
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}