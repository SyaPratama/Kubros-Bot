import { makeWASocket,DisconnectReason,useMultiFileAuthState,makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import pino from "pino";
import path from "path";
import { STORAGE_SESSION,SESSION_NAME } from "../config.js";
import { Log } from "../helper/logger.js";
import event from "./event/index.js";


export const startSocket = async () => 
{
    let retryCount = 0;
    const msgRetryCounterCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(STORAGE_SESSION,SESSION_NAME));
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ 
                level: 'silent', 
                stream: 'store' 
            })),
        },
        logger: pino({ level: "silent" }),
        browser: ['Kus', 'Safari', '3.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    event(sock);

    try {
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection == "connecting") {
                Log.debug(`SESSION : Conecting.`)
            }
            if (connection === "close") {
                const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
                sock.connected = false
                let retryAttempt = retryCount;
                let shouldRetry;
                if (code != DisconnectReason.loggedOut && retryAttempt < 20) {
                    shouldRetry = true;
                }
                if (shouldRetry) {
                    retryAttempt++;
                }
                if (shouldRetry) {
                    retryCount = retryAttempt
                    startSocket();
                } else {
                    Log.error(`SESSION : Disconnected.`)
                    retryCount = 0
                    sock?.logout()
                }
            }
            if (connection == "open") {
                Log.info(`SESSION : Connected.`)
                sock.connected = true
                retryCount = 0
            }
        })
        sock.ev.on("creds.update", async () => {
            await saveCreds();
        })
    } catch (e) {
        Log.error("SOCKET : " + e)
    }
}