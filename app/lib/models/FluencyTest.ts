import pool from "../db";
import { calculateTestScore, type TestResult, type QuestionResult } from "../utils/testScoring";

/**
 * FluencyTest Model
 * 
 * This model handles database operations for fluency tests.
 * For now, questions are stored in a static file (app/student/fluency-test/questions.ts)
 * 
 * Future implementation:
 * - Store questions in the database
 * - AI agent can generate new questions dynamically
 * - Track question difficulty, category, and usage statistics
 * - Support versioning and A/B testing of questions
 * - Store user test results and track progress over time
 */

export interface FluencyQuestion {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "true-false" | "multiple-choice";
  category?: string; // e.g., "AI Basics", "Ethics", "Practical Usage"
  difficulty?: "easy" | "medium" | "hard";
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

// Initialize the table (call this when the model is imported)
async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS fluency_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('true-false', 'multiple-choice')),
        category VARCHAR(100),
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index for efficient querying
      CREATE INDEX IF NOT EXISTS idx_fluency_questions_active ON fluency_questions(is_active);
      CREATE INDEX IF NOT EXISTS idx_fluency_questions_category ON fluency_questions(category);
    `);
  } catch (err) {
    console.error("Error initializing fluency_questions table:", err);
  } finally {
    client.release();
  }
}

// Initialize on import
init();

/**
 * Create a new fluency question
 */
export async function createQuestion(question: FluencyQuestion): Promise<FluencyQuestion> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO fluency_questions 
       (question, options, correct_answer, type, category, difficulty, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.type,
        question.category || null,
        question.difficulty || null,
        question.isActive !== false,
      ]
    );
    return mapDbRowToQuestion(result.rows[0]);
  } finally {
    client.release();
  }
}

/**
 * Get all active questions
 */
export async function getActiveQuestions(): Promise<FluencyQuestion[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM fluency_questions WHERE is_active = true ORDER BY id`
    );
    return result.rows.map(mapDbRowToQuestion);
  } finally {
    client.release();
  }
}

/**
 * Get questions by category
 */
export async function getQuestionsByCategory(category: string): Promise<FluencyQuestion[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM fluency_questions WHERE category = $1 AND is_active = true ORDER BY id`,
      [category]
    );
    return result.rows.map(mapDbRowToQuestion);
  } finally {
    client.release();
  }
}

/**
 * Get random questions for a test
 * @param count Number of questions to retrieve
 * @param difficulty Optional difficulty filter
 */
export async function getRandomQuestions(
  count: number,
  difficulty?: "easy" | "medium" | "hard"
): Promise<FluencyQuestion[]> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM fluency_questions WHERE is_active = true`;
    const params: any[] = [count];

    if (difficulty) {
      query += ` AND difficulty = $2`;
      params.push(difficulty);
    }

    query += ` ORDER BY RANDOM() LIMIT $1`;

    const result = await client.query(query, params);
    return result.rows.map(mapDbRowToQuestion);
  } finally {
    client.release();
  }
}

/**
 * Update a question
 */
export async function updateQuestion(
  id: number,
  updates: Partial<FluencyQuestion>
): Promise<FluencyQuestion | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.question !== undefined) {
      fields.push(`question = $${paramCount++}`);
      values.push(updates.question);
    }
    if (updates.options !== undefined) {
      fields.push(`options = $${paramCount++}`);
      values.push(JSON.stringify(updates.options));
    }
    if (updates.correctAnswer !== undefined) {
      fields.push(`correct_answer = $${paramCount++}`);
      values.push(updates.correctAnswer);
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.difficulty !== undefined) {
      fields.push(`difficulty = $${paramCount++}`);
      values.push(updates.difficulty);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await client.query(
      `UPDATE fluency_questions SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? mapDbRowToQuestion(result.rows[0]) : null;
  } finally {
    client.release();
  }
}

/**
 * Soft delete a question (set is_active to false)
 */
export async function deactivateQuestion(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE fluency_questions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

/**
 * Map database row to FluencyQuestion interface
 */
function mapDbRowToQuestion(row: any): FluencyQuestion {
  return {
    id: row.id,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : JSON.parse(row.options),
    correctAnswer: row.correct_answer,
    type: row.type,
    category: row.category,
    difficulty: row.difficulty,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// User Test Results - Store completed test scores
// ============================================================================

export interface UserTestResult {
  id?: number;
  userId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  level: string;
  completedAt?: Date;
}

/**
 * Save a user's test result to the database
 */
export async function saveUserTestResult(
  userId: number,
  testResult: TestResult
): Promise<UserTestResult> {
  const client = await pool.connect();
  try {
    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_fluency_test_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        level VARCHAR(50) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_test_results_user_id ON user_fluency_test_results(user_id);
    `);

    const result = await client.query(
      `INSERT INTO user_fluency_test_results 
       (user_id, score, total_questions, percentage, level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, testResult.score, testResult.totalQuestions, testResult.percentage, testResult.level]
    );

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      score: result.rows[0].score,
      totalQuestions: result.rows[0].total_questions,
      percentage: parseFloat(result.rows[0].percentage),
      level: result.rows[0].level,
      completedAt: result.rows[0].completed_at,
    };
  } finally {
    client.release();
  }
}

/**
 * Get all test results for a user
 */
export async function getUserTestResults(userId: number): Promise<UserTestResult[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM user_fluency_test_results WHERE user_id = $1 ORDER BY completed_at DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: parseFloat(row.percentage),
      level: row.level,
      completedAt: row.completed_at,
    }));
  } finally {
    client.release();
  }
}

/**
 * Get the latest test result for a user
 */
export async function getLatestUserTestResult(userId: number): Promise<UserTestResult | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM user_fluency_test_results WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: parseFloat(row.percentage),
      level: row.level,
      completedAt: row.completed_at,
    };
  } finally {
    client.release();
  }
}

// Re-export scoring utilities for convenience
export { calculateTestScore, type TestResult, type QuestionResult } from "../utils/testScoring";

