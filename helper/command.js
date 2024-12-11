import path from "path";
import fs from "fs";
import { Log } from "./logger.js";
import { fileURLToPath, pathToFileURL} from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const commandDir = path.join(__dirname,"../lib");
export const commands = new Map();
export const menuByLabel = new Map();

const LoadFile = async (filepath) => {
    try
    {
        if(filepath.endsWith(".js"))
        {
            const URLFile = pathToFileURL(path.resolve(filepath));
            const file = await import(URLFile);
            const name = file.default.name.toLowerCase().replace(/\s/g,"");
            if(!commands.has(name))
            {
                commands.set(name,file);
            } else {
                Log.error(`Duplication Name ${name}`);
            }
        }
        return false;
    }
    catch(e)
    {
        Log.error(e);
    }
}

const exploreFolder = (dir) => {
    fs.readdirSync(dir).forEach(dirOrFile => {
        const dirOrFilePath = path.join(dir,dirOrFile);
        if(fs.statSync(dirOrFilePath).isDirectory())
        {
            exploreFolder(dirOrFilePath);
        } else {
            LoadFile(dirOrFilePath);
        }
    });
}

export const loadCommand = async () => {
    exploreFolder(commandDir)
    commands.forEach(val => 
    {
        let label = val.menu?.label
        if(label)
        {
            if(!menuByLabel.hash(label))
            {
                menuByLabel.set(label,[]);
            }
            menuByLabel.get(label).push({
                cmd: val.cmd,
                example: val.menu.example
            })
        }
    });
    Log.info(`Loaded ${commands.size} Commands`);
}