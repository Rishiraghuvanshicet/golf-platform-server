import Score from "../models/scoreModel.js";
import Draw from "../models/drawModel.js";
import Winner from "../models/winnerModel.js";

const generateDrawNumbers = () => {
  let numbers = [];

  while (numbers.length < 5) {
    let num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }

  return numbers;
};

const checkMatch = (scores, drawNumbers) => {
  return scores.filter((s) => drawNumbers.includes(s.value)).length;
};

const calculatePrize = (winners, totalPool) => {
  let result = [];

  const tier = {
    5: 0.4,
    4: 0.35,
    3: 0.25,
  };

  [5, 4, 3].forEach((level) => {
    const filtered = winners.filter((w) => w.match === level);

    if (filtered.length > 0) {
      const share = (totalPool * tier[level]) / filtered.length;

      filtered.forEach((w) => {
        result.push({
          ...w,
          prize: share,
        });
      });
    }
  });

  return result;
};

export const runDraw = async (req, res) => {
  try {
    const drawNumbers = generateDrawNumbers();

    const usersScores = await Score.find();

    let winners = [];

    usersScores.forEach((user) => {
      const match = checkMatch(user.scores, drawNumbers);

      if (match >= 3) {
        winners.push({
          userId: user.userId,
          match,
        });
      }
    });

    // 🔹 STEP 2: calculate prize
    const totalPool = 10000; // later dynamic
    const finalWinners = calculatePrize(winners, totalPool);

    // 🔹 STEP 3: save winners in DB
    const savedWinners = [];

    for (let w of finalWinners) {
      const saved = await Winner.create({
        userId: w.userId,
        match: w.match,
        prize: w.prize,
      });

      savedWinners.push(saved);
    }

    const draw = await Draw.create({
      numbers: drawNumbers,
      winners: savedWinners,
    });

    res.json({
      draw,
      winners: savedWinners,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getDrawResults = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    res.json(draws);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
