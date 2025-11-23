-- Add location and session metadata columns to screen_sessions table
ALTER TABLE screen_sessions 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_metadata JSONB DEFAULT '{}'::jsonb;

-- Add geolocation fields to children table for tracking child's location
ALTER TABLE children
ADD COLUMN IF NOT EXISTS last_location TEXT,
ADD COLUMN IF NOT EXISTS last_location_updated_at TIMESTAMP WITH TIME ZONE;

-- Add more detailed device information to devices table
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS device_name TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_screen_sessions_ip_address ON screen_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_devices_last_used_at ON devices(last_used_at);