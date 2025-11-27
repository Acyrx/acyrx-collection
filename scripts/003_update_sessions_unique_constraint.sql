-- Drop old constraint if exists and add new one based on session_token
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_ip_address_user_agent_key;

-- Add unique constraint on session_token
ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);

-- Make session_token NOT NULL for new records
ALTER TABLE user_sessions ALTER COLUMN session_token SET NOT NULL;
