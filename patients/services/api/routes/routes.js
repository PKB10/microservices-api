module.exports = function (app) {

  // Import required frameworks and files
  const bodyParser = require('body-parser');
  const apiController = require("./../controllers/apiController");
  const patientsController = require("./../controllers/patientsController");
  const authenticateUser = require("./../middleware/authenticateUser");

  // Setup parser for POST requests
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //Pre-login Routes:
  app.get("/", apiController.index);
  app.get("/version", apiController.version);

  //Authenticate users to access the below routes
  app.use(authenticateUser.isAuthorized);

  //Post-login Routes:
  app.put("/patients/diseases/:recordnumber", patientsController.patientdiseases);
  app.post("/patients/register", patientsController.patientsignup);
  app.get("/patients/:recordnumber", patientsController.patientlookup);
  app.get("/patients", patientsController.allpatients);
  app.put("/patients/refer/:recordnumber", patientsController.patientreferals);

  

  //EOF
  //FINAL FIXES
};