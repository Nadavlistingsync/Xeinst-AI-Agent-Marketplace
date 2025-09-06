// Enterprise Security Configuration
export const ENTERPRISE_SECURITY_CONFIG = {
  // Authentication & Authorization
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: '24h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_SESSIONS_PER_USER: 5,
    PASSWORD_RESET_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  },

  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    SALT_ROUNDS: 12,
  },

  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_AGE_DAYS: 90,
    HISTORY_COUNT: 5,
  },

  // Rate Limiting
  RATE_LIMITING: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
    API_RATE_LIMIT: 1000, // per hour
  },

  // Security Headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.vercel.com https://vitals.vercel-insights.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },

  // API Security
  API_SECURITY: {
    API_KEY_LENGTH: 32,
    API_KEY_PREFIX: 'xeinst_',
    REQUEST_TIMEOUT: 30 * 1000, // 30 seconds
    MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_ORIGINS: [
      'https://xeinst.com',
      'https://www.xeinst.com',
      'https://app.xeinst.com',
    ],
  },

  // Audit Logging
  AUDIT_LOGGING: {
    ENABLED: true,
    RETENTION_DAYS: 90,
    LOG_LEVELS: ['info', 'warn', 'error', 'security'],
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key'],
  },

  // Compliance
  COMPLIANCE: {
    GDPR: {
      ENABLED: true,
      DATA_RETENTION_DAYS: 2555, // 7 years
      CONSENT_REQUIRED: true,
      RIGHT_TO_ERASURE: true,
      DATA_PORTABILITY: true,
    },
    CCPA: {
      ENABLED: true,
      OPT_OUT_REQUIRED: true,
      DATA_TRANSPARENCY: true,
    },
    SOC2: {
      ENABLED: true,
      AUDIT_FREQUENCY: 'annual',
      CONTROLS: ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'],
    },
    HIPAA: {
      ENABLED: false, // Enable if handling PHI
      BAA_REQUIRED: true,
      ENCRYPTION_REQUIRED: true,
    },
  },

  // Monitoring & Alerting
  MONITORING: {
    ENABLED: true,
    ALERT_THRESHOLDS: {
      FAILED_LOGINS: 5,
      SUSPICIOUS_ACTIVITY: 3,
      ERROR_RATE: 0.05, // 5%
      RESPONSE_TIME: 5000, // 5 seconds
    },
    NOTIFICATION_CHANNELS: ['email', 'slack', 'webhook'],
  },

  // Backup & Recovery
  BACKUP: {
    ENABLED: true,
    FREQUENCY: 'daily',
    RETENTION_DAYS: 30,
    ENCRYPTION: true,
    TEST_RESTORE_FREQUENCY: 'monthly',
  },

  // Network Security
  NETWORK: {
    DDoS_PROTECTION: true,
    WAF_ENABLED: true,
    IP_WHITELISTING: false,
    GEO_BLOCKING: false,
    ALLOWED_COUNTRIES: [], // Empty means all countries allowed
  },

  // Data Classification
  DATA_CLASSIFICATION: {
    PUBLIC: {
      ENCRYPTION: false,
      ACCESS_CONTROL: 'public',
      RETENTION: 'indefinite',
    },
    INTERNAL: {
      ENCRYPTION: true,
      ACCESS_CONTROL: 'authenticated',
      RETENTION: '7_years',
    },
    CONFIDENTIAL: {
      ENCRYPTION: true,
      ACCESS_CONTROL: 'role_based',
      RETENTION: '3_years',
    },
    RESTRICTED: {
      ENCRYPTION: true,
      ACCESS_CONTROL: 'strict',
      RETENTION: '1_year',
    },
  },

  // Incident Response
  INCIDENT_RESPONSE: {
    ENABLED: true,
    ESCALATION_LEVELS: [
      { level: 1, response_time: '15_minutes', contacts: ['security@xeinst.com'] },
      { level: 2, response_time: '1_hour', contacts: ['cto@xeinst.com', 'security@xeinst.com'] },
      { level: 3, response_time: '4_hours', contacts: ['ceo@xeinst.com', 'cto@xeinst.com', 'security@xeinst.com'] },
    ],
    AUTOMATED_RESPONSES: {
      BRUTE_FORCE: 'block_ip',
      SUSPICIOUS_ACTIVITY: 'require_mfa',
      DATA_BREACH: 'lock_accounts',
    },
  },

  // Security Training
  SECURITY_TRAINING: {
    ENABLED: true,
    FREQUENCY: 'quarterly',
    TOPICS: [
      'phishing_awareness',
      'password_security',
      'data_handling',
      'incident_reporting',
    ],
    COMPLIANCE_REQUIRED: true,
  },

  // Third-Party Security
  THIRD_PARTY: {
    VENDOR_ASSESSMENT: true,
    SECURITY_REQUIREMENTS: [
      'soc2_certification',
      'penetration_testing',
      'vulnerability_scanning',
      'data_encryption',
    ],
    CONTRACT_REQUIREMENTS: [
      'data_processing_agreement',
      'security_questionnaire',
      'incident_notification',
      'audit_rights',
    ],
  },
} as const;

// Environment-specific overrides
export const getSecurityConfig = () => {
  const config = { ...ENTERPRISE_SECURITY_CONFIG };
  
  // Development overrides
  if (process.env.NODE_ENV === 'development') {
    (config.AUTH as any).JWT_SECRET = 'development-secret-key';
    (config.AUDIT_LOGGING as any).ENABLED = false;
    (config.MONITORING as any).ENABLED = false;
    (config.BACKUP as any).ENABLED = false;
  }
  
  // Production overrides
  if (process.env.NODE_ENV === 'production') {
    (config.AUTH as any).JWT_SECRET = process.env.JWT_SECRET || 'production-secret-key';
    (config.AUDIT_LOGGING as any).ENABLED = true;
    (config.MONITORING as any).ENABLED = true;
    (config.BACKUP as any).ENABLED = true;
  }
  
  return config;
};

// Export the configuration
export default getSecurityConfig();
