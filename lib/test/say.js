export default {
  name: "Group",
  description: "tag",
  cmd: ["tag"],
  menu: {
    label: "tag",
    example: "",
  },
  run: async ({ m, sock }) => {
    if (m.fromMe) return;
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
