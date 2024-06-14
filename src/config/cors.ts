import express from 'express';
import cors from 'cors';

const app = express();

// Configuración de CORS para permitir todas las solicitudes
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

// Resto de la configuración de tu aplicación Express
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});