const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.json.bind(res);

    res.json = function (body) {
      if (req.user) {
        AuditLog.create({
          user: req.user._id,
          action,
          resource,
          resourceId: req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: sanitizeBody(req.body),
            statusCode: res.statusCode,
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          success: res.statusCode < 400,
        }).catch((err) => logger.error('Audit log error:', err));
      }
      return originalSend(body);
    };

    next();
  };
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sensitive = ['password', 'pin', 'token', 'secret', 'cardNumber', 'cvv'];
  const sanitized = { ...body };
  sensitive.forEach((field) => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  return sanitized;
};

module.exports = auditLog;
