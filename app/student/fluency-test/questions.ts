export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "true-false" | "multiple-choice";
}

export const fluencyTestQuestions: Question[] = [
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
