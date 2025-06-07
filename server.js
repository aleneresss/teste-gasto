const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve index.html, script.js, etc

// Pasta onde os arquivos .json vão ficar
const dataDir = path.join(__dirname, 'dados');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Rota para carregar dados de um usuário
app.get('/dados/:usuario', (req, res) => {
  const arquivo = path.join(dataDir, `${req.params.usuario}.json`);
  if (!fs.existsSync(arquivo)) return res.json([]);
  const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  res.json(dados);
});

// Rota para salvar dados de um usuário
app.post('/dados/:usuario', (req, res) => {
  const arquivo = path.join(dataDir, `${req.params.usuario}.json`);
  fs.writeFileSync(arquivo, JSON.stringify(req.body, null, 2));
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
