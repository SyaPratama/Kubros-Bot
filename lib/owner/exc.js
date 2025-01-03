import { exec } from "child_process";

import util from "util";



export default {

    name:"exc",

    description: "Owner Debug",

    cmd: ["~","$"],

    withoutPrefix:true,

    run: async ({m,sock}) => {

        if(!m.senderIsOwner) return;

        if(!m.body.arg) return;



        if (m.body.full.startsWith('~')) {

            try {

                const result = await eval(`(async() => { ${m.body.full.slice(2)} })()`);

                m._reply(util.format(result));

            } catch (e) {

                m._reply(util.format(e))

            }

        }



        if (m.body.full.startsWith('$')) {

            let {

                key

            } = await m._sendMessage(

                m.chat, {

                    text: "executed...",

                }, {

                    quoted: m,

                },

            );

            exec(m.body.full.slice(2), async (err, stdout) => {

                if (err)

                    return await m._sendMessage(m.chat, {

                        text: util.format(err),

                        edit: key,

                    });

                if (stdout)

                    return await m._sendMessage(m.chat, {

                        text: stdout,

                        edit: key,

                    });

            });

        }

        

    }

}
