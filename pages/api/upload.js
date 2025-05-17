import { supabase } from '../../lib/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    const buffer = Buffer.concat(chunks);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Monate von 0-11
    const year = now.getFullYear();
    const randomId = Math.floor(1000 + Math.random() * 9000); // 4-stellige zufällige Zahl

    const filename = `upload-${randomId}-FileSharing-${day}-${month}-${year}.zip`;


    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: req.headers['content-type'] || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrl } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);

    res.status(200).json({ url: publicUrl.publicUrl });
  });
}