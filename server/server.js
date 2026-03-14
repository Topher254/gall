import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:8080" })); // Frontend origin
app.use(express.json());

// Simple route
app.post("/api/response", (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message missing" });
    res.json({ reply: `Server received: ${message}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Another route
app.post("/api/expectations", (req, res) => {
  try {
    const { expectation } = req.body;
    if (!expectation) return res.status(400).json({ error: "Expectation missing" });
    res.json({ status: "ok", expectation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));