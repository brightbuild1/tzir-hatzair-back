
const express = require('express');
const cors = require('cors'); 
const googleAuthRoutes = require('./routes/auth');
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
app.use('/api/auth', googleAuthRoutes);

const formRouter = require('./routes/formRoutes');

app.use('/', soldierRouter);
app.use('/api/match', matchRouter);
app.use('/api/forms', formRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
