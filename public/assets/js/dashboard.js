// =====================
// Dashboard JS – Live MJPEG + Pi Detection
// =====================
const cam1Table = document.querySelector('#cam1Table tbody');
const cam2Table = document.querySelector('#cam2Table tbody');
const latestPlate = document.getElementById('latestPlate');
const latestOwner = document.getElementById('latestOwner');
const latestType = document.getElementById('latestType');
const latestStatus = document.getElementById('latestStatus');
const alertBox = document.getElementById('alertBox');

const cam1Plate = document.getElementById('cam1Plate');
const cam1Alert = document.getElementById('cam1Alert');
const cam2Plate = document.getElementById('cam2Plate');
const cam2Alert = document.getElementById('cam2Alert');

const totalVehiclesEl = document.getElementById('totalVehicles');
const registeredVehiclesEl = document.getElementById('registeredVehicles');
const unregisteredVehiclesEl = document.getElementById('unregisteredVehicles');

// =====================
// Chart
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
// Fetch Vehicles Function
// =====================
async function fetchVehicles() {
  try {
    const res = await fetch('/api/fetch-vehicles');
    const data = await res.json();

    const total = data.length;
    const registered = data.filter(v=>v.Status.trim() === 'REGISTERED').length;
    const unregistered = total - registered;

    totalVehiclesEl.textContent = total;
    registeredVehiclesEl.textContent = registered;
    unregisteredVehiclesEl.textContent = unregistered;

    cam1Table.innerHTML = '';
    cam2Table.innerHTML = '';

    data.slice(0,5).forEach((v) => {
      const row1 = `<tr><td>${new Date().toLocaleTimeString()}</td><td>${v.Plate_Number}</td><td>${v.Name}</td><td>${v.Status}</td></tr>`;
      cam1Table.innerHTML += row1;
      const row2 = `<tr><td>${new Date().toLocaleTimeString()}</td><td>${v.Plate_Number}</td><td>${v.Name}</td><td>${v.Status}</td></tr>`;
      cam2Table.innerHTML += row2;
    });

    if(data.length){
      const latest = data[0];
      latestPlate.textContent = latest.Plate_Number;
      latestOwner.textContent = latest.Name;
      latestType.textContent = latest.Vehicle_Type;
      latestStatus.textContent = latest.Status;
      alertBox.style.display = latest.Status.trim() !== 'REGISTERED' ? 'block' : 'none';
    }

  } catch(err) { console.error(err); }
}

// =====================
// Fetch Raspberry Pi Real-time Detection
// =====================
async function fetchPiDetection(camera) {
  try {
    // Pi endpoint should return JSON array of detections, latest first
    const res = await fetch(`http://RASPBERRY_IP:PORT/${camera}-detections`);
    const data = await res.json();

    if(data.length){
      const latest = data[0];
      if(camera === 'cam1'){
        cam1Plate.textContent = latest.Plate_Number;
        cam1Alert.style.display = latest.Status.trim() !== 'REGISTERED' ? 'block' : 'none';
      } else {
        cam2Plate.textContent = latest.Plate_Number;
        cam2Alert.style.display = latest.Status.trim() !== 'REGISTERED' ? 'block' : 'none';
      }
    }

  } catch(err){ console.error(err); }
}

// =====================
// Live MJPEG stream
// =====================
document.getElementById('cam1').src = 'http://RASPBERRY_IP:PORT/cam1';
document.getElementById('cam2').src = 'http://RASPBERRY_IP:PORT/cam2';

// =====================
// Auto-refresh
// =====================
fetchVehicles();
setInterval(fetchVehicles, 5000);
setInterval(() => {
  fetchPiDetection('cam1');
  fetchPiDetection('cam2');
}, 2000);

// =====================
// Tambah Log Out Button
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

logoutBtn.addEventListener("mouseover", () => { logoutBtn.style.backgroundColor = "#c53030"; });
logoutBtn.addEventListener("mouseout", () => { logoutBtn.style.backgroundColor = "#e53e3e"; });

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
});
