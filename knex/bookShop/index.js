const express = require('express');
const authorRoute = require('./src/Routes/authorRoute.js');
const bookRoute = require('./src/Routes/bookRoute.js');
const publisherRoute = require('./src/Routes/publisherRoute.js');
const reserveRoute = require('./src/Routes/reserveRoute.js');


const app = express();
const port = 3000;

app.use(express.json());
app.get('/', (req, res) => {
    return res.json({ message: "welcome" });
});

app.use('/book', bookRoute);
app.use('/author', authorRoute);
app.use('/publisher', publisherRoute);
app.use('/reserve', reserveRoute);

app.use('*', (req, res) => {
    return res.json({ message: "page not found" });
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
