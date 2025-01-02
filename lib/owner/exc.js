export default {
    name:"exc",
    description: "Owner Debug",
    cmd: ["~","$"],
    withoutPrefix:true,
    run: async ({m,sock}) => {
        if(!m.senderIsOwner) return;
        if(!m.body.arg) return;
    }
}