const express = require('express');
const mongoose = require('mongoose');
const config = require('config')
const users = require('./routes/users');
const auth = require('./routes/auth');
const companies = require('./routes/companies');
const properties = require('./routes/properties');
const funds = require('./routes/funds');
const transactions = require('./routes/bnplTransactions');
const app = express()

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect('mongodb://127.0.0.1/bprojectdb')
.then(() => console.debug('Connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...'))

app.use(express.json());
app.use('/api/bproject/users', users);
app.use('/api/bproject/login', auth);
app.use('/api/bproject/companies', companies);
app.use('/api/bproject/properties', properties);
app.use('/api/bproject/fund', funds);
app.use('/api/bproject/transactions', transactions);

const port = process.loadEnvFile.PORT || 4000

app.listen(port, () => console.debug(`Listening on port ${port}...`))