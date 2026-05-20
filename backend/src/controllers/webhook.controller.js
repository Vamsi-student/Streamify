import User from "../models/user.js";
import { sendPushNotification } from "../lib/pushHelper.js";

export async function handleStreamWebhook(req, res) {
  const secret = req.query.secret;
  if (!secret || secret !== process.env.STREAM_WEBHOOK_SECRET) {
    return res.status(401).json({ message: "Invalid secret" });
  }

  const event = req.body;
  if (!event || event.type !== "message.new") {
    return res.status(200).end();
  }

  const senderId = event.user?.id;
  const cid = event.cid || "";
  const channelId = cid.replace("messaging:", "");
  const messageText = event.message?.text || "";
  const senderName = event.user?.name || "Someone";
  const senderPic = event.user?.image || "";

  if (!senderId || !channelId) {
    return res.status(200).end();
  }

  const members = channelId.split("-");
  const recipientId = members.find((id) => id !== senderId);
  if (!recipientId) {
    return res.status(200).end();
  }

  const recipient = await User.findById(recipientId).select("_id");
  if (!recipient) {
    return res.status(200).end();
  }

  sendPushNotification({
    recipientId: recipient._id.toString(),
    title: senderName,
    body: messageText || "Sent a message",
    icon: senderPic,
    data: { senderId, recipientId: recipient._id.toString() },
  }).catch((err) => console.error("Webhook push error:", err));

  res.status(200).end();
}
