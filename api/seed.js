require('dotenv').config();
const mongoose = require('mongoose');
const OrderStatus = require('./models/orderStatus');

const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/zad3';

mongoose.connect(mongoUri)
    .then(async () => {
        console.log('Połączono z bazą danych...');

        const statuses = ['PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED'];

        for (const name of statuses) {
            const exists = await OrderStatus.findOne({ name });
            if (!exists) {
                await new OrderStatus({ name }).save();
                console.log(`+ Dodano status: ${name}`);
            } else {
                console.log(`= Status już istnieje: ${name}`);
            }
        }

        console.log('Zakończono! Możesz zamknąć ten proces.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Błąd:', err);
        process.exit(1);
    });