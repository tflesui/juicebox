const { PORT = 3000 } = process.env;
const express = require('express');
const app = express();

const apiRouter = require('./api');

// const bodyParser = require('body-parser');
app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

// Middleware
app.use((req, res, next) => {
    console.log('<___Body Logger START___>');
    console.log(req.body);
    console.log('<___Body Logger END___>');

    next();
});

const { client } = require('./db');
client.connect();

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
})