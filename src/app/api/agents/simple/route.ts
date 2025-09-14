import { NextResponse } from 'next/server';

// Simple API route that returns mock data without database dependency
// This ensures the marketplace works even without Supabase setup

export async function GET() {
  try {
    console.log('GET /api/agents/simple: Returning mock agents data...');
    
    const mockAgents = [
      {
        id: "1",
        name: "Content Generator Pro",
        description: "Generate high-quality blog posts, articles, and marketing copy with AI-powered content creation.",
        category: "content",
        price: 50,
        rating: 4.8,
        totalRuns: 1250,
        tags: ["content", "writing", "marketing"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "2", 
        name: "Data Analyzer",
        description: "Automatically analyze datasets and generate insights, charts, and reports.",
        category: "data",
        price: 75,
        rating: 4.6,
        totalRuns: 890,
        tags: ["data", "analytics", "reports"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Social Media Manager",
        description: "Schedule posts, engage with followers, and analyze social media performance across platforms.",
        category: "marketing",
        price: 60,
        rating: 4.7,
        totalRuns: 2100,
        tags: ["social", "marketing", "automation"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Code Reviewer",
        description: "Automatically review code for bugs, security issues, and best practices.",
        category: "development",
        price: 40,
        rating: 4.9,
        totalRuns: 1800,
        tags: ["development", "code", "review"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Research Assistant",
        description: "Gather and summarize information from multiple sources for research projects.",
        category: "research",
        price: 35,
        rating: 4.5,
        totalRuns: 950,
        tags: ["research", "information", "summarization"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "6",
        name: "Email Automation",
        description: "Create personalized email campaigns and automate follow-ups based on user behavior.",
        category: "automation",
        price: 55,
        rating: 4.6,
        totalRuns: 1650,
        tags: ["email", "automation", "marketing"],
        status: "active",
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      agents: mockAgents,
      total: mockAgents.length,
      timestamp: new Date().toISOString(),
      message: "Using mock data - set up Supabase for real database connection"
    });
  } catch (error) {
    console.error('GET /api/agents/simple error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
