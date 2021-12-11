// Import required frameworks
//test comment for CI
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
// Enter your username, password and cluster URL here
// If you are testing my F21MP, please email me at pkb2@hw.ac.uk
const DB_URL = "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URI>?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class patientsController {
  
  // Function to register a new patient
  static async patientsignup(req, res) {

    console.log("Post made - REGISTER");

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error']   = "None";
    
    // Fetch query parameters
    if(Object.hasOwnProperty.call(req.body, "userid") && Object.hasOwnProperty.call(req.body, "firstname") && Object.hasOwnProperty.call(req.body, "lastname") 
    && Object.hasOwnProperty.call(req.body, "email") && Object.hasOwnProperty.call(req.body, "birthdate") && Object.hasOwnProperty.call(req.body, "gender")
    && Object.hasOwnProperty.call(req.body, "diseases") && Object.hasOwnProperty.call(req.body, "allergies") && Object.hasOwnProperty.call(req.body, "wardnumber"))
    {
        var userid = req.body.userid;
        var patientfirstname = req.body.firstname;
        var patientlastname = req.body.lastname;
        var patientemail = req.body.email;
        var patientbirthdate = req.body.birthdate;
        var patientgender = req.body.gender;
        var patientdiseases = req.body.diseases;
        var patientallergies = req.body.allergies;
        var patientward = req.body.wardnumber;
    }
    else
    {
        // missing parameter details
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = "Missing details in request body.";
        res.status(400);
        res.send(responseObject);
        return;
    }

    async function run() {
	    try {

            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);
	
            // Use the collection "patients", "users"
            const colPatients = db.collection("patients");
            const colUsers = db.collection("users");

            // Check access level by userid
            const accessDocument = await colUsers.findOne({_id:{ $eq: new ObjectID(userid) }});
            if(!accessDocument)
            {
                // wrong user details
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "Cannot find user.";
                res.status(404);
            }
            else
            {
                if(accessDocument.accesslevel != "Clerk")
                {
                    // wrong access level
                    responseObject['message'] = "Request denied. See error for details.";
                    responseObject['error'] = "Access forbidden. Only users with 'Clerk' access level are authorized to make this change.";
                    res.status(401);
                }
                else
                {
                    // access allowed 
                    // Check for duplicate record
                    const existingDocument = await colPatients.findOne({email:{ $eq: req.body.email }});
                    if(existingDocument)
                    {
                        // email already in system
                        responseObject['message'] = "Request denied. See error for details.";
                        responseObject['error']   = "A record with this email address already exists.";
                        res.status(409);

                        // create existing patient object and push to response object
                        var patientObject = {};
                        patientObject['recordnumber'] = existingDocument._id;
                        patientObject['email']        = existingDocument.email;
                        patientObject['name']         = existingDocument.name;
                        patientObject['gender']       = existingDocument.gender;
                        patientObject['birthdate']    = existingDocument.birthdate;
                        patientObject['diseases']     = existingDocument.diseases;
                        patientObject['allergies']    = existingDocument.allergies;
                        responseObject['patient']     = patientObject;
                    }
                    else
                    {
                        // create patient document
                        let patientDocument = 
                        {
                            "name": { "first": patientfirstname, "last": patientlastname },
                            "email": patientemail,
                            "birthdate": new Date(patientbirthdate),
                            "gender": patientgender,
                            "diseases": patientdiseases,
                            "allergies": patientallergies,
                            "registeredby": userid,
                            "registeredon": new Date(Date.now()),
                            "wardnumber": new ObjectID(patientward)                                                                                                                            
                        };

                        // Insert a single document, wait for promise so we can read it back
                        const insertPatient = await colPatients.insertOne(patientDocument);

                        // Find inserted document
                        const findPatient = await colPatients.findOne({ email: { $eq: patientDocument.email } });
                        // Print to the console
                        console.log(findPatient);

                        if(!findPatient)
                        {
                            // Session could not be created 
                            responseObject['message'] = "Registration failed. See error for details.";
                            responseObject['error']   = "Unable to create patient record.";
                            res.status(500);
                        }
                        else
                        {
                            // All good, patient record ready
                            responseObject['message'] = "Registration successful.";
                            responseObject['error']   = "None.";
                
                            // create patient object and push to response object
                            var patientObject = {};
                            patientObject['recordnumber'] = findPatient._id;
                            patientObject['email']        = findPatient.email;
                            patientObject['name']         = findPatient.name;
                            patientObject['gender']       = findPatient.gender;
                            patientObject['birthdate']    = findPatient.birthdate;
                            patientObject['diseases']     = findPatient.diseases;
                            patientObject['allergies']    = findPatient.allergies;
                            responseObject['patient']     = patientObject;
                    
                        } 

                    }

                    
                }
                
            }

	    }
        catch (err) 
        {
            res.status(500);
            res.send(err);
	        console.log(err.stack);
	    }
	    finally 
        {
            // commentated because it causes issues in request reloads
	        // await client.close();
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
    
  }

  // Function to lookup a patient by recordnumber
  static async patientlookup(req, res) {

    console.log("Get made - PATIENT");

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error']   = "None";
    
    // Fetch query parameter
    if(req.params.hasOwnProperty('recordnumber'))
    {
        var recordnumber = req.params.recordnumber; 
    }
    else
    {
        // missing parameter details
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = "Missing patient record number in request parameters. (example: /patients/<PATIIENT_RECORD_NUMBER>)";
        res.status(400);
        res.send(responseObject);
        return;
    }

    async function run() {
	    try {

            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);

            // Use the collection "patients", "sessions", "services"
            const colPatients = db.collection("patients");
            const colServices = db.collection("services");
            const colUsers    = db.collection("users");

            // access allowed 
            // Find document by recordnumbers
            const patientDocument = await colPatients.findOne({_id:{ $eq: new ObjectID(recordnumber) }});
            console.log(patientDocument);
            if(!patientDocument)
            {
                // record not found
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "A record with this number does not exist in the system.";
                res.status(404);
            }
            else
            {
                // record found
                responseObject['message'] = "Request successful.";
                responseObject['error']   = "None.";

                //append patient refarals details to response object
                var referals = {};
                if(patientDocument.referals) {
                    
                    if(patientDocument.referals.services){
                        //performing the map function cause services is an array
                        var serviceIds = patientDocument.referals.services.map(function(id) { return ObjectID(id); });
                        var services = await colServices.find({_id: {$in: serviceIds}}).toArray();

                        console.log(services);
                        referals["services"] = services;
                    }
                    if(patientDocument.referals.referedby) {
                        var referby = await colUsers.findOne({_id: {$eq: ObjectID(patientDocument.referals.referedby)}});

                        if(referby) {
                            referals["referedby"] = referals["referedby"] = {
                                name : referby.name,
                                _id:   referby._id
                            };
                        }
                    }
                }

            //     // create patient object and push to response object
            //     var patientObject = {};
            //     patientObject['recordnumber'] = patientDocument._id;
            //     patientObject['email']        = patientDocument.email;
            //     patientObject['name']         = patientDocument.name;
            //     patientObject['gender']       = patientDocument.gender;
            //     patientObject['birthdate']    = patientDocument.birthdate;
            //     patientObject['diseases']     = patientDocument.diseases;
            //     patientObject['allergies']    = patientDocument.allergies;
            //     patientObject['referals']     = referals;
            //     responseObject['patient']     = patientObject;
            // }
            
               //retrieve admissions details.
               const colAdmissions = db.collection("admissions");
               const admissionDocument = await colAdmissions.findOne({patientid:{ $eq: recordnumber }});
               var admissions = {};

               //if patient is admitted
               if(admissionDocument) {
                   const colWards = db.collection("wards");
                   const wardDocument = await colWards.findOne({_id: {$eq: ObjectID(admissionDocument.wardid)}});
                   console.log(wardDocument);
                   //if ward is found
                   if(wardDocument) {
                       admissions["ward"] = wardDocument.name;
                       console.log(wardDocument.name);
                   }

                   //if patient belongs to a department (doesn't belong to a special ward.)
                   if(admissionDocument.deptid) {
                       const colDepartments = db.collection("departments");
                       const deptDocument = await colDepartments.findOne({_id: {$eq: ObjectID(admissionDocument.deptid)}});
                       if(deptDocument) {
                           admissions["department"] = deptDocument.deptname;
                       }
                   }
               }

               // create patient object and push to response object
               var patientObject = {};
               patientObject['recordnumber'] = patientDocument._id;
               patientObject['email'] = patientDocument.email;
               patientObject['name'] = patientDocument.name;
               patientObject['gender'] = patientDocument.gender;
               patientObject['birthdate'] = patientDocument.birthdate;
               patientObject['diseases'] = patientDocument.diseases;
               patientObject['allergies'] = patientDocument.allergies;
               patientObject['referals'] = referals;
               patientObject['admissions'] = admissions;
               responseObject['patient'] = patientObject;
            } 

	    }
        catch (err) 
        {
            res.status(500);
            responseObject['message'] = "Request failed. See error for details.";
            responseObject['error']   = "Invalid Request.";
	        console.log(err.stack);
	    }
	    finally 
        {
            // commentated because it causes issues in request reloads
	        // await client.close();
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
  }

  // Function to lookup a list of all patients
  static async allpatients(req, res) {

    console.log("Get made - PATIENTS");
    
    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error']   = "None";

    async function run() {
	    try {
            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);

            // Use the collection "patients", "users", "services"
            const colPatients = db.collection("patients");

            // Find document by recordnumber
            const patientDocuments = await colPatients.find().toArray();
            console.log(patientDocuments);
            if(!patientDocuments)
            {
                // not found, something is VERY wrong!
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "No records found in the system. Contact system admin ASAP.";
                res.status(404);
            }
            else if (patientDocuments.length > 0)
            {
                // record found
                responseObject['message'] = "Request successful.";
                responseObject['error']   = "None.";

                // create patients object and push to response object
                responseObject['patients']  = patientDocuments;
            }
            else
            {
                // 0 records found, something is VERY wrong!
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "No records found in the system. Contact system admin ASAP.";
                res.status(404);
            }

	    }
        catch (err) 
        {
            res.status(500);
            responseObject['message'] = "Request failed. See error for details.";
            responseObject['error']   = "Invalid Request.";
	        console.log(err.stack);
	    }
	    finally 
        {
            // commentated because it causes issues in request reloads
	        // await client.close();
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
  }

  // Function to update a patient's referral details by recordnumber
  static async patientreferals(req, res) {

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";
    
    // Fetch query parameter
    if(Object.hasOwnProperty.call(req.body, "referedby") && Object.hasOwnProperty.call(req.body, "services") && Object.hasOwnProperty.call(req.params, "recordnumber"))
    {
        var referedby = req.body.referedby; 
        var services = req.body.services;
        var recordnumber = req.params.recordnumber; 
    }
    else
    {
        // missing parameter details
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = "Missing details in request body.";
        res.status(400);
        res.send(responseObject);
        return;
    }

    async function run() {
	    try {
	        
            await client.connect();
	        const db = client.db(DB_NAME);
	
            // Use the collection "patients"
            const colPatients = db.collection("patients");

            //create referals object
            var referals = {
                "referedby" : referedby,
                "services": services
            }

            //find and update the patient document with referals details
            const patientDocument = await colPatients.findOneAndUpdate(
                { _id: ObjectID(recordnumber)},
                {$set: {"referals": referals}},
                {returnNewDocument:true}
            );

            if(!patientDocument)
            {
                // record not found
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "A record with this number does not exist in the system.";
                res.status(404);
            }
            else
            {
                //return success
                responseObject['message'] = "Request successful.";
                responseObject['error']   = "None.";
            }
	    }
        catch (err) {
            res.status(500);
	        console.log(err.stack);
	    }
	    finally {
	        // await client.close();
	    }

        // send response object
        res.send(responseObject);
    }

    run().catch(console.dir);
  }

   // Function to update a patient's diseases details by recordnumber
   static async patientdiseases(req, res) {

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";
    
    // Fetch query parameter
    if(Object.hasOwnProperty.call(req.body, "diseases") && Object.hasOwnProperty.call(req.params, "recordnumber"))
    {
        var diseases = req.body.diseases; 
        var recordnumber = req.params.recordnumber; 
    }
    else
    {
        // missing parameter details
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = "Missing details in request body.";
        res.status(400);
        res.send(responseObject);
        return;
    }

    async function run() {
        try {
            
            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);
    
            // Use the collection "patients"
            const colPatients = db.collection("patients");
 
            
                console.log(recordnumber);
                //find and update the patient document with referals details
                const patientDocument = await colPatients.findOneAndUpdate(
                    { _id: ObjectID(recordnumber)},
                    { $push: { diseases: { $each: diseases } } },
                    {returnNewDocument:true}
                );
 
                console.log(patientDocument.diseases);
                console.log(patientDocument.email);
                if(!patientDocument)
                {
                    // record not found
                    responseObject['message'] = "Request failed. See error for details.";
                    responseObject['error'] = "A record with this number does not exist in the system.";
                    res.status(404);
                }
                else
                {
                    //return success
                    responseObject['message'] = "Request successful.";
                    responseObject['error'] = "None.";
                }            
            
        }
        catch (err) {
            console.log(err.stack);
            res.status(500);
            res.send(err);
        }
        finally {
            //await client.close();
            
        }
 
        // send response object
        res.send(responseObject);
    }

    run().catch(console.dir);
  }
  
}


module.exports = patientsController;