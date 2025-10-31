/* public/assets/js/dashboard.js
   EDIT: set CAMERA1_URL and CAMERA2_URL:
   - If you run cloudflared for port 5000: use the trycloudflare full URL cloudflared gives you, e.g.
     const CAMERA1_URL = "https://blue-frog-7zuj.trycloudflare.com/video_feed";
   - Or if your webserver proxies /cam1 -> camera feed, set CAMERA1_BASE and use /cam1 path.
*/
const CAMERA1_URL = "http://10.171.170.242:5000/video_feed"; // <-- edit jika perlu
const CAMERA2_URL = "http://10.171.170.242:5000/video_feed"; // if only 1 camera, can use same endpoint
const USE_FULL_CAMERA_URLS = true; // true = CAMERA1_URL is full URL; false = use BASE + "/cam1"

const CAM1_IMG = document.getElementById("cam1Img");
const CAM2_IMG = document.getElementById("cam2Img");
const cam1Table = document.querySelector("#cam1Table tbody");
const cam2Table = document.querySelector("#cam2Table tbody");
const totalCountEl = document.getElementById("totalCount");
const regCountEl = document.getElementById("regCount");
const unregCountEl = document.getElementById("unregCount");
const latestPlate = document.getElementById("latestPlate");
const latestOwner = document.getElementById("latestOwner");
const latestType = document.getElementById("latestType");
const latestTime = document.getElementById("latestTime");
const latestStatus = document.getElementById("latestStatus");
const unregAlert = document.getElementById("unregAlert");

const chartCtx = document.getElementById("chart").getContext("2d");
let chart = new Chart(chartCtx, { type: 'bar', data: { labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], datasets:[{ label:'Detections', data:[0,0,0,0,0,0,0] }]}, options:{plugins:{legend:{display:false}}}});

let autoMs = 3000;
let feedsPaused = false;
let vehiclesCache = []; // latest fetched combined data
let registeredMap = {}; // plate -> vehicle info (from VEHICLES table if found)
let fetchInterval = null;
let camInterval = null;

function ts(){ return new Date().getTime(); }
function setCam(el, url) {
  if (!url) { el.alt = "CAM URL not set"; return; }
  el.src = url + (url.includes("?") ? "&" : "?") + "t=" + ts();
}

/* camera refresh */
function refreshCams() {
  if (feedsPaused) return;
  if (USE_FULL_CAMERA_URLS) {
    setCam(CAM1_IMG, CAMERA1_URL);
    setCam(CAM2_IMG, CAMERA2_URL);
  } else {
    // if you decide to use BASE + /cam1, set BASE_CAMERA_URL variable and paths
    setCam(CAM1_IMG, BASE_CAMERA_URL + "/cam1");
    setCam(CAM2_IMG, BASE_CAMERA_URL + "/cam2");
  }
}

/* fetch vehicles from existing API */
async function fetchVehicles() {
  try {
    const res = await fetch("/api/fetch-all-vehicles");
    const json = await res.json();
    if (!json.success) return [];
    vehiclesCache = json.data || [];

    // Build registeredMap: look at VEHICLES by infer from combined where Status != "UNREGISTERED"
    registeredMap = {};
    vehiclesCache.forEach(item => {
      const plate = (item.Plate_Number || "").trim();
      if (!plate) return;
      if (item.Status && item.Status !== "UNREGISTERED") {
        // treat as registered
        registeredMap[plate] = {
          Plate_Number: plate,
          Name: item.Name || "-",
          Vehicle_Type: item.Vehicle_Type || "-",
          Status: item.Status || "REGISTERED"
        };
      }
    });

    render(vehiclesCache);
    return vehiclesCache;
  } catch (err) {
    console.error("fetchVehicles error", err);
    return [];
  }
}

