import {    STORAGE_DATABASE,DATABASE_SCHEMA } from "../config.js";
import axios from "axios";
import path from "path";
import { open } from "lmdb";
import { Log } from "./logger.js";

class Database
{
    constructor()
    {
        this.user = null;
        this.group = null;
        this.bot = null;
    }

    async init()
    {
        try
        {
            this.user = open({
                path: path.join(STORAGE_DATABASE,'user'),
            })

            this.group = open({
                path: path.join(STORAGE_DATABASE,'group'),
            })

            this.bot = open({
                path: path.join(STORAGE_DATABASE,'Kus'),
            })

            if(!this.bot.get('settings'))
            {
                const icon = await axios.get(`https://i.pinimg.com/736x/27/83/7a/27837a04123be58038c13e234175474e.jpg`,{responseType:"arraybuffer"}).then(res => res.data);
                await this.bot.put('settings', { ...DATABASE_SCHEMA.bot,...{ icon } });
            }
            Log.info(`Success Init Database`);
        }
        catch(e)
        {
            Log.error(`Gagal Init Database = ${e}`);
            throw e;
        }
    }

    async update(db,key,value)
    {
        try{
            await db.put(key,{
                ...db.get(key),
                ...value,
            });
        }catch(e)
        {
            Log.error(`Error Updating Database : ${e}`);
            throw e;
        }
    }

    async close()
    {
        try{
            if(this.user) await this.user.close();
            if(this.group) await this.group.close();
            if(this.bot) await this.bot.close();
            Log.info('Closed Databases Success');
        }catch(e)
        {
            Log.info(`Close Database Error : ${e}`);
            throw e;
        }
    }
}

export const DB = new Database();