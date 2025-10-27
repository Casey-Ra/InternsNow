"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fluencyTestQuestions, type Question } from "./questions";
import { calculateTestScore, type TestResult } from "@/app/lib/utils/testScoring";

export default function FluencyTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(fluencyTestQuestions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < fluencyTestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const result = calculateTestScore(fluencyTestQuestions, selectedAnswers);
    setTestResult(result);
    setShowResults(true);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(fluencyTestQuestions.length).fill(null));
    setShowResults(false);
    setTestResult(null);
  };

  const allAnswered = selectedAnswers.every(answer => answer !== null);
  const progress = ((currentQuestion + 1) / fluencyTestQuestions.length) * 100;

  if (showResults && testResult) {

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
                    {testResult.score}/{testResult.totalQuestions}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300">
                    Questions Correct
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold ${testResult.color} mb-2`}>
                    {testResult.level}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {testResult.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Question Breakdown
                </h2>
                {testResult.questionResults.map((result, index) => {
                  const { question, userAnswer, isCorrect } = result;
                  return (
                    <div
                      key={question.id}
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
                            Question {index + 1}: {question.question}
                          </p>
                          {!isCorrect && (
                            <div className="text-sm">
                              <p className="text-red-700 dark:text-red-300">
                                Your answer: {question.options[userAnswer]}
                              </p>
                              <p className="text-green-700 dark:text-green-300">
                                Correct answer: {question.options[question.correctAnswer]}
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
                Question {currentQuestion + 1} of {fluencyTestQuestions.length}
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
              {fluencyTestQuestions[currentQuestion].question}
            </h2>

            <div className="space-y-4">
              {fluencyTestQuestions[currentQuestion].options.map((option, index) => (
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

            {currentQuestion === fluencyTestQuestions.length - 1 ? (
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

          {!allAnswered && currentQuestion === fluencyTestQuestions.length - 1 && (
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
