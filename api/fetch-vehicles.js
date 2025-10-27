import { supabase } from '../supabase.js';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('VEHICLES')
      .select('*')
      .order('id', { ascending: false })
      .limit(20); // ambil 20 row terbaru

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
