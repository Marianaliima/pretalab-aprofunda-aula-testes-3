import express from 'express';
import { userRoutes } from '../../app/controllers/routes/user.routes';
import { postRoutes } from '../../app/controllers/routes/post.routes';

import { connectMongo } from '../database/mongooseConnection';

const app = express();
app.use(express.json()); 

app.use('/users', userRoutes); 
app.use('/posts', postRoutes);


const URI = process.env.MONGO_URL;

if(!URI){
    throw new Error(' a variavel não está definida')
}

connectMongo(URI)

export default app;
