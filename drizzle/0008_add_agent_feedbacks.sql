CREATE TABLE IF NOT EXISTS "agent_feedbacks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" uuid NOT NULL REFERENCES "deployments"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL,
  "comment" text,
  "sentiment_score" decimal(3,2),
  "categories" jsonb,
  "creator_response" text,
  "response_date" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "agent_feedbacks_agent_id_idx" ON "agent_feedbacks"("agent_id");
CREATE INDEX IF NOT EXISTS "agent_feedbacks_user_id_idx" ON "agent_feedbacks"("user_id");
CREATE INDEX IF NOT EXISTS "agent_feedbacks_created_at_idx" ON "agent_feedbacks"("created_at");

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_feedbacks_updated_at
    BEFORE UPDATE ON agent_feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 