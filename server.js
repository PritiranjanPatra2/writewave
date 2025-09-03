import express from "express";
import "dotenv/config";
import connectDb from "./db/db.js";

import cors from "cors";
import authRoute from "./routes/authRoute.js";


const app = express();
const port = process.env.PORT || 5173;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => {
  res.send("Server is running");
});
await connectDb();
app.use('/api/auth',authRoute);
// app.use('/api/admin',adminRouter);
// app.use('/api/jobs',jobRouter)
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
