import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('coupons').select('*').eq('code', 'GG');
  if (error) console.error(error);
  else {
    console.log("Raw extra:", data[0]?.extra);
    console.log("Type of extra:", typeof data[0]?.extra);
    if (typeof data[0]?.extra === 'string') {
        console.log("Parsed extra:", JSON.parse(data[0].extra));
    }
  }
}
run();
