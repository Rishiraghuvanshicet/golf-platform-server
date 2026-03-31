import Score from "../models/scoreModel.js";
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
  return scores.filter(s => drawNumbers.includes(s.value)).length;
};

export const runDraw = async (req, res) => {
  const drawNumbers = generateDrawNumbers();

  const usersScores = await Score.find();

  let winners = [];

  for (let user of usersScores) {
    const match = checkMatch(user.scores, drawNumbers);

    if (match >= 3) {
      const winner = await Winner.create({
        userId: user.userId,
        match,
        prize: match === 5 ? 5000 : match === 4 ? 3000 : 1000
      });

      winners.push(winner);
    }
  }

  res.json({
    drawNumbers,
    winners
  });
};