import PushSubscription from "../models/PushSubscription.js";
import webpush from "./webpush.js";

export async function sendPushNotification({ recipientId, title, body, icon, data }) {
  const subscriptions = await PushSubscription.find({ user: recipientId });
  if (subscriptions.length === 0) return 0;

  const payload = JSON.stringify({
    title: title || "Streamify",
    body: body || "New message",
    icon: icon || undefined,
    data: data || {},
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          payload
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.findByIdAndDelete(sub._id);
        }
      }
    })
  );

  return results.filter((r) => r.status === "fulfilled").length;
}
