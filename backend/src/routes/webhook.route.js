import express from "express";
import { handleStreamWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/stream", handleStreamWebhook);

export default router;