/* render data to UI */
function render(data) {
  const q = (document.getElementById("search")||{value:""}).value.trim().toLowerCase();
  const filtered = q ? data.filter(v => (v.Plate_Number||"").toLowerCase().includes(q) || (v.Name||"").toLowerCase().includes(q)) : data;

  // split by camera
  const cam1 = filtered.filter(v => (v.Camera||"CAM1") === "CAM1");
  const cam2 = filtered.filter(v => (v.Camera||"CAM1") === "CAM2");

  totalCountEl.textContent = filtered.length;
  const regCount = filtered.filter(v => v.Status !== "UNREGISTERED").length;
  regCountEl.textContent = regCount;
  unregCountEl.textContent = filtered.filter(v => v.Status === "UNREGISTERED").length;

  // latest
  const latest = filtered.length ? filtered[filtered.length - 1] : null;
  latestPlate.textContent = latest?.Plate_Number || "-";
  // if latest is unregistered, try to lookup name from registeredMap
  if (latest) {
    const plate = latest.Plate_Number || "";
    const registeredInfo = registeredMap[plate];
    latestOwner.textContent = registeredInfo?.Name || (latest.Name || "-");
    latestType.textContent = registeredInfo?.Vehicle_Type || (latest.Vehicle_Type || "-");
    latestTime.textContent = latest.Time_Detected || latest.Entry_Date || "-";
    latestStatus.textContent = latest.Status || "-";
    unregAlert.style.display = latest.Status === "UNREGISTERED" ? "block" : "none";
  } else {
    latestOwner.textContent = "-";
    latestType.textContent = "-";
    latestTime.textContent = "-";
    latestStatus.textContent = "-";
    unregAlert.style.display = "none";
  }

  // fill tables
  cam1Table.innerHTML = "";
  cam1.forEach(v => {
    // if unregistered, try look-up name
    const plate = v.Plate_Number || "";
    const reg = registeredMap[plate];
    const name = reg?.Name || v.Name || "-";
    const tr = `<tr><td>${escapeHtml(v.Time_Detected||v.Entry_Date||"-")}</td><td>${escapeHtml(plate)}</td><td>${escapeHtml(name)}</td><td style="color:${v.Status==="UNREGISTERED" ? "var(--danger)" : "#10b981"}">${escapeHtml(v.Status||"-")}</td></tr>`;
    cam1Table.insertAdjacentHTML("beforeend", tr);
  });

  cam2Table.innerHTML = "";
  cam2.forEach(v => {
    const plate = v.Plate_Number || "";
    const reg = registeredMap[plate];
    const name = reg?.Name || v.Name || "-";
    const tr = `<tr><td>${escapeHtml(v.Time_Detected||v.Entry_Date||"-")}</td><td>${escapeHtml(plate)}</td><td>${escapeHtml(name)}</td><td style="color:${v.Status==="UNREGISTERED" ? "var(--danger)" : "#10b981"}">${escapeHtml(v.Status||"-")}</td></tr>`;
    cam2Table.insertAdjacentHTML("beforeend", tr);
  });

  updateChart(filtered);
}

/* simple escape */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* update chart */
function updateChart(data) {
  const counts = [0,0,0,0,0,0,0];
  data.forEach(d => {
    const t = d.Time_Detected ? new Date(d.Time_Detected) : (d.Entry_Date ? new Date(d.Entry_Date) : null);
    const idx = t ? t.getDay() : 0;
    counts[idx] += 1;
  });
  chart.data.datasets[0].data = counts;
  chart.update();
}

/* actions */
document.getElementById("triggerAlarm").addEventListener("click", async ()=>{
  const plate = latestPlate.textContent || "";
  if (!plate || plate === "-") return alert("Tiada kenderaan dikesan");
  try {
    const r = await fetch("/api/trigger-alarm", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({plate})});
    const j = await r.json();
    alert(j.message || "Alarm triggered");
  } catch (e){ alert("Gagal trigger alarm"); }
});

document.getElementById("viewHistory").addEventListener("click", ()=> {
  const plate = latestPlate.textContent || "";
  if (!plate || plate === "-") return alert("Tiada kenderaan dikesan");
  window.location.href = `/history?plate=${encodeURIComponent(plate)}`;
});

document.getElementById("blockGate").addEventListener("click", async ()=>{
  const plate = latestPlate.textContent || "";
  if (!plate || plate === "-") return alert("Tiada kenderaan dikesan");
  try {
    const r = await fetch("/api/block-gate", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({plate})});
    const j = await r.json();
    alert(j.message || "Gate blocked");
  } catch (e){ alert("Gagal block gate"); }
});

/* logout */
document.getElementById("logoutBtn").addEventListener("click", ()=>{
  localStorage.removeItem("auth_token");
  window.location.href = "/"; // or your homepage
});

/* dark mode */
const darkBtn = document.getElementById("darkBtn");
const savedTheme = localStorage.getItem("hawk_theme");
if(savedTheme === "dark") document.documentElement.setAttribute("data-theme","dark");
darkBtn.textContent = (savedTheme === "dark") ? "Light Mode" : "Dark Mode";
darkBtn.addEventListener("click", ()=>{
  const cur = document.documentElement.getAttribute("data-theme");
  if(cur === "dark") { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("hawk_theme","light"); darkBtn.textContent = "Dark Mode"; }
  else { document.documentElement.setAttribute("data-theme","dark"); localStorage.setItem("hawk_theme","dark"); darkBtn.textContent = "Light Mode"; }
});

/* pause feeds */
document.getElementById("pauseFeeds").addEventListener("click", ()=>{
  feedsPaused = !feedsPaused;
  document.getElementById("pauseFeeds").textContent = feedsPaused ? "Resume Feeds" : "Pause Feeds";
  if(!feedsPaused) refreshCams();
});

/* auto refresh select */
document.getElementById("autoSelect").addEventListener("change", (e)=>{
  autoMs = parseInt(e.target.value,10);
  if (fetchInterval) clearInterval(fetchInterval);
  fetchInterval = setInterval(fetchVehicles, autoMs);
});

/* refresh now */
document.getElementById("refreshNow").addEventListener("click", ()=> {
  fetchVehicles();
  refreshCams();
});

/* search */
document.getElementById("search").addEventListener("input", ()=> render(vehiclesCache));

/* start loops */
function start() {
  fetchVehicles();
  if (fetchInterval) clearInterval(fetchInterval);
  fetchInterval = setInterval(fetchVehicles, autoMs);
  refreshCams();
  if (camInterval) clearInterval(camInterval);
  camInterval = setInterval(refreshCams, 10000);
}
start();
