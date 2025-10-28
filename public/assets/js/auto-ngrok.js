<script type="module">
  import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

  const supabaseUrl = "https://uzlxttvrgqvigmnbklmr.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // anon key
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function loadCameras() {
    const { data, error } = await supabase
      .from("SETTINGS")
      .select("Value")
      .eq("Key", "NGROK_URL")
      .single();

    if (data) {
      const baseUrl = data.Value;
      document.getElementById("cam1").src = `${baseUrl}/cam1`;
      document.getElementById("cam2").src = `${baseUrl}/cam2`;
      console.log("Camera URLs updated:", baseUrl);
    } else {
      console.error("Failed to fetch NGROK_URL", error);
    }
  }

  loadCameras();
</script>
