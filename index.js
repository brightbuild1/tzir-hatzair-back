
const express = require('express');

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const soldierRouter = require('./controller');
app.use('/', soldierRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
