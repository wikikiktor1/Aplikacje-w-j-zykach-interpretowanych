require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

app.use(express.json());
app.use(cors());
app.use(express.text({ type: 'text/csv' }));

const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zad3';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.warn('MongoDB connection error', err));

const router = require('./routes/routes');
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
