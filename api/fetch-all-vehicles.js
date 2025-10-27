import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Ambil data dari ENTRIES
    const { data: entriesData, error: entriesError } = await supabase
      .from("ENTRIES")
      .select("Id, Plate_Number, Entry_Date, Exit_Date, Camera");

    if (entriesError) throw entriesError;

    // Ambil data dari UNREGISTERED LOGS
    const { data: unregData, error: unregError } = await supabase
      .from("UNREGISTERED LOGS")
      .select("Plate_Number, Time_Detected, Image_Url, Camera");

    if (unregError) throw unregError;

    // Ambil data VEHICLES (untuk dapatkan Vehicle_Type, Name, Status)
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("VEHICLES")
      .select("Plate_Number, Name, Vehicle_Type, Status");

    if (vehicleError) throw vehicleError;

    // Gabungkan semua data berdasarkan Plate_Number
    const allData = [
      ...entriesData.map((e) => {
        const v = vehicleData.find((x) => x.Plate_Number === e.Plate_Number);
        return {
          Source: "ENTRY",
          Plate_Number: e.Plate_Number,
          Name: v?.Name || "-",
          Vehicle_Type: v?.Vehicle_Type || "-",
          Status: v?.Status || "REGISTERED",
          Camera: e.Camera || "-",
          Time_Detected: e.Entry_Date || "-",
          Image_Url: "-",
        };
      }),
      ...unregData.map((u) => ({
        Source: "UNREGISTERED",
        Plate_Number: u.Plate_Number,
        Name: "-",
        Vehicle_Type: "-",
        Status: "UNREGISTERED",
        Camera: u.Camera || "-",
        Time_Detected: u.Time_Detected,
        Image_Url: u.Image_Url || "-",
      })),
    ];

    res.status(200).json({ success: true, data: allData });
  } catch (err) {
    console.error("Fetch all vehicles error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
