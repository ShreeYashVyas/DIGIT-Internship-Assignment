const { difficultyDistance } = require('./adaptive');

async function selectUnusedQuestion(Question, preferred, usedIds) {
  const query = { active: true };
  if (usedIds.length) query._id = { $nin: usedIds };
  const available = await Question.find(query).lean();
  if (!available.length) return null;

  available.sort((a, b) => {
    const distance = difficultyDistance(a.difficulty, preferred) - difficultyDistance(b.difficulty, preferred);
    return distance || a.questionText.localeCompare(b.questionText);
  });
  const closestDistance = difficultyDistance(available[0].difficulty, preferred);
  const closest = available.filter((item) => difficultyDistance(item.difficulty, preferred) === closestDistance);
  return closest[Math.floor(Math.random() * closest.length)];
}

function publicQuestion(question, number, total) {
  return {
    id: String(question._id),
    questionText: question.questionText,
    options: question.options,
    topic: question.topic,
    difficulty: question.difficulty,
    questionNumber: number,
    totalQuestions: total
  };
}

module.exports = { selectUnusedQuestion, publicQuestion };
