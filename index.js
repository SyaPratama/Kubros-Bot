import { startSocket } from "./app/socket.js";

try{
    startSocket()
}catch(error)
{
    console.info(error);
}