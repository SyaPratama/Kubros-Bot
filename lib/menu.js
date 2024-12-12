import { menuByLabel } from "../helper/command.js";
import { timer } from "../helper/timer.js";

export default {
    name : "menu",
    description : "Menu Bot Kus BOT",
    cmd : ['help', 'menu'],
    run : async({ m, sock }) => {
        console.log(menuByLabel);
        let text = '';
        let label = 'All Menu';
        text += `*\`Hai ${m.db?.user?.name || "Orang"}\`*\nSelamat ${timer()} \n\n`
        text += String.fromCharCode(8206).repeat(4001)
        if(m.body.arg) {
            let filterMenu = menuByLabel.get(m.body.arg)
            if(!filterMenu) return
            label = m.body.arg.toUpperCase()
            text += `\`❖ ${m.body.arg.toUpperCase()}\`\n`
            filterMenu.forEach((v) => {
                text += `▷  ${m.body.prefix + v.cmd[0]} ${v?.example ? '_' + v.example + '_' : ''}\n`
            })
        } else {
            menuByLabel.forEach((val, key) => {
                text += `\`❖ ${key.toUpperCase()}\`\n`
                val.forEach((v) => {
                    text += `▷  ${m.body.prefix + v.cmd[0]} ${v?.example ? '_' + v.example + '_' : ''}\n`
                })
                text += `\n`
            })
        }
        text += `\n`
        text += `🤣 author: Rasya\n`

        await m._sendMessage(m.chat, {
            text,
            contextInfo: {
                externalAdReply: {
                    title: 'KUS BOT',
                    body: `- ${label} -`,
                    mediaType: 2,
                    thumbnail: m.db.bot.icon,
                    sourceUrl: 'https://meaca-dev.vercel.app',
                }
            }
        }, { quoted: m });
    }
}