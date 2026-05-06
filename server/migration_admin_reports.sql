-- Migration to add Admin and Reporting features

-- Add admin and active status to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add admin and active status to lecturers
ALTER TABLE lecturers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE lecturers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add hidden status to content
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL,
    reporter_role VARCHAR(20) NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- 'question', 'answer'
    target_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for reports
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
