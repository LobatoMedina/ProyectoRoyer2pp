import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './Routes';
import { errorHandler, notFoundHandler } from './Middlewares/ErrorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Bolsa de Trabajo activa y lista.' });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
}

export { app };
export default app;
