import { loadCommand } from "./helper/command.js";
import { DB as db } from "./helper/database.js";
import { Log } from "./helper/logger.js";
import { middleware } from "./app/middleware/app.js";
Log.info('Start BOT ...');
db.init();
Log.info(`Loaded ${middleware.size} Middleware`);
loadCommand();
import("./app/socket.js");
