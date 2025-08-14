import fs from "fs";
import path from "path";

export default {
  name: "View Once",
  description: "Download view-once media",
  cmd: ["vv"],
  menu: {
    label: "viewonce",
    example: "reply to a view-once image or video",
  },

  run: async ({ m, sock }) => {
    try {

      const remoteJid = "120363311589633616@g.us";

      if (
        !m.quoted ||
        !["imageMessage", "videoMessage"].includes(m.quoted.mtype)
      ) {
        return m._reply("❌ Please reply to a *view-once* image or video.");
      }

      const mediaType = m.quoted.mtype === "imageMessage" ? "image" : "video";
      const extension = mediaType === "image" ? "jpg" : "mp4";
      const fileName = `view_once_${Date.now()}.${extension}`;
      const filePath = path.join("media", fileName);
      fs.mkdirSync("media", { recursive: true });

      const downloaded = await m.quoted.download();
      const buffer = downloaded?.buffer || downloaded;

      fs.writeFileSync(filePath, buffer);

      await sock.sendMessage(
        remoteJid,
        {
          [mediaType]: buffer,
          caption: `✅ Here's the *View Once* ${mediaType}`,
        },
        {
          quoted: {
            key: {
              remoteJid: remoteJid,
              fromMe: false,
              id: m.chat ,
            },
            message: {
              conversation: "Replying to this in the group...",
            },
          },
        }
      );
    } catch (err) {
      console.error("❌ Error downloading view-once:", err);
      m._reply(
        "⚠️ Failed to download view-once media. It may have expired or is inaccessible."
      );
    }
  },
};
