import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
    initiateCheckout,
    handleWebhook,
    userOrders,
    getOrders,
    updateStatus,
    getAddress 
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/initiate-checkout", authMiddleware, initiateCheckout);
orderRouter.post("/webhook", express.raw({type: 'application/json'}), handleWebhook);
orderRouter.get("/user-orders", authMiddleware, userOrders);
orderRouter.get("/list-orders", getOrders);
orderRouter.post("/update-status", updateStatus);
orderRouter.get("/get-address", authMiddleware, getAddress);

export default orderRouter;
