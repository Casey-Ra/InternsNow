"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "true-false" | "multiple-choice";
}

const questions: Question[] = [
  // True/False Questions
  {
    id: 1,
    question: "AI tools like ChatGPT always provide accurate and unbiased information.",
    options: ["True", "False"],
    correctAnswer: 1,
    type: "true-false"
  },
  {
    id: 2,
    question: "It's okay to paste confidential company data into a public AI chatbot if it helps you work faster.",
    options: ["True", "False"],
    correctAnswer: 1,
    type: "true-false"
  },
  {
    id: 3,
    question: "AI can recognize patterns in data but doesn't understand meaning the way humans do.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  {
    id: 4,
    question: "If an AI makes a mistake, the person using it is still responsible for the outcome.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  {
    id: 5,
    question: "AI can help draft emails, reports, or resumes — but human review is still necessary.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  {
    id: 6,
    question: "Using AI to generate ideas can be helpful, but you should always check for originality and plagiarism.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  {
    id: 7,
    question: "AI models can learn new facts automatically after they're released to the public.",
    options: ["True", "False"],
    correctAnswer: 1,
    type: "true-false"
  },
  {
    id: 8,
    question: "'Artificial intelligence' and 'automation' mean exactly the same thing.",
    options: ["True", "False"],
    correctAnswer: 1,
    type: "true-false"
  },
  {
    id: 9,
    question: "Knowing how to prompt AI tools effectively is a valuable professional skill.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  {
    id: 10,
    question: "AI Models can be open sourced similarly to other software.",
    options: ["True", "False"],
    correctAnswer: 0,
    type: "true-false"
  },
  // Multiple Choice Questions
  {
    id: 11,
    question: "What does AI stand for in the context of technology?",
    options: [
      "Automated Intelligence",
      "Artificial Intelligence",
      "Advanced Integration",
      "Algorithmic Interface"
    ],
    correctAnswer: 1,
    type: "multiple-choice"
  },
  {
    id: 12,
    question: "Which of the following is an example of a Large Language Model (LLM)?",
    options: [
      "Microsoft Excel",
      "Google Maps",
      "ChatGPT",
      "Adobe Photoshop"
    ],
    correctAnswer: 2,
    type: "multiple-choice"
  },
  {
    id: 13,
    question: "What is a 'prompt' in the context of AI tools?",
    options: [
      "A notification from the AI system",
      "An error message",
      "Input text or instructions given to an AI model",
      "The speed at which AI responds"
    ],
    correctAnswer: 2,
    type: "multiple-choice"
  },
  {
    id: 14,
    question: "Which task CAN'T current AI tools reliably perform?",
    options: [
      "Writing code based on descriptions",
      "Translating text between languages",
      "Making complex ethical decisions independently",
      "Generating images from text descriptions"
    ],
    correctAnswer: 2,
    type: "multiple-choice"
  },
  {
    id: 15,
    question: "What is 'machine learning'?",
    options: [
      "Teaching humans how to use machines",
      "A type of computer hardware",
      "AI systems that improve from experience without explicit programming",
      "The process of assembling computers"
    ],
    correctAnswer: 2,
    type: "multiple-choice"
  },
  {
    id: 16,
    question: "When using AI-generated content in professional work, you should:",
    options: [
      "Always use it exactly as generated",
      "Review, verify, and edit before using",
      "Never use AI-generated content",
      "Only use it for creative projects"
    ],
    correctAnswer: 1,
    type: "multiple-choice"
  },
  {
    id: 17,
    question: "What is 'bias' in AI systems?",
    options: [
      "The electrical charge in computer chips",
      "Unfair or inaccurate outputs based on training data",
      "The speed of AI processing",
      "A security feature"
    ],
    correctAnswer: 1,
    type: "multiple-choice"
  },
  {
    id: 18,
    question: "Which is a best practice when writing prompts for AI?",
    options: [
      "Be as vague as possible",
      "Use only single words",
      "Provide clear, specific instructions with context",
      "Always use technical jargon"
    ],
    correctAnswer: 2,
    type: "multiple-choice"
  },
  {
    id: 19,
    question: "What does 'generative AI' refer to?",
    options: [
      "AI that only analyzes existing data",
      "AI that creates new content like text, images, or code",
      "The first generation of AI systems",
      "AI used in power generation"
    ],
    correctAnswer: 1,
    type: "multiple-choice"
  },
  {
    id: 20,
    question: "Why is it important to fact-check AI-generated information?",
    options: [
      "AI always provides incorrect information",
      "AI can 'hallucinate' or generate plausible but false information",
      "It's not important - AI is always accurate",
      "To slow down the work process"
    ],
    correctAnswer: 1,
    type: "multiple-choice"
  }
];

export default function FluencyTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setScore(0);
  };

  const getScoreLevel = (score: number) => {
    // Based on scoring criteria: 16+ Strong, 8-16 Needs Improvement, 0-8 Weak
    if (score >= 16) return { level: "Excellent", color: "text-green-600", description: "Excellent! You have strong AI fluency and practical literacy skills." };
    if (score >= 8) return { level: "Competent", color: "text-yellow-600", description: "Good foundation, but consider reviewing AI concepts and best practices." };
    return { level: "Needs Improvement", color: "text-red-600", description: "We recommend an AI learning supplement, course, or module to build foundational knowledge." };
  };

  const allAnswered = selectedAnswers.every(answer => answer !== null);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    const scoreInfo = getScoreLevel(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header variant="student" />
        <main className="px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Test Complete!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Here are your results
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 mb-8">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                    {score}/{questions.length}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300">
                    Questions Correct
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold ${scoreInfo.color} mb-2`}>
                    {scoreInfo.level}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {scoreInfo.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Question Breakdown
                </h2>
                {questions.map((q, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">
                            Question {index + 1}: {q.question}
                          </p>
                          {!isCorrect && (
                            <div className="text-sm">
                              <p className="text-red-700 dark:text-red-300">
                                Your answer: {q.options[userAnswer!]}
                              </p>
                              <p className="text-green-700 dark:text-green-300">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetake}
                  className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
                >
                  Retake Test
                </button>
                <a
                  href="/student"
                  className="flex-1 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-lg text-center transition-colors"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer variant="student" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />
      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              AI Fluency Test
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Test your knowledge of AI concepts and best practices
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress.toFixed(0)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 md:p-6 text-left rounded-xl border-2 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswers[currentQuestion] === index
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === index && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium text-lg">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex-1" />

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === null}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next Question
              </button>
            )}
          </div>

          {!allAnswered && currentQuestion === questions.length - 1 && (
            <p className="text-center text-red-600 dark:text-red-400 mt-4 font-medium">
              Please answer all questions before submitting
            </p>
          )}
        </div>
      </main>
      <Footer variant="student" />
    </div>
  );
}
