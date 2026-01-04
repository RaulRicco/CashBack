import express from 'express';

const app = express();
const PORT = 3003;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', test: true });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
