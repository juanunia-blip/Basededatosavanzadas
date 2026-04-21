const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./db/db');

const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const budgetRoutes = require('./routes/budget');
const savingRoutes = require('./routes/saving');
const reportRoutes = require('./routes/report');

dotenv.config();

const app = express();

db();

app.use(cors());
app.use(express.json());

app.use('/api/v1', transactionRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', budgetRoutes);
app.use('/api/v1', savingRoutes);
app.use('/api/v1', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});