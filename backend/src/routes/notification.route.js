import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { subscribe, unsubscribe } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

export default router;
