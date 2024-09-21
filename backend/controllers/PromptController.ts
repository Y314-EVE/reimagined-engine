import axios from "axios";
import { Request, Response } from "express";

class PromptController {
  // Generate single prompt
  static generate = async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3.1",
        prompt: prompt,
        stream: false,
      });

      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to generate response" });
    }
  };

  // Chat completion
  static chat = async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const response = await axios.post("http://localhost:11434/api/chat", {
        model: "llama3.1",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to generate response" });
    }
  };
}

export default PromptController;
