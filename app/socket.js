import { makeWASocket,DisconnectReason,useMultiFileAuthState,makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import pino from "pino";
import path from "path";
import { STORAGE_SESSION,SESSION_NAME } from "../config.js";
import { Log } from "../helper/logger.js";

export const startSocket = async () => 
{
    let retry = 0;
    const msgRetryCounterCache = new NodeCache();
    const { state, saveCreds} = await useMultiFileAuthState(path.join(STORAGE_SESSION,SESSION_NAME));
    const sock = makeWASocket({
        printQRInTerminal:true,
        auth:{
            creds:state.creds,
            keys:makeCacheableSignalKeyStore(state.keys, pino().child({
                level: "silent",
                stream: "store"
            })),
        },
        logger: pino({level: "silent"}),
        browser: ["Kus", "Safari", "3.0"],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage 
                || message.templateMessage
                || message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    try{
        sock.ev.on("connection.update", (update) => {
            const { connection,lastDisconnect } = update;
            if(connection === "connection")
            {
                Log.debug(`Session : Connecting`);
            }

            if(connection === "close")
            {
                const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
                sock.connected = false;
                let retryAttempt = retryCount;
            }        
        })
    }catch(e)
    {

    }
}
startSocket();