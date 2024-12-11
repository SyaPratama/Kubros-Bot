export default async (sock) => {
    sock.ev.on('messages.upsert', async (update) => 
    {
        try{
            const { messages,type } = update;
            let m = messages[0];
            if(!m.message) return;
            if(!m.key.fromMe && !type === "notify") return;
            if(m.key.id.startsWith("BAE5") && m.key.id.length === 16) return;
            await sock.readMessages([m.key]);
        }
        catch(e)
        {
            console.error(e);
        }
    })
}

const __filter = (msg,m) => {
    let res = msg;

    
}