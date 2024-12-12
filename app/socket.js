import { STORAGE_MEMORY } from "../config.js";

(async () => {
  const {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    PHONENUMBER_MCC,
    makeInMemoryStore
  } = await import("@whiskeysockets/baileys");
  const NodeCache = await import("node-cache");
  const pino = await import("pino");
  const path = await import("path");
  const { STORAGE_SESSION, SESSION_NAME } = await import("../config.js");
  const { Log } = await import("../helper/logger.js");
  const event = await import("./event/index.js");
  const readline = await import("readline");

  const store = makeInMemoryStore({ Log });
  store?.readFromFile(path.join(STORAGE_MEMORY,'/kus_store_multi.json'));
  setInterval(() => {
    store?.writeToFile(path.join(STORAGE_MEMORY,'/kus_store_multi.json'));
  },10_000)

  const startSocket = async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const usePairingCode = process.argv.includes("--pairing-code");
    const question = (text) => {
      return new Promise((resolve) => {
        rl.question(text, resolve);
      });
    };
    let retryCount = 0;
    const msgRetryCounterCache = new NodeCache.default();
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(STORAGE_SESSION, SESSION_NAME)
    );
    const sock = makeWASocket({
      printQRInTerminal: !usePairingCode,
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
      browser: ["Chrome (Linux)", "", ""],
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
    });

    store?.bind(sock.ev);
    if (usePairingCode && !sock.authState.creds.registered) {
      let phoneNumber = await question(
        "Masukan Nomor Hp Mu Contoh +628124534434 : \n"
      );
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      if (
        !Object.keys(PHONENUMBER_MCC).some((value) =>
          phoneNumber.startsWith(value)
        )
      ) {
        Log.info(
          "Nomor Whatsapp Dimulai Dengan Code Negara, Contoh : +628124534434"
        );
        phoneNumber = await question(
          "Masukan Nomor Hp Mu Contoh +628124534434 : \n"
        );
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        rl.close();
      }

      setTimeout(async () => {
        let code = await sock.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        Log.info(`Your Pairing Code: ${code}`);
      }, 3000);
    }

    await event.default(sock);

    try {
      sock.ev.on("connection.update", (update) => {
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
