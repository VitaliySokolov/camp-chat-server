module.exports = {
  port: process.env.PORT || 3001,
  mongoURL: {
    development: process.env.MONGODB_URI || 'mongodb://localhost:27017/eleksfrontendcamp',
    test: 'mongodb://localhost:27017/node-test'
  },
  jwt_secret: process.env.JWT_SECRET || "Mia04sDfJ#C!(360"
};
