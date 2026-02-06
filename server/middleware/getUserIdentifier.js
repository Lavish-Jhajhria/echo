/**
 * Extracts user identifier from request.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 * @description Uses IP address as simple identifier for now.
 */
const getUserIdentifier = (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipFromHeader =
    typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '';

  req.userIdentifier = ipFromHeader || req.ip || req.connection?.remoteAddress || '';
  next();
};

module.exports = getUserIdentifier;

