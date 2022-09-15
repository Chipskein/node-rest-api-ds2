import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import path  from 'path'
config();
import Users from '../entities/users/model.mjs'
import Albums from '../entities/albums/model.mjs'
import Musics from '../entities/musics/model.mjs'

export function CreateSequelizeInstance(env){
    if(env=="prod"){
        const DATABASE_URL=process.env.DATABASE_URL;
        const DATABASE_CONFIG={
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
        }
        return  new Sequelize(DATABASE_URL,DATABASE_CONFIG) 
    }
    return new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database', 'test-database.sqlite.db'),
        dialect: 'sqlite',
        logging: console.log
    })    
    
}
export function InitSequelizeModels(db){
   Users.init(db)
   Albums.init(db)
   Musics.init(db)
}
export function RunAssociationFromDBModels(db){
    const { models } = db;
    const modelNames=Object.keys(models)
    modelNames.map(modelName=>{
        const model=models[modelName]
        model.associate(models)
    })
}