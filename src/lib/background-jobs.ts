import prisma from '@/lib/prisma';
import { updateAgentBasedOnFeedback } from './feedback-monitoring';

export async function runFeedbackAnalysisJob() {
  try {
    console.log('Starting feedback analysis job...');
    
    // Get all active agents
    const activeAgents = await prisma.deployment.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    if (!activeAgents || activeAgents.length === 0) {
      console.log('No active agents found');
      return;
    }

    console.log(`Found ${activeAgents.length} active agents to process`);

    // Process each agent
    for (const agent of activeAgents) {
      try {
        console.log(`Processing feedback for agent: ${agent.name} (${agent.id})`);
        await updateAgentBasedOnFeedback(agent.id);
        console.log(`Successfully processed feedback for agent: ${agent.name}`);
      } catch (error) {
        console.error(`Error processing agent ${agent.id}:`, error);
        // Continue with next agent even if one fails
        continue;
      }
    }

    console.log('Feedback analysis job completed successfully');
  } catch (error) {
    console.error('Error running feedback analysis job:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
}

// Function to start the background job
export function startBackgroundJobs() {
  try {
    console.log('Starting background jobs...');
    
    // Run feedback analysis every 6 hours
    const interval = setInterval(async () => {
      try {
        await runFeedbackAnalysisJob();
      } catch (error) {
        console.error('Error in scheduled feedback analysis:', error);
      }
    }, 6 * 60 * 60 * 1000);

    // Run initial analysis
    runFeedbackAnalysisJob().catch(error => {
      console.error('Error in initial feedback analysis:', error);
    });

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  } catch (error) {
    console.error('Error starting background jobs:', error);
    throw error;
  }
} 