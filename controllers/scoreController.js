import Score from "../models/Score.js";

export const addScore = async (req, res) => {
  const { score } = req.body;

  let data = await Score.findOne({ userId: req.user.id });

  if (!data) {
    data = new Score({ userId: req.user.id, scores: [] });
  }

  if (data.scores.length >= 5) {
    data.scores.shift(); // remove oldest
  }

  data.scores.push({
    value: score,
    date: new Date()
  });

  await data.save();

  res.json(data);
};