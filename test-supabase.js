import { supabase } from "./api/supabase.js";

async function test() {
  const { data, error } = await supabase.from("otp_store").select("*").limit(1);
  console.log({ data, error });
}

test();
