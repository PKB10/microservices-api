module.exports = function (app) {

  // Import required frameworks and files
  const bodyParser = require('body-parser');
  const apiController = require("./../controllers/apiController");
  const usersController = require("./../controllers/usersController");

  // Setup parser for POST requests
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //Pre-login Routes:
  app.get("/", apiController.index);
  app.get("/version", apiController.version);
  app.post("/users/login", usersController.userlogin);

  

  //EOF
  //FINAL FIXES
};