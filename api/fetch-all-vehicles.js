import { supabaseServer } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  try {
    // Registered vehicles
    const { data: regData, error: regError } = await supabaseServer
      .from("ENTRIES")
      .select(`Plate_Number, Entry_Date, Exit_Date, Camera, Vehicle_Type, Name`)
      .order("Entry_Date", { ascending: false })
      .limit(20);

    if (regError) throw regError;

    // Map registered to standard format
    const registered = regData.map(v => ({
      Plate_Number: v.Plate_Number,
      Time_Detected: v.Exit_Date || v.Entry_Date,
      Camera: v.Camera || "CAM1",
      Status: "REGISTERED",
      Vehicle_Type: v.Vehicle_Type || null,
      Name: v.Name || null,
      Image_Url: null // registered tak ada image
    }));

    // Unregistered vehicles
    const { data: unregData, error: unregError } = await supabaseServer
      .from("UNREGISTERED LOGS")
      .select("*")
      .order("Time_Detected", { ascending: false })
      .limit(20);

    if (unregError) throw unregError;

    const unregistered = unregData.map(v => ({
      Plate_Number: v.Plate_Number,
      Time_Detected: v.Time_Detected,
      Camera: v.Camera || "CAM1", // pastikan ada Camera field
      Status: "UNREGISTERED",
      Vehicle_Type: null,
      Name: null,
      Image_Url: v.Image_Url
    }));

    // Gabung dan sort by latest
    const allVehicles = [...registered, ...unregistered].sort(
      (a,b) => new Date(b.Time_Detected) - new Date(a.Time_Detected)
    );

    res.status(200).json(allVehicles);

  } catch(err) {
    console.error("Fetch all vehicles error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
