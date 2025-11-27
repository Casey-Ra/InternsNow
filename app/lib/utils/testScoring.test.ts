import { calculateTestScore, Question } from './testScoring';

describe('calculateTestScore', () => {
  const mockQuestions: Question[] = [
    {
      id: 1,
      question: 'What is AI?',
      options: ['Artificial Intelligence', 'Actual Intelligence', 'Automated Intelligence'],
      correctAnswer: 0,
      type: 'multiple-choice',
    },
    {
      id: 2,
      question: 'Is machine learning a subset of AI?',
      options: ['True', 'False'],
      correctAnswer: 0,
      type: 'true-false',
    },
    {
      id: 3,
      question: 'What does NLP stand for?',
      options: ['Natural Language Processing', 'New Language Protocol', 'Neural Learning Process'],
      correctAnswer: 0,
      type: 'multiple-choice',
    },
    {
      id: 4,
      question: 'Can AI replace human creativity?',
      options: ['True', 'False'],
      correctAnswer: 1,
      type: 'true-false',
    },
    {
      id: 5,
      question: 'What is deep learning?',
      options: ['Advanced ML technique', 'Basic programming', 'Data storage method'],
      correctAnswer: 0,
      type: 'multiple-choice',
    },
  ];

  test('should calculate 100% score correctly (Excellent)', () => {
    const userAnswers = [0, 0, 0, 1, 0]; // All correct
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(5);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(100);
    expect(result.level).toBe('Excellent');
    expect(result.color).toBe('text-green-600');
  });

  test('should calculate 80% score correctly (Excellent)', () => {
    const userAnswers = [0, 0, 0, 1, 2]; // 4 correct, 1 wrong
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(4);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(80);
    expect(result.level).toBe('Excellent');
  });

  test('should calculate 60% score correctly (Competent)', () => {
    const userAnswers = [0, 0, 0, 0, 2]; // 3 correct, 2 wrong
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(3);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(60);
    expect(result.level).toBe('Competent');
    expect(result.color).toBe('text-yellow-600');
  });

  test('should calculate 40% score correctly (Competent)', () => {
    const userAnswers = [0, 0, 1, 0, 2]; // 2 correct, 3 wrong
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(2);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(40);
    expect(result.level).toBe('Competent');
  });

  test('should calculate 20% score correctly (Needs Improvement)', () => {
    const userAnswers = [0, 1, 1, 0, 2]; // 1 correct, 4 wrong
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(20);
    expect(result.level).toBe('Needs Improvement');
    expect(result.color).toBe('text-red-600');
  });

  test('should handle null answers (unanswered questions)', () => {
    const userAnswers = [0, null, 0, null, 0]; // 3 correct, 2 unanswered
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(3);
    expect(result.percentage).toBe(60);
    expect(result.questionResults[1].isCorrect).toBe(false);
    expect(result.questionResults[1].userAnswer).toBe(-1);
  });

  test('should provide detailed question results', () => {
    const userAnswers = [0, 1, 0, 1, 0]; // Mixed results
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.questionResults).toHaveLength(5);
    expect(result.questionResults[0].isCorrect).toBe(true);
    expect(result.questionResults[1].isCorrect).toBe(false);
    expect(result.questionResults[0].question.id).toBe(1);
  });

  test('should handle edge case: 0% score', () => {
    const userAnswers = [1, 1, 1, 0, 1]; // All wrong
    const result = calculateTestScore(mockQuestions, userAnswers);

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.level).toBe('Needs Improvement');
  });

  test('should handle edge case: empty questions array', () => {
    const userAnswers: (number | null)[] = [];
    const result = calculateTestScore([], userAnswers);

    expect(result.score).toBe(0);
    expect(result.totalQuestions).toBe(0);
    expect(result.percentage).toBeNaN(); // 0/0 = NaN
  });
});
