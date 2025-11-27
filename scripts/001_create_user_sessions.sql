-- Create user_sessions table to track login sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT NOT NULL DEFAULT 'Unknown',
    os TEXT NOT NULL DEFAULT 'Unknown',
    device_type TEXT NOT NULL DEFAULT 'unknown' CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Create a unique constraint for session identification
    UNIQUE(user_id, ip_address, user_agent)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Create index for ordering by last_active_at
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "users_view_own_sessions" 
    ON public.user_sessions 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "users_insert_own_sessions" 
    ON public.user_sessions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "users_update_own_sessions" 
    ON public.user_sessions 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions
CREATE POLICY "users_delete_own_sessions" 
    ON public.user_sessions 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;

-- Grant permissions to service role for admin operations
GRANT ALL ON public.user_sessions TO service_role;
