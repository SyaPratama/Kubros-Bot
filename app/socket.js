import { makeWASocket,DisconnectReason,useMultiFileAuthState,makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import pino from "pino";
import path from "path";
import { STORAGE_SESSION,SESSION_NAME } from "../config.js";
import { Log } from "../helper/logger.js";
import event from "./event/index.js";
import readline from "readline";



export const startSocket = async () => 
    {
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    const usePairingCode = process.argv.includes('--use-pairing-code');
    const question = (text) => { return new Promise(resolve => {rl.question(text,resolve)})};
    let retryCount = 0;
    const msgRetryCounterCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(STORAGE_SESSION,SESSION_NAME));
    const sock = makeWASocket({
        printQRInTerminal: usePairingCode,
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

    if(!usePairingCode && !sock.authState.creds.registered)
    {
        const phoneNumber = await question("Masukan Nomor Hp Mu:\n");
        console.log(phoneNumber);
        const code = await sock.requestPairingCode(phoneNumber);
        Log.info(`Pairing Code : ${code}`);
    }

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