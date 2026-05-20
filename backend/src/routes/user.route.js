import express from 'express';
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getOutgoingFriendReqs, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticateToken);
router.use(generalLimiter);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/:id", getUserById);

router.post("/friend-request/:id", sendFriendRequest);

router.put("/friend-request/:id/accept", acceptFriendRequest);

router.put("/friend-request/:id/reject", rejectFriendRequest);

export default router;