import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import rootRoute from "./routes/rootRoute";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

rootRoute(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
