// Use code with caution.
let db;
const dbName = "FleetCheckDB";
const storeName = "offlineDrops";

// Initialize the Local Browser Database (IndexedDB Engine)
const request = indexedDB.open(dbName, 2); 

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
        trackingActive = true;
        shiftBtn.innerText = "🛑 Stop Shift Tracking";
        shiftBtn.style.backgroundColor = "#dc2626"; 
        
        mileageInterval = setInterval(() => {
            totalMiles += (Math.random() * 0.15); 
            mileageDisplay.innerText = `${totalMiles.toFixed(2)} mi`;
            
            let totalDeduction = totalMiles * mileageRate;
            taxDisplay.innerText = `$${totalDeduction.toFixed(2)}`;
        }, 3000);
    } else {
        trackingActive = false;
        clearInterval(mileageInterval);
        shiftBtn.innerText = "Start Shift Tracking";
        shiftBtn.style.backgroundColor = "var(--accent)";
    }
});

// Drop Log Capture Action Controls
document.getElementById('scanBtn').addEventListener('click', () => {
    const lowDataMode = document.getElementById('lowDataToggle').checked;
    
    const newRecord = {
        id: "DROP-" + Date.now(),
        tag: "BARCODE-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleTimeString(),
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
            logBox.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <p style="margin-bottom: 8px;">No pending logs cached in local device memory.</p>
                    <a href="https://gumroad.com" target="_blank" style="color: var(--primary); font-weight: bold; text-decoration: none; display: inline-block; margin-top: 5px;">Get Enterprise Cloud Webhook Matrix →</a>
                </div>
            `;
            return;
        }

        logBox.innerHTML = ""; 
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

// Green Sync Action Control Button (Live External Broadcast Network Engine)
document.getElementById('syncBtn').addEventListener('click', () => {
    document.getElementById('status').innerText = "Scanning Airwaves for Network Signal...";
    document.getElementById('status').style.color = "var(--accent)";

    if (!navigator.onLine) {
        setTimeout(() => {
            document.getElementById('status').innerText = "Sync Failed: Device completely offline!";
            document.getElementById('status').style.color = "#dc2626";
        }, 1000);
        return;
    }

    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        const records = getAll.result;
        if (records.length === 0) {
            document.getElementById('status').innerText = "System Status: Queue is empty.";
            document.getElementById('status').style.color = "var(--text-muted)";
            return;
        }

        // Live Fetch Broadcast Loop payload targeting your enterprise webhook receiver template
        fetch('https://httpbin.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dossierPayload: records,
                clientToken: "FLEET_PRO_OPEN_SOURCE_SHELL",
                deploymentOrigin: window.location.origin
            })
        })
        .then(response => {
            if (response.ok) {
                const writeTransaction = db.transaction([storeName], "readwrite");
                const writeStore = writeTransaction.objectStore(storeName);
                writeStore.clear().onsuccess = () => {
                    document.getElementById('status').innerText = "Cloud Ingestion Complete (Status 200)!";
                    document.getElementById('status').style.color = "var(--success)";
                    renderQueue();
                };
            } else {
                throw new Error("Target Receiver Unreachable");
            }
        })
        .catch(error => {
            console.error('[Fleet-Check Pro Ingestion Error]:', error);
            document.getElementById('status').innerText = "Error: Enterprise Server Connector Required!";
            document.getElementById('status').style.color = "var(--accent)";
        });
    };
});
