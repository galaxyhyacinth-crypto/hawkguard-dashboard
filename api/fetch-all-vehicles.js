import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { data: entries } = await supabase.from("ENTRIES").select("*");
    const { data: unreg } = await supabase.from("UNREGISTERED LOGS").select("*");
    const { data: vehicles } = await supabase.from("VEHICLES").select("*");

    const combined = [
      ...entries.map(e => {
        const v = vehicles.find(v => v.Plate_Number === e.Plate_Number);
        return {
          Plate_Number: e.Plate_Number,
          Name: v?.Name || "-",
          Vehicle_Type: v?.Vehicle_Type || "-",
          Status: v?.Status || "REGISTERED",
          Camera: e.Camera || "CAM1",
          Time_Detected: e.Entry_Date,
          Image_Url: "-"
        };
      }),
      ...unreg.map(u => ({
        Plate_Number: u.Plate_Number,
        Name: "-",
        Vehicle_Type: "-",
        Status: "UNREGISTERED",
        Camera: u.Camera || "CAM1",
        Time_Detected: u.Time_Detected,
        Image_Url: u.Image_Url
      }))
    ];

    res.status(200).json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
