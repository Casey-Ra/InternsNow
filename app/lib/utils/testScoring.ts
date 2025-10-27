/**
 * Test Scoring Utilities
 * 
 * Pure functions for calculating test scores and evaluating performance.
 * These can be used in both client and server components.
 */

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "true-false" | "multiple-choice";
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  level: "Excellent" | "Competent" | "Needs Improvement";
  color: string;
  description: string;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
}

/**
 * Calculate test score and evaluate performance level
 * @param questions Array of questions in the test
 * @param userAnswers Array of user's answer indices
 * @returns TestResult with score, level, and detailed breakdown
 */
export function calculateTestScore(
  questions: Question[],
  userAnswers: (number | null)[]
): TestResult {
  let correctCount = 0;
  const questionResults: QuestionResult[] = [];

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    }

    questionResults.push({
      question,
      userAnswer: userAnswer ?? -1,
      isCorrect,
    });
  });

  const totalQuestions = questions.length;
  const percentage = (correctCount / totalQuestions) * 100;
  const scoreLevel = getScoreLevel(correctCount, totalQuestions);

  return {
    score: correctCount,
    totalQuestions,
    percentage,
    level: scoreLevel.level,
    color: scoreLevel.color,
    description: scoreLevel.description,
    questionResults,
  };
}

/**
 * Determine performance level based on score
 * Scoring criteria: 80%+ Excellent, 40-79% Competent, <40% Needs Improvement
 */
function getScoreLevel(
  score: number,
  total: number
): {
  level: "Excellent" | "Competent" | "Needs Improvement";
  color: string;
  description: string;
} {
  const percentage = (score / total) * 100;

  if (percentage >= 80) {
    return {
      level: "Excellent",
      color: "text-green-600",
      description: "Excellent! You have strong AI fluency and practical literacy skills.",
    };
  }

  if (percentage >= 40) {
    return {
      level: "Competent",
      color: "text-yellow-600",
      description: "Good foundation, but consider reviewing AI concepts and best practices.",
    };
  }

  return {
    level: "Needs Improvement",
    color: "text-red-600",
    description: "We recommend an AI learning supplement, course, or module to build foundational knowledge.",
  };
}
