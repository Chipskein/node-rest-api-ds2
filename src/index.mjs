import { config } from 'dotenv';
config();
import { CreateAppInstace } from './app.mjs';
import {CreateSequelizeInstance } from './config/sequelize.mjs'
const PORT=process.env.PORT || 3001;  
const database=CreateSequelizeInstance(process.env.env)
const app = CreateAppInstace(database)
app.listen(PORT,() => console.log(`Listing on PORT ${PORT}`))