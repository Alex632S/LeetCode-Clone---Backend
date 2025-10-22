import pool from '../config/database.js';

const createTables = async () => {
  try {
    // Таблица пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица задач
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        examples JSONB,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица комментариев
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        problem_id INTEGER REFERENCES problems(id),
        parent_id INTEGER REFERENCES comments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица оценок
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        problem_id INTEGER REFERENCES problems(id),
        value INTEGER CHECK (value >= 1 AND value <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, problem_id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    pool.end();
  }
};

createTables();