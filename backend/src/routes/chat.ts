import express from "express";
import * as llmService from "../services/llm";

const router = express.Router();

//@ts-ignore
router.post("/:containerId/messages", async (req, res) => {
  const { containerId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  try {
    const { userMessage, assistantMessage } = await llmService.sendMessage(
      containerId,
      message
    );

    res.json({
      success: true,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:containerId/messages", async (req, res) => {
  const { containerId } = req.params;

  try {
    const session = llmService.getOrCreateChatSession(containerId);

    res.json({
      success: true,
      messages: session.messages,
      sessionId: session.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
