// =====================
// Dashboard JS Live + Camera + Unregistered
// =====================

const cam1Table = document.querySelector('#cam1Table tbody');
const cam2Table = document.querySelector('#cam2Table tbody');
const unregTable = document.querySelector('#unregTable tbody');
const latestPlate = document.getElementById('latestPlate');
const latestOwner = document.getElementById('latestOwner');
const latestType = document.getElementById('latestType');
const latestStatus = document.getElementById('latestStatus');
const alertBox = document.getElementById('alertBox');

const totalVehiclesEl = document.getElementById('totalVehicles');
const registeredVehiclesEl = document.getElementById('registeredVehicles');
const unregisteredVehiclesEl = document.getElementById('unregisteredVehicles');

// =====================
// Chart Setup
// =====================
const ctx = document.getElementById('detectionChart').getContext('2d');
const detectionChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{ label:'Detections', data:[0,0,0,0,0,0,0], backgroundColor:'#1e90ff'}]
  },
  options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
});

// =====================
// Fetch All Vehicles
// =====================
async function fetchAllVehicles() {
  try {
    const res = await fetch('/api/fetch-all-vehicles');
    const data = await res.json();

    // Stats
    const total = data.length;
    const registered = data.filter(v => v.Status.trim() === 'REGISTERED').length;
    const unregistered = total - registered;

    totalVehiclesEl.textContent = total;
    registeredVehiclesEl.textContent = registered;
    unregisteredVehiclesEl.textContent = unregistered;

    // Clear tables
    cam1Table.innerHTML = '';
    cam2Table.innerHTML = '';
    unregTable.innerHTML = '';

    // Latest 5 per camera
    const cam1Data = data.filter(v => v.Camera === 'CAM1').slice(0,5);
    const cam2Data = data.filter(v => v.Camera === 'CAM2').slice(0,5);
    const unregData = data.filter(v => v.Status.trim() !== 'REGISTERED').slice(0,5);

    cam1Data.forEach(v => {
      const row = `<tr>
        <td>${new Date(v.Time_Detected).toLocaleTimeString()}</td>
        <td>${v.Plate_Number}</td>
        <td>${v.Name || '-'}</td>
        <td>${v.Status}</td>
      </tr>`;
      cam1Table.innerHTML += row;
    });

    cam2Data.forEach(v => {
      const row = `<tr>
        <td>${new Date(v.Time_Detected).toLocaleTimeString()}</td>
        <td>${v.Plate_Number}</td>
        <td>${v.Name || '-'}</td>
        <td>${v.Status}</td>
      </tr>`;
      cam2Table.innerHTML += row;
    });

    unregData.forEach(v => {
      const row = `<tr>
        <td>${new Date(v.Time_Detected).toLocaleTimeString()}</td>
        <td>${v.Plate_Number}</td>
        <td>${v.Vehicle_Type || '-'}</td>
        <td><img src="${v.Image_Url}" alt="${v.Plate_Number}" style="width:80px;height:auto;"/></td>
      </tr>`;
      unregTable.innerHTML += row;
    });

    // Latest detected vehicle
    if(data.length){
      const latest = data[0];
      latestPlate.textContent = latest.Plate_Number;
      latestOwner.textContent = latest.Name || '-';
      latestType.textContent = latest.Vehicle_Type || '-';
      latestStatus.textContent = latest.Status;
      alertBox.style.display = latest.Status.trim() !== 'REGISTERED' ? 'block' : 'none';
    }

    // TODO: Update chart if needed

  } catch(err) {
    console.error("Fetch vehicles error:", err);
  }
}

// Auto-refresh setiap 5 detik
fetchAllVehicles();
setInterval(fetchAllVehicles, 5000);

// =====================
// Log Out Button
// =====================
const logoutBtn = document.createElement("button");
logoutBtn.textContent = "Log Out";
logoutBtn.id = "logoutBtn";
logoutBtn.className = "logout-button";
const header = document.querySelector(".dashboard-header");
header.appendChild(logoutBtn);

logoutBtn.style.marginLeft = "10px";
logoutBtn.style.padding = "5px 12px";
logoutBtn.style.backgroundColor = "#e53e3e";
logoutBtn.style.color = "white";
logoutBtn.style.border = "none";
logoutBtn.style.borderRadius = "5px";
logoutBtn.style.cursor = "pointer";
logoutBtn.style.fontWeight = "bold";
logoutBtn.addEventListener("mouseover", () => logoutBtn.style.backgroundColor = "#c53030");
logoutBtn.addEventListener("mouseout", () => logoutBtn.style.backgroundColor = "#e53e3e");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
});

// =====================
// Optional: MJPEG stream embed
// =====================
const streamEl = document.getElementById('cameraStream');
if(streamEl){
  streamEl.src = 'http://RASPBERRY_PI_IP:8080/stream.mjpg'; // ganti IP & port
}
