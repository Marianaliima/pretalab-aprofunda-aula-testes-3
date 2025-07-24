import express from 'express';
import { userRoutes } from '../../app/controllers/routes/user.routes';
import { postRoutes } from '../../app/controllers/routes/post.routes';
import { config } from '../../config/environment';

import { connectMongo } from '../database/mongooseConnection';

const app = express();
app.use(express.json()); 

app.use('/users', userRoutes); 
app.use('/posts', postRoutes);

const PORT = config.port

const URI =  config.mongoUrl

if(!URI){
    throw new Error(' a variavel não está definida')
}

connectMongo(URI)

app.listen(PORT, () => {
  console.log(`Servidor rodando ${PORT}`);
});


export default app;
