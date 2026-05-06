-- User Tag Preferences table
CREATE TABLE IF NOT EXISTS user_tag_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
    UNIQUE (user_id, user_role, tag_id)
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_user_tag_prefs_user ON user_tag_preferences(user_id, user_role);
