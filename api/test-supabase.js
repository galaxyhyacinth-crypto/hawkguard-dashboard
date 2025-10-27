import { supabase } from "./supabase.js";

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from("users").select("email").limit(1);
    if (error) throw error;
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
