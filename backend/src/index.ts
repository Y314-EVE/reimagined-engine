import express, { Request, Response } from "express";
import axios from "axios";
import { string } from "@tensorflow/tfjs";

interface LlamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post("/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.1", // Specify the model you want to use
      prompt: prompt,
    });

    const data = response.data;
    const output: LlamaResponse[] = [];

    data.split("\n").map((item: string, index: number) => {
      if (index < data.split("\n").length - 1) {
        output[index] = JSON.parse(item);
      }
    });

    // // debug
    // output.map((item) => {
    //   if (!item.done) {
    //     console.log(item.response);
    //   }
    // });

    return res.json({ responses: output });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
