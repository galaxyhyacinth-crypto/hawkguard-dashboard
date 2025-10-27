// /api/register.js
import { supabase } from "./supabase.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { full_name, email, password } = req.body || {};

    if (!full_name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    console.log("🟢 Register request received:", { full_name, email });

    // ✅ Check environment
    console.log("🔍 ENV CHECK:", {
      SUPABASE_URL: process.env.SUPABASE_URL,
      KEY_STATUS: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing",
    });

    // ✅ Check if email already exists
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("❌ Supabase SELECT error:", selectError);
      throw selectError;
    }

    if (existingUser)
      return res.status(400).json({ error: "User already registered" });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert new user
    const { error: insertError } = await supabase.from("users").insert([
      {
        full_name,
        email,
        password: hashedPassword,
        created_at: new Date(),
      },
    ]);

    if (insertError) {
      console.error("❌ Supabase INSERT error:", insertError);
      throw insertError;
    }

    console.log("✅ User registered successfully:", email);
    return res.status(200).json({ ok: true, message: "Registered successfully" });
  } catch (err) {
    console.error("🔥 Server error:", err);
    // ✅ Force JSON response so frontend won’t break
    return res.status(500).json({ error: "Server failed to process request" });
  }
}
