import { proto,downloadContentFromMessage,getContentType,extractMessageContent,jidNormalizedUser,delay } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
// let M = proto.WebMessageInfo;

export const serialize = (sock,m) => {
    if(!m) return m;
    if(m.key)
    {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith("@g.us");
        m.botNumber = m.chat.endsWith(sock.user?.id);
        m.sender = jidNormalizedUser(m.fromMe ? sock.user.id : m.participant ? m.participant : m.key.participant ? m.key.participant : m.chat);
    }
    if(m.message)
    {
        m.message = extractMessageContent(m.message);
        m.mtype = getContentType(m.message);
    }
}