import app from './infra/server/server';
import { config } from './config/environment';

const PORT = config.port
app.listen(PORT, () => {
  console.log(`Servidor rodando ${PORT}`);
});
