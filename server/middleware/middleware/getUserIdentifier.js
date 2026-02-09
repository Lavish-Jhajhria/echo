// Extract user identifier from request

const getUserIdentifier = (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipFromHeader =
    typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '';

  req.userIdentifier = ipFromHeader || req.ip || req.connection?.remoteAddress || '';
  next();
};

module.exports = getUserIdentifier;

