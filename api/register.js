import { supabaseServer } from "../lib/supabaseServer.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Method not allowed" });

  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    // Check user
    const { data: existingUser, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError && userError.code !== "PGRST116") throw userError;
    if (existingUser) return res.status(409).json({ error: "User already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: insertError } = await supabaseServer
      .from("users")
      .insert([{ full_name, email, password: hashedPassword }]);

    if (insertError) throw insertError;

    res.status(200).json({ ok: true, message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
