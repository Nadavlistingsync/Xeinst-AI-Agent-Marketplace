'use client';

import { useEffect, useState } from 'react';
import { securityManager } from "@/lib/security";

/**
 * Security Notice Component
 * 
 * This component displays copyright and security notices
 * to inform users about the protected nature of the software.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 */

interface SecurityNoticeProps {
  showFullNotice?: boolean;
  className?: string;
}

export default function SecurityNotice({ 
  showFullNotice = false, 
  className = '' 
}: SecurityNoticeProps) {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get session information
    const info = securityManager.getSessionInfo();
    setSessionInfo(info);
    
    // Show notice after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !sessionInfo) return null;

  return (
    <div className={`security-notice ${className}`}>
      {showFullNotice ? (
        <div className="full-notice">
          <div className="notice-header">
            <h3>🔒 Security Notice</h3>
          </div>
          <div className="notice-content">
            <p>
              <strong>Copyright (c) 2024 AI Agency Website. All rights reserved.</strong>
            </p>
            <p>
              This software is protected by copyright law and includes proprietary
              algorithms, business logic, and architectural patterns.
            </p>
            <p>
              <strong>Unauthorized use, copying, or distribution is strictly prohibited.</strong>
            </p>
            <p>
              Commercial use requires explicit written permission from the copyright holder.
            </p>
            <div className="notice-footer">
              <p>Session ID: {sessionInfo.sessionId}</p>
              <p>Watermark: {sessionInfo.watermark}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mini-notice">
          <p>
            © 2024 AI Agency Website. All rights reserved. | 
            Protected by copyright law | 
            Unauthorized use prohibited
          </p>
        </div>
      )}
      
      <style jsx>{`
        .security-notice {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 10px;
          font-size: 12px;
          z-index: 10000;
          border-top: 2px solid #ff0000;
        }
        
        .full-notice {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .notice-header h3 {
          margin: 0 0 10px 0;
          color: #ff0000;
          font-size: 16px;
        }
        
        .notice-content p {
          margin: 5px 0;
          line-height: 1.4;
        }
        
        .notice-footer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #333;
          font-size: 10px;
          color: #ccc;
        }
        
        .mini-notice {
          text-align: center;
        }
        
        .mini-notice p {
          margin: 0;
          font-size: 11px;
        }
        
        @media (max-width: 768px) {
          .security-notice {
            font-size: 10px;
            padding: 8px;
          }
          
          .mini-notice p {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
