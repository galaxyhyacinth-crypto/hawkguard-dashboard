// -------------------------
// NGROK + Fallback IP
// -------------------------
const NGROK_URL = "https://flatfooted-interventral-jillian.ngrok-free.app"; // Masukkan URL NGROK dari Supabase atau config
const CAM1_FALLBACK = "http://10.170.171.242:5000/cam1";
const CAM2_FALLBACK = "http://10.170.171.242:5000/cam2";

const cam1Element = document.getElementById("cam1");
const cam2Element = document.getElementById("cam2");

// Coba NGROK, jika tak dapat load, fallback ke IP lokal
function updateCameraSrc() {
  fetch(`${NGROK_URL}/cam1`, { method: "HEAD" })
    .then(() => { cam1Element.src = `${NGROK_URL}/cam1`; })
    .catch(() => { cam1Element.src = CAM1_FALLBACK; });

  fetch(`${NGROK_URL}/cam2`, { method: "HEAD" })
    .then(() => { cam2Element.src = `${NGROK_URL}/cam2`; })
    .catch(() => { cam2Element.src = CAM2_FALLBACK; });
}

// Update src setiap 10 saat untuk handle NGROK restart
setInterval(updateCameraSrc, 10000);
updateCameraSrc();

// -------------------------
// Fetch Vehicles Data
// -------------------------
async function fetchVehicles() {
  try {
    const res = await fetch("/api/fetch-all-vehicles");
    const result = await res.json();

    if (!result.success) throw new Error(result.error);

    const data = result.data;

    // Reset semua table
    document.querySelector("#cam1Table tbody").innerHTML = "";
    document.querySelector("#cam2Table tbody").innerHTML = "";

    // Kira jumlah
    document.getElementById("totalVehicles").textContent = data.length;
    document.getElementById("registeredVehicles").textContent =
      data.filter((x) => x.Status === "REGISTERED").length;
    document.getElementById("unregisteredVehicles").textContent =
      data.filter((x) => x.Status === "UNREGISTERED").length;

    // Isi data setiap kamera
    data.forEach((v) => {
      const row = `<tr>
        <td>${v.Time_Detected}</td>
        <td>${v.Plate_Number}</td>
        <td>${v.Name}</td>
        <td>${v.Status}</td>
      </tr>`;

      if (v.Camera === "CAM1") {
        document.querySelector("#cam1Table tbody").insertAdjacentHTML("beforeend", row);
        document.getElementById("cam1Plate").textContent = v.Plate_Number;
      } else if (v.Camera === "CAM2") {
        document.querySelector("#cam2Table tbody").insertAdjacentHTML("beforeend", row);
        document.getElementById("cam2Plate").textContent = v.Plate_Number;
      }

      // Update Latest Detected
      document.getElementById("latestPlate").textContent = v.Plate_Number;
      document.getElementById("latestOwner").textContent = v.Name;
      document.getElementById("latestType").textContent = v.Vehicle_Type;
      document.getElementById("latestStatus").textContent = v.Status;

      // Jika unregistered, paparkan alert
      if (v.Status === "UNREGISTERED") {
        document.getElementById("alertBox").style.display = "block";
        if (v.Camera === "CAM1") document.getElementById("cam1Alert").style.display = "block";
        if (v.Camera === "CAM2") document.getElementById("cam2Alert").style.display = "block";
      } else {
        document.getElementById("alertBox").style.display = "none";
        document.getElementById("cam1Alert").style.display = "none";
        document.getElementById("cam2Alert").style.display = "none";
      }
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

// Auto refresh setiap 3 saat
setInterval(fetchVehicles, 3000);
fetchVehicles();
