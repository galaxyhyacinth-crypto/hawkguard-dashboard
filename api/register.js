import { supabaseServer } from "../lib/supabaseServer.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError; // ignore "no rows"

    if (existingUser) {
      return res.status(409).json({ error: "User already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabaseServer
      .from("users")
      .insert([{ full_name, email, password: hashedPassword }]);

    if (error) throw error;

    console.log("User registered:", data);

    res.status(200).json({ ok: true, message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err.message || err);
    res.status(500).json({ error: "Server error registering user" });
  }
}
