import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder,verifyOrder,userOrders,getOrders,updateStatus,getAddress } from "../controllers/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/placeorder", authMiddleware, placeOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/user-orders",authMiddleware,userOrders)
orderRouter.get("/list-orders",getOrders)
orderRouter.post("/update-status",updateStatus)
orderRouter.get("/get-address",authMiddleware,getAddress)


export default orderRouter;