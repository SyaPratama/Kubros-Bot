import inquirer from "inquirer";
import { Browsers } from "@whiskeysockets/baileys";
import fs from "fs/promises";

(async () => {
  const {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
  } = await import("@whiskeysockets/baileys");
  const NodeCache = await import("node-cache");
  const pino = await import("pino");
  const path = await import("path");
  const { STORAGE_SESSION, SESSION_NAME } = await import("../config.js");
  const { Log } = await import("../helper/logger.js");
  const event = await import("./event/index.js");
  let useCode = {
    isTrue: true,
  };

  const startSocket = async () => {
    let retryCount = 0;
    const msgRetryCounterCache = new NodeCache.default();
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(STORAGE_SESSION, SESSION_NAME)
    );
    const sock = makeWASocket({
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino.default().child({
            level: "silent",
            stream: "store",
          })
        ),
      },
      logger: pino.default({ level: "silent" }),
      browser: Browsers.ubuntu("Chrome"),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
    });
    if (useCode.isTrue && !sock.authState.creds.registered) {
      useCode = await inquirer.prompt([
        {
          type: "confirm",
          name: "isTrue",
          message: "Apakah Anda Ingin Menggunakan Pairing Code?",
          default: true,
        },
      ]);
      if (useCode.isTrue) {
        const numWa = await inquirer.prompt([
          {
            type: "input",
            name: "res",
            message: "Nomor Whatsapp :",
          },
        ]);

        const code = await sock.requestPairingCode(numWa.res);
        console.log(code);
      } else {
        useCode.isTrue = false;
        startSocket();
      }
    }


    await event.default(sock);

    try {
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection == "connecting") {
          Log.debug(`SESSION : Conecting.`);
        }
        if (connection === "close") {
          const code =
            lastDisconnect?.error?.output?.statusCode ||
            lastDisconnect?.error?.output?.payload?.statusCode;
          sock.connected = false;
          let retryAttempt = retryCount;
          let shouldRetry;
          if (code != DisconnectReason.loggedOut && retryAttempt < 20) {
            shouldRetry = true;
          }
          if (shouldRetry) {
            retryAttempt++;
          }
          if (shouldRetry) {
            retryCount = retryAttempt;
            startSocket();
          } else {
            await fs.rm(path.join(STORAGE_SESSION, SESSION_NAME));
            Log.error(`SESSION : Disconnected.`);
            retryCount = 0;
            sock?.logout();
          }
        }
        if (connection == "open") {
          Log.info(`SESSION : Connected.`);
          sock.connected = true;
          retryCount = 0;
        }
      });
      sock.ev.on("creds.update", async () => {
        await saveCreds();
      });
    } catch (e) {
      Log.error("SOCKET : " + e);
    }
  };
  startSocket();
})();
