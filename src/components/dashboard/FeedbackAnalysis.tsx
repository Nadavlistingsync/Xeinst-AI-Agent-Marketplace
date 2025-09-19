"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MessageCircle, Star, TrendingUp, Users } from 'lucide-react';

interface FeedbackAnalysisProps {
  agentId: string;
}

export const FeedbackAnalysis: React.FC<FeedbackAnalysisProps> = ({ agentId }) => {
  return (
    <div className="space-y-6">
      {/* Feedback Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
            <MessageCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">127</div>
          <div className="text-sm text-white/70">Total Reviews</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-yellow-500/20 mb-4">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">4.6</div>
          <div className="text-sm text-white/70">Average Rating</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">+12%</div>
          <div className="text-sm text-white/70">Rating Trend</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-purple-500/20 mb-4">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">89%</div>
          <div className="text-sm text-white/70">Satisfaction</div>
        </GlassCard>
      </div>

      {/* Rating Distribution */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-white text-sm">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400" />
              </div>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${rating * 20}%` }}
                />
              </div>
              <span className="text-white/70 text-sm w-12">{rating * 5}%</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Feedback */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Recent Feedback</h3>
        <div className="space-y-4">
          {[
            { rating: 5, comment: "Excellent agent, very helpful!", user: "John D.", date: "2 days ago" },
            { rating: 4, comment: "Good performance, could be faster", user: "Sarah M.", date: "3 days ago" },
            { rating: 5, comment: "Amazing results, highly recommend!", user: "Mike R.", date: "1 week ago" },
          ].map((feedback, index) => (
            <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-white/30'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">{feedback.user}</span>
                </div>
                <span className="text-white/50 text-sm">{feedback.date}</span>
              </div>
              <p className="text-white/70 text-sm">{feedback.comment}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
