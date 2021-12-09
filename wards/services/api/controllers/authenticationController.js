// Import required frameworks
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
const DB_URL = "mongodb+srv://Priyanka:F21MPH00348145@clusterf21ao.0n6hd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class authenticationController {

  /**
   * 
   * @param {ObjectID} userid User ID of the requesting user.
   * @param {string} sessiontoken Session token of the user returned from login API.
   */
  static async lookUpSession(userid, sessiontoken) {

    const sessionDocument = null;
    try {          
      await client.connect();
      const db = client.db(DB_NAME);

      const colSessions = db.collection("sessions");

      // Find one document by userid and sessiontoken
      const sessionDocument = await colSessions.findOne({ $and: [{userid:{ $eq: new ObjectID(userid) }}, {sessiontoken:{$eq: sessiontoken}}] });
      return sessionDocument;
    } catch (err) {

      console.log(err.stack);
      res.send(err);
    }
    finally {
      // await client.close();
    }
    return sessionDocument;
  }
}

module.exports = authenticationController;