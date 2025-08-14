import { fileURLToPath } from "url";
import { dirname } from "path";
import { moment } from "./helper/moment.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SESSION_NAME = "Kus";
export const STORAGE_PATH = `${__dirname}/storage`;
export const STORAGE_SESSION =  `${__dirname}/storage/session`;
export const STORAGE_DATABASE = `${__dirname}/storage/databases`;
export const DATABASE_SCHEMA = {
    bot: {
        mode: 'public',
        lang: 'id',
        prefix: ["-","."],
        owners:{
            '6285591386135': "Rasya",

        },
        exif: {
            pack: 'Kubros BOT',
            author: 'Kubros BOT'
        },
        created_at: moment(),
        updated_at: moment(),
    },
    user : {
        plan: 'free',
        plan_expire: false,
        limit: 50,
        blacklist: false,
        blacklist_reason: '',
        created_at: moment(),
        updated_at: moment()
    },
    group: {
        mode: 'all',
        antilink: false,
        welcome: false,
        welcome_message: null,
        created_at: moment(),
        updated_at: moment(),
    },

};