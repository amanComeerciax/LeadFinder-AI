import express from 'express';
import cors from 'cors';
import businessRoutes from './routes/business.routes.js';
import postalCodeRoutes from './routes/postalCode.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/business', businessRoutes);
app.use('/api/postal-codes', postalCodeRoutes);

app.use(errorHandler);

export default app;
