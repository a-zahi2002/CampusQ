-- Add points column to students and lecturers
ALTER TABLE students ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE lecturers ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create answer_ratings table
CREATE TABLE IF NOT EXISTS answer_ratings (
    rating_id SERIAL PRIMARY KEY,
    answer_id INTEGER REFERENCES answers(answer_id) ON DELETE CASCADE,
    rater_id INTEGER NOT NULL,
    rater_role VARCHAR(20) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (answer_id, rater_id, rater_role)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_answer_ratings_answer_id ON answer_ratings(answer_id);
