import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import rootRoute from "./routes/rootRoute";
import dbconnection from "./db/dbconnection";
import { JwtPayload } from "jsonwebtoken";

dotenv.config();
declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload | string;
    }
  }
}
const app = express();
const PORT = process.env.PORT || 5000;
const DBURL = process.env.DBURL || "mongodb:://localhost:27017";

dbconnection(DBURL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

rootRoute(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
