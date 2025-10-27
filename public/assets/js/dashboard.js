// =====================
// Dashboard JS
// =====================
const cam1Table = document.querySelector('#cam1Table tbody');
const cam2Table = document.querySelector('#cam2Table tbody');
const latestPlate = document.getElementById('latestPlate');
const latestOwner = document.getElementById('latestOwner');
const latestType = document.getElementById('latestType');
const latestStatus = document.getElementById('latestStatus');
const alertBox = document.getElementById('alertBox');

const totalVehiclesEl = document.getElementById('totalVehicles');
const registeredVehiclesEl = document.getElementById('registeredVehicles');
const unregisteredVehiclesEl = document.getElementById('unregisteredVehicles');

// Chart
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

    // Stats
    const total = data.length;
    const registered = data.filter(v=>v.Status.trim() === 'REGISTERED').length;
    const unregistered = total - registered;

    totalVehiclesEl.textContent = total;
    registeredVehiclesEl.textContent = registered;
    unregisteredVehiclesEl.textContent = unregistered;

    // Tables (latest 5 for each camera)
    cam1Table.innerHTML = '';
    cam2Table.innerHTML = '';

    data.slice(0,5).forEach((v, i) => {
      const row1 = `<tr><td>${new Date().toLocaleTimeString()}</td><td>${v.Plate_Number}</td><td>${v.Name}</td><td>${v.Status}</td></tr>`;
      cam1Table.innerHTML += row1;
      const row2 = `<tr><td>${new Date().toLocaleTimeString()}</td><td>${v.Plate_Number}</td><td>${v.Name}</td><td>${v.Status}</td></tr>`;
      cam2Table.innerHTML += row2;
    });

    // Latest detected vehicle
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

// Auto-refresh setiap 5 detik
fetchVehicles();
setInterval(fetchVehicles, 5000);

// =====================
// Tambah Log Out Button
// =====================
const logoutBtn = document.createElement("button");
logoutBtn.textContent = "Log Out";
logoutBtn.id = "logoutBtn";
logoutBtn.className = "logout-button";

// Letakkan button di header (kanan input search & dark mode toggle)
const header = document.querySelector(".dashboard-header");
header.appendChild(logoutBtn);

// Style button (boleh pindah ke CSS jika mahu)
logoutBtn.style.marginLeft = "10px";
logoutBtn.style.padding = "5px 12px";
logoutBtn.style.backgroundColor = "#e53e3e";
logoutBtn.style.color = "white";
logoutBtn.style.border = "none";
logoutBtn.style.borderRadius = "5px";
logoutBtn.style.cursor = "pointer";
logoutBtn.style.fontWeight = "bold";

// Hover effect
logoutBtn.addEventListener("mouseover", () => { logoutBtn.style.backgroundColor = "#c53030"; });
logoutBtn.addEventListener("mouseout", () => { logoutBtn.style.backgroundColor = "#e53e3e"; });

// Event click untuk log out
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
});
