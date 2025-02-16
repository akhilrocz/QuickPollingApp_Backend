require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

const pollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
});

const Poll = mongoose.model("Poll", pollSchema);

app.post("/polls", async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = new Poll({
      question,
      options: options.map((option) => ({ text: option, votes: 0 })),
    });
    await poll.save();
    res.json(express.response);
  } catch (error) {
    console.log("Error creating poll:", error);
    res.status(500).send("Error creating poll");
  }
});

app.get("/polls", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    console.log("Error fetching poll:", error);
    res.status(500).send("Error fetching poll");
  }
});

app.post("/polls/:id/vote", async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).send("Poll not found");
    }
    poll.options[optionIndex].votes++;
    await poll.save();
    res.json(poll);
  } catch (error) {
    console.log("Error voting:", error);
    res.status(500).send("Error voting");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
