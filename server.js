import express from 'express';
import cors from 'cors';
import {connectDB} from './config/db.js';
import itemRouter from './routes/itemRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

//app config
const app = express();  
const port = 4000

//middleware
app.use(express.json());
app.use(cors());

// DB config
connectDB();
//api endpoints
app.use("/api/item",itemRouter);
app.use("/images",express.static("/mnt/data/uploads/"));
app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);

app.get("/", (req, res) => 
    res.status(200).send("Api working"));
app.listen(port, () => console.log(`Listening on localhost:${port}`));

