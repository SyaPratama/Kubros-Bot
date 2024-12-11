import onMessage from "./onMessage.js";

export default async (sock) => {
    sock.public = false;
    onMessage(sock);

    sock.ev.on("call",async (callList) => {
        for(const call of callList)
        {
            await sock.rejectCall(call.id,call.from);
        }
    })
}