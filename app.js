// Use code with caution.
let db;
const dbName = "FleetCheckDB";
const storeName = "offlineDrops";

// Initialize the Local Browser Database (IndexedDB Engine)
const request = indexedDB.open(dbName, 2); // Upgraded version metrics

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    renderQueue();
};

// 1099 Shift Tracker Logic Variables
let trackingActive = false;
let mileageInterval;
let totalMiles = 0.00;
const mileageRate = 0.67; // Standard IRS Mileage Write-Off Rate

const shiftBtn = document.getElementById('shiftBtn');
const mileageDisplay = document.getElementById('mileageDisplay');
const taxDisplay = document.getElementById('taxDisplay');

shiftBtn.addEventListener('click', () => {
    if (!trackingActive) {
        // Start Shift
        trackingActive = true;
        shiftBtn.innerText = "🛑 Stop Shift Tracking";
        shiftBtn.style.backgroundColor = "#dc2626"; // Switch to Red Alert
        
        // Simulate real-world odometer accumulation over time
        mileageInterval = setInterval(() => {
            totalMiles += (Math.random() * 0.15); // Add incremental driving fractions
            mileageDisplay.innerText = `${totalMiles.toFixed(2)} mi`;
            
            // Calculate IRS Tax Deduction Matrix
            let totalDeduction = totalMiles * mileageRate;
            taxDisplay.innerText = `$${totalDeduction.toFixed(2)}`;
        }, 3000);
    } else {
        // End Shift
        trackingActive = false;
        clearInterval(mileageInterval);
        shiftBtn.innerText = "Start Shift Tracking";
        shiftBtn.style.backgroundColor = "var(--accent)";
    }
});

// Drop Log Capture Action Controls
document.getElementById('scanBtn').addEventListener('click', () => {
    const lowDataMode = document.getElementById('lowDataToggle').checked;
    
    // Create high-value localized payload variables
    const newRecord = {
        id: "DROP-" + Date.now(),
        tag: "BARCODE-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleTimeString(),
        // Anti-Fraud Protection: If low data is checked, save memory. If not, simulate picture binary string
        imageData: lowDataMode ? "[TEXT-ONLY CLEAN MODE]" : "data:image/png;base64,iVBORw0KGgoAAAANS...",
        gps: "40.7128° N, 74.0060° W (Verified Drop)"
    };

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    store.add(newRecord);

    transaction.oncomplete = () => {
        document.getElementById('status').innerText = "Record Locked in Anti-Fraud Vault!";
        document.getElementById('status').style.color = "var(--success)";
        renderQueue();
    };
});

// Dynamically Render the Driver's Anti-Fraud Vault Logs Container
function renderQueue() {
    const logBox = document.getElementById('logBox');
    if (!db) return;

    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        const records = getAll.result;
        if (records.length === 0) {
            logBox.innerHTML = "No pending logs cached in local device memory.";
            return;
        }

        logBox.innerHTML = ""; // Clear background container text
        records.forEach(rec => {
            logBox.innerHTML += `
                <div class="log-item">
                    <strong style="color:var(--primary)">${rec.id}</strong><br>
                    🏷️ Tag: ${rec.tag} | 🕒 Time: ${rec.timestamp}<br>
                    📍 GPS Guard: ${rec.gps}<br>
                    🖼️ Payload: <span style="color:var(--text-muted)">${rec.imageData}</span>
                </div>
            `;
        });
    };
}

// Green Sync Action Control Button
document.getElementById('syncBtn').addEventListener('click', () => {
    document.getElementById('status').innerText = "Initiating Outbound Cloud Sync...";
    document.getElementById('status').style.color = "var(--accent)";

    // Simulate Network Sync Pipeline Delay
    setTimeout(() => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const clearRequest = store.clear(); // Safely clear records out of local storage

        clearRequest.onsuccess = () => {
            document.getElementById('status').innerText = "System Status: Cloud Sync Complete!";
            document.getElementById('status').style.color = "var(--success)";
            renderQueue();
        };
    }, 1500);
});
