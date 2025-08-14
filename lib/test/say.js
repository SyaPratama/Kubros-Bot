export default {
  name: "Group",
  description: "tag",
  cmd: ["tag"],
  menu: {
    label: "tag",
    example: "",
  },
  withoutPrefix: true,
  run: async ({ m, sock }) => {
    console.log(m.isGroup);
    if (!m.isGroup) return;
    if (!m.body.arg) return;
    const Mention = [];
    const participant = m.isGroup.groupMetadata.participants;
    participant.forEach((val) => {
      Mention.push(val.id);
    });
    m._sendMessage(m.chat, { text: m.body.arg, mentions: Mention });
  },
};
