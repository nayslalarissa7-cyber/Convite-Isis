require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, credenciais] = cabecalho.split(' ');

  if (tipo === 'Basic' && credenciais) {
    const [usuario, senha] = Buffer.from(credenciais, 'base64').toString().split(':');
    if (usuario === process.env.ADMIN_USER && senha === process.env.ADMIN_PASSWORD) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Confirmados"');
  return res.status(401).send('Acesso negado.');
}

app.get('/admin', autenticar, async (req, res) => {
  const { data, error } = await supabase
    .from('confirmacoes')
    .select('nome, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).send('Erro ao carregar confirmações.');
  }

  const linhas = data.map(c => `
    <tr>
      <td>${c.nome}</td>
      <td>${new Date(c.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmados - Ísis 1 aninho</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff5f7; color: #5c3d4a; padding: 24px; }
        h1 { color: #9a6bb5; }
        .total { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        table { width: 100%; max-width: 500px; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(154,107,181,0.15); }
        th, td { padding: 12px 16px; text-align: left; }
        th { background: #f3e3f7; color: #5c3d4a; }
        tr:nth-child(even) { background: #faf4fc; }
      </style>
    </head>
    <body>
      <h1>Confirmados - Ísis 1 aninho 🦋</h1>
      <div class="total">Total confirmado: ${data.length}</div>
      <table>
        <tr><th>Nome</th><th>Confirmado em</th></tr>
        ${linhas}
      </table>
    </body>
    </html>
  `);
});

app.post('/api/confirmar', async (req, res) => {
  const nome = (req.body.nome || '').trim();

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  const { error } = await supabase
    .from('confirmacoes')
    .insert([{ nome }]);

  if (error) {
    console.error('Erro ao salvar confirmação:', error);
    return res.status(500).json({ erro: 'Não foi possível salvar sua confirmação.' });
  }

  await notificarWhatsApp(nome);

  res.json({ ok: true });
});

async function notificarWhatsApp(nome) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.warn('CallMeBot não configurado — pulando notificação.');
    return;
  }

  const texto = `🎉 Nova confirmação de presença!\nNome: ${nome}`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    await fetch(url);
  } catch (err) {
    console.error('Erro ao notificar WhatsApp:', err);
  }
}

const PORTA = process.env.PORT || process.env.PORTA || 3000;
app.listen(PORTA, () => {
  console.log(`Convite rodando em http://localhost:${PORTA}`);
});
