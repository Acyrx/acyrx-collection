-- Add revoked column to track revoked sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT FALSE;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_revoked ON user_sessions(session_token, revoked);
