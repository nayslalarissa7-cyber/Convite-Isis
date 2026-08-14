require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

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
