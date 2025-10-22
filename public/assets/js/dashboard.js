document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase;

  const registeredCountEl = document.getElementById('registered-count');
  const unregisteredCountEl = document.getElementById('unregistered-count');
  const regFeed = document.getElementById('registered-feed');
  const unregFeed = document.getElementById('unregistered-feed');
  const logoutBtn = document.getElementById('logout-btn');
  const fullnameEl = document.getElementById('user-fullname');

  const BASE_URL = ""; // ✅ empty string → automatically uses same origin


  // --- Logout button ---
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    });
  }

  // --- Initial load of data ---
  async function initial() {
    try {
      // Registered entries (ENTRIES table)
      const { data: entries, error: e1 } = await supabase
        .from('ENTRIES')
        .select('*')
        .order('Entry_Date', { ascending: false })
        .limit(50);

      if (e1) console.error('ENTRIES fetch error:', e1);
      renderFeed(entries || [], regFeed);

      // Unregistered logs
      const { data: unregs, error: e2 } = await supabase
        .from('UNREGISTERED LOGS')
        .select('*')
        .order('Time_Detected', { ascending: false })
        .limit(50);

      if (e2) console.error('UNREGISTERED fetch error:', e2);
      renderFeed(unregs || [], unregFeed);

      registeredCountEl.textContent = (entries || []).length;
      unregisteredCountEl.textContent = (unregs || []).length;
    } catch (err) {
      console.error('Initial load error:', err);
    }
  }

  // --- Render feed items (Registered / Unregistered) ---
  function renderFeed(rows, container) {
    container.innerHTML = '';
    for (const r of rows) {
      const div = document.createElement('div');
      div.className = 'feed-item';
      const imgHtml = r.Image_Url
        ? `<img src="${r.Image_Url}" alt="plate" class="feed-img">`
        : '';
      const time =
        r.Entry_Date ||
        r.Exit_Date ||
        r.Time_Detected ||
        new Date().toLocaleString();
      div.innerHTML = `
        <div class="feed-meta">
          <strong>${r.Plate_Number || 'Unknown'}</strong>
          <div class="feed-time">${time}</div>
        </div>
        ${imgHtml}
      `;
      container.appendChild(div);
    }
  }

  await initial();

  // --- Real-time Subscription for ENTRIES ---
  try {
    supabase
      .channel('public:ENTRIES')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ENTRIES' },
        (payload) => {
          const row = payload.new;
          addToFeed(row, regFeed);
          registeredCountEl.textContent =
            parseInt(registeredCountEl.textContent) + 1;
        }
      )
      .subscribe();
  } catch (err) {
    console.error('Realtime ENTRIES error:', err);
  }

  // --- Real-time Subscription for UNREGISTERED LOGS ---
  try {
    supabase
      .channel('public:UNREGISTERED LOGS')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'UNREGISTERED LOGS' },
        (payload) => {
          const row = payload.new;
          addToFeed(row, unregFeed);
          unregisteredCountEl.textContent =
            parseInt(unregisteredCountEl.textContent) + 1;
        }
      )
      .subscribe();
  } catch (err) {
    console.error('Realtime UNREGISTERED error:', err);
  }

  // --- Helper: Add new item to feed top ---
  function addToFeed(row, container) {
    const div = document.createElement('div');
    div.className = 'feed-item new';
    const imgHtml = row.Image_Url
      ? `<img src="${row.Image_Url}" alt="plate" class="feed-img">`
      : '';
    const time =
      row.Entry_Date || row.Time_Detected || new Date().toLocaleString();
    div.innerHTML = `
      <div class="feed-meta">
        <strong>${row.Plate_Number || 'Unknown'}</strong>
        <div class="feed-time">${time}</div>
      </div>
      ${imgHtml}
    `;
    container.prepend(div);
    setTimeout(() => div.classList.remove('new'), 2000);
  }

  // --- Optional: Display admin fullname ---
  const userFullname = localStorage.getItem('fullname');
  if (fullnameEl && userFullname) {
    fullnameEl.textContent = userFullname;
  }
});
