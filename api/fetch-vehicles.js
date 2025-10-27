import { supabaseServer } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  try {
    const { data, error } = await supabaseServer
      .from("VEHICLES")
      .select("*")
      .order("Plate_Number", { ascending: false }) // guna Plate_Number instead of id
      .limit(20);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Fetch vehicles error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
