// Import required frameworks
//test commit
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
// Enter your username, password and cluster URL here
// If you are testing my F21MP, please email me at pkb2@hw.ac.uk
const DB_URL = "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URI>?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class apiController {

  static async index(req, res) {
    try {

      // create response object with welcome text
      var responseObject = {};
      responseObject['message'] = "Welcome to the Patient Management System!";
      responseObject['error'] = "None";
      res.send(responseObject);
    } catch (exception) {
      res.status(500);
      res.send(exception);
    }
  }


	static async version(req, res) {
    try {

      // create response object with welcome text
      var responseObject = {};
      responseObject['message'] = "You are using Patient Management System Version 2";
      responseObject['error'] = "None";
      res.send(responseObject);
    } catch (exception) {
      res.status(500);
      res.send(exception);
    }
  }

  
}

module.exports = apiController;

//test