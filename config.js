import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SESSION_NAME = "Kus";
export const STORAGE_PATH = `${__dirname}/storage`;
export const STORAGE_SESSION =  `${__dirname}/storage/session`;
export const STORAGE_DATABASE = `${__dirname}/storage/databases`;