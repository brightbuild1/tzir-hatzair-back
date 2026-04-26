
const express = require('express');
const cors = require('cors'); 
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

const { apiKeyAuth } = require('./middleware/auth');

const app = express();

app.use(cors());


app.use(express.json());
app.use(apiKeyAuth);

const PORT = process.env.PORT || 3000;

const soldierRouter = require('./controller');
const matchRouter = require('./routes/matchRoutes');

app.use('/', soldierRouter);
app.use('/api/match', matchRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
