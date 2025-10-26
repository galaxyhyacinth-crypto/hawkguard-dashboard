import { supabase } from "./supabase.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check existing user
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error(selectError);
      return res.status(500).json({ error: "Database error" });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { error: insertError } = await supabase.from("users").insert([
      {
        full_name,
        email,
        password: hashedPassword,
        created_at: new Date(),
      },
    ]);

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: "Insert failed" });
    }

    return res.status(200).json({ ok: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
