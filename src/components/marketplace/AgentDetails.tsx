"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui';
import { Bot, Star, Download, Play, Heart, Share2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloadCount: number;
  creator: {
    name: string;
    image?: string;
  };
}

interface AgentDetailsProps {
  agent: Agent;
}

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <GlassCard>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
              <p className="text-white/70 mb-4 max-w-2xl">{agent.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{agent.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4 text-white/70" />
                  <span className="text-white/70">{agent.downloadCount.toLocaleString()} downloads</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                  {agent.category}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="neon" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Run Agent - {agent.price} credits
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Agent Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">About this Agent</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed">
                This AI agent provides advanced automation capabilities for various business processes. 
                It leverages cutting-edge machine learning algorithms to deliver accurate and efficient results.
              </p>
              <h4 className="text-lg font-semibold text-white mt-6 mb-3">Key Features</h4>
              <ul className="text-white/80 space-y-2">
                <li>• Advanced natural language processing</li>
                <li>• Real-time data analysis</li>
                <li>• Seamless integration with popular tools</li>
                <li>• Customizable workflows</li>
                <li>• 24/7 automated operation</li>
              </ul>
            </div>
          </GlassCard>

          {/* Reviews */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-6">Reviews</h3>
            <div className="space-y-4">
              {[
                { name: "John Doe", rating: 5, comment: "Excellent agent! Saved me hours of work.", date: "2 days ago" },
                { name: "Sarah Smith", rating: 4, comment: "Very useful, but could be faster.", date: "1 week ago" },
                { name: "Mike Johnson", rating: 5, comment: "Perfect for our workflow automation.", date: "2 weeks ago" },
              ].map((review, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{review.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{review.name}</div>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-white/30'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-white/50 text-sm">{review.date}</span>
                  </div>
                  <p className="text-white/80 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Info */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Created by</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">{agent.creator.name[0]}</span>
              </div>
              <div>
                <div className="font-medium text-white">{agent.creator.name}</div>
                <div className="text-sm text-white/70">AI Developer</div>
              </div>
            </div>
          </GlassCard>

          {/* Pricing */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{agent.price}</div>
              <div className="text-white/70 text-sm mb-4">credits per execution</div>
              <Button variant="neon" fullWidth>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            </div>
          </GlassCard>

          {/* Stats */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Downloads</span>
                <span className="text-white font-medium">{agent.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Rating</span>
                <span className="text-white font-medium">{agent.rating}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Category</span>
                <span className="text-white font-medium">{agent.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Last Updated</span>
                <span className="text-white font-medium">2 days ago</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export { AgentDetails };
export default AgentDetails;
