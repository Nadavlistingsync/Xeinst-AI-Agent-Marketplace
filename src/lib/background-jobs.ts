import db from '@/lib/db';
import { deployments } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { updateAgentBasedOnFeedback } from './feedback-monitoring';

export async function runFeedbackAnalysisJob() {
  try {
    // Get all active agents
    const activeAgents = await db
      .select()
      .from(deployments)
      .where(eq(deployments.status, 'active'));

    // Process each agent
    for (const agent of activeAgents) {
      try {
        await updateAgentBasedOnFeedback(agent.id);
      } catch (error) {
        console.error(`Error processing agent ${agent.id}:`, error);
        // Continue with next agent even if one fails
        continue;
      }
    }
  } catch (error) {
    console.error('Error running feedback analysis job:', error);
  }
}

// Function to start the background job
export function startBackgroundJobs() {
  // Run feedback analysis every 6 hours
  setInterval(runFeedbackAnalysisJob, 6 * 60 * 60 * 1000);
  
  // Run initial analysis
  runFeedbackAnalysisJob();
} 