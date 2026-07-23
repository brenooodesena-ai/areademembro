require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Pesquisando os últimos 20 alunos no banco...');
  const { data: students, error: findError } = await supabase
    .from('students')
    .select('id, name, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (findError) {
    console.error('Erro ao pesquisar:', findError.message);
    return;
  }

  console.log('Alunos encontrados:', students);
}
run();
