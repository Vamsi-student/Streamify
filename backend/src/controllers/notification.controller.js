import PushSubscription from "../models/PushSubscription.js";

export async function subscribe(req, res) {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }

    const existing = await PushSubscription.findOne({ user: req.user._id, endpoint });
    if (existing) {
      return res.status(200).json({ message: "Already subscribed" });
    }

    await PushSubscription.create({
      user: req.user._id,
      endpoint,
      keys,
    });

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error in subscribe:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;

    if (endpoint) {
      await PushSubscription.findOneAndDelete({ user: req.user._id, endpoint });
    } else {
      await PushSubscription.deleteMany({ user: req.user._id });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Error in unsubscribe:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


