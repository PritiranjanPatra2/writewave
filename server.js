import express from "express";
import "dotenv/config";
import connectDb from "./db/db.js";

import cors from "cors";
import authRoute from "./routes/authRoute.js";
import postRoute from "./routes/postRoute.js";

const app = express();
const port = process.env.PORT || 5173;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => {
  res.send("Server is running");
});

await connectDb();




// 🛠️ One-time migration: Fix posts where likes is stored as int


app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
