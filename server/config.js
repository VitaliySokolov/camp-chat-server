module.exports = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || 'localhost',
  mongoURL: {
    development: process.env.MONGODB_URI || 'mongodb://localhost:27017/camp-chat',
    test: 'mongodb://localhost:27017/node-test',
    production: `mongodb://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@ds129641.mlab.com:29641/camp-chat`,
  },
  jwt_secret: process.env.JWT_SECRET || "Mia04sDfJ#C!(360"
};
