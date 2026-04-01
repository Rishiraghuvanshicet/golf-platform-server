import Score from "../models/scoreModel.js";

export const getMyScores = async (req, res) => {
  let data = await Score.findOne({ userId: req.user.id });
  if (!data) {
    data = await Score.create({ userId: req.user.id, scores: [] });
  }

  res.json({
    userId: data.userId,
    scores: [...data.scores].sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
};

export const addScore = async (req, res) => {
  const { score, date } = req.body;

  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 45) {
    return res.status(400).json({ msg: "score must be a number between 1 and 45" });
  }

  if (date === undefined || date === null || String(date).trim() === "") {
    return res.status(400).json({ msg: "date is required for each score (PRD §05)" });
  }

  const scoreDate = new Date(date);
  if (Number.isNaN(scoreDate.getTime())) {
    return res.status(400).json({ msg: "date must be a valid date" });
  }

  let data = await Score.findOne({ userId: req.user.id });

  if (!data) {
    data = new Score({ userId: req.user.id, scores: [] });
  }

  if (data.scores.length >= 5) {
    data.scores.shift(); // remove oldest
  }

  data.scores.push({
    value: numericScore,
    date: scoreDate
  });

  await data.save();

  res.json({
    userId: data.userId,
    scores: [...data.scores].sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
};

export const updateScore = async (req, res) => {
  const { score, date } = req.body;
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 45) {
    return res.status(400).json({ msg: "score must be a number between 1 and 45" });
  }

  if (date === undefined || date === null || String(date).trim() === "") {
    return res.status(400).json({ msg: "date is required for each score (PRD §05)" });
  }

  const scoreDate = new Date(date);
  if (Number.isNaN(scoreDate.getTime())) {
    return res.status(400).json({ msg: "date must be a valid date" });
  }

  const data = await Score.findOne({ userId: req.user.id });
  if (!data) return res.status(404).json({ msg: "No scores found" });

  const item = data.scores.id(req.params.scoreId);
  if (!item) return res.status(404).json({ msg: "Score not found" });

  item.value = numericScore;
  item.date = scoreDate;
  await data.save();

  res.json({
    userId: data.userId,
    scores: [...data.scores].sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
};

export const deleteScore = async (req, res) => {
  const data = await Score.findOne({ userId: req.user.id });
  if (!data) return res.status(404).json({ msg: "No scores found" });

  const item = data.scores.id(req.params.scoreId);
  if (!item) return res.status(404).json({ msg: "Score not found" });

  item.deleteOne();
  await data.save();

  res.json({
    userId: data.userId,
    scores: [...data.scores].sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
};