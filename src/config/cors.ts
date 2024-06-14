import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    // Permitir todas las solicitudes si se pasa el argumento '--api'
    if (process.argv.includes('--api')) {
      callback(null, true);
      return;
    }

    // Permitir todas las solicitudes desde cualquier origen
    callback(null, true);
  }
};