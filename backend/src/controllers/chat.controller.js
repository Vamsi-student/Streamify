import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = (req, res) => {
  try {
    const userId = req.user._id;
    const token = generateStreamToken(userId);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
