-- Create deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    model_type TEXT NOT NULL,
    framework TEXT NOT NULL,
    requirements TEXT,
    api_endpoint TEXT,
    environment TEXT NOT NULL DEFAULT 'production',
    version TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    deployed_by UUID REFERENCES auth.users(id),
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on deployed_by for faster lookups
CREATE INDEX IF NOT EXISTS deployments_deployed_by_idx ON deployments(deployed_by);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS deployments_status_idx ON deployments(status);

-- Enable Row Level Security
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own deployments"
    ON deployments FOR SELECT
    USING (auth.uid() = deployed_by);

CREATE POLICY "Users can create their own deployments"
    ON deployments FOR INSERT
    WITH CHECK (auth.uid() = deployed_by);

CREATE POLICY "Users can update their own deployments"
    ON deployments FOR UPDATE
    USING (auth.uid() = deployed_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 