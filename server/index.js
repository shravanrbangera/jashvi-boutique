const app = require('./src/server');

if (require.main === module) {
  app.startServer();
}

module.exports = app;
