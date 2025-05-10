// === MOCK AUTHENTICATION MIDDLEWARE ===
// For development/testing only. Replace with real authentication in production.
module.exports = function mockAuth(req, res, next) {
  req.user = { id: 'test-user-123' };
  next();
}; 