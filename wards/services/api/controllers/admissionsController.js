// Import required frameworks
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
// Enter your username, password and cluster URL here
// If you are testing my F21MP, please email me at pkb2@hw.ac.uk
const DB_URL = "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URI>?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class admissionsController {

  // Function to admit a patient to a ward  
  static async patientadmission(req, res) 
  {
    
    console.log("Post made - ADMIT");

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";

    // Fetch query parameters
    if(Object.hasOwnProperty.call(req.body, "registeredby") && Object.hasOwnProperty.call(req.body, "patientid") && Object.hasOwnProperty.call(req.body, "doctorid") 
    && Object.hasOwnProperty.call(req.body, "wardid") && Object.hasOwnProperty.call(req.body, "admittedon") && Object.hasOwnProperty.call(req.body, "discharged")
    && Object.hasOwnProperty.call(req.body, "reason") && Object.hasOwnProperty.call(req.body, "deptid"))
    {
        // Fetch query parameter
        var registeredby = req.body.registeredby; 
        var patientid = req.body.patientid;
        var doctorid = req.body.doctorid;
        var wardid = req.body.wardid;
        var admittedon = req.body.admittedon;
        var discharged = req.body.discharged;
        var reason = req.body.reason;
        var deptid = req.body.deptid;
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

    async function run() 
    {
	    try {
	        
            await client.connect();
	         console.log("Connected correctly to server");
	         const db = client.db(DB_NAME);
	
	         // Use the collection "admissions"
             const colAdmissions = db.collection("admissions");

             // Check for duplicate record
            const existingDocument = await colAdmissions.findOne({patientid:{ $eq: req.body.patientid }});

            if(existingDocument)
            {
                // admission already in system
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "A record with this patientid already exists.";
                res.status(409);

                // create patient object and push to response object

                var aObject = {};
                aObject['id'] = existingDocument._id;
                aObject['registeredby'] = existingDocument.registeredby;
                aObject['patientid'] = existingDocument.patientid;
                aObject['doctorid'] = existingDocument.doctorid;
                aObject['wardid'] = existingDocument.wardid;
                aObject['admittedon'] = existingDocument.admittedon;
                aObject['discharged'] = existingDocument.discharged;
                aObject['reason'] = existingDocument.reason;
                aObject['deptid'] = existingDocument.deptid;
                responseObject['admission'] = aObject;
            }
            else
            {
                // create admission document
                let admissionDocument = 
                {
                    "registeredby":req.body.registeredby,
                    "patientid": req.body.patientid,
                    "doctorid": req.body.doctorid,
                    "wardid": req.body.wardid,     
                    "admittedon": new Date(req.body.admittedon),
                    "discharged": req.body.discharged,
                    "reason": req.body.reason,
                    "deptid": req.body.deptid
                                                                                                                                               
                };// "registeredon": new Date(Date.now()) 

                // Insert a single document, wait for promise so we can read it back
                const insertAdmissionDetails = await colAdmissions.insertOne(admissionDocument);
                // Find inserted document
                const findAdmissionDetails = await colAdmissions.findOne({ patientid: { $eq: admissionDocument.patientid } });
                // Print to the console
                console.log(findAdmissionDetails);

                if(!findAdmissionDetails)
                {
                    // Admission could not be created 
                    responseObject['message'] = "Admission failed. See error for details.";
                    responseObject['error'] = "Unable to create admission record.";
                    res.status(500);
                }
                else
                {
                   // All good, admission record ready
                   responseObject['message'] = "Admiited to the ward succesfully";
                    responseObject['error'] = "None.";
                    
                   // create admission object and push to response object
                    var aObject = {};
                    aObject['id'] = findAdmissionDetails._id;
                    aObject['registeredby'] = findAdmissionDetails.registeredby;
                    aObject['patientid'] = findAdmissionDetails.patientid;
                    aObject['doctorid'] = findAdmissionDetails.doctorid;
                    aObject['wardid'] = findAdmissionDetails.wardid;
                    aObject['admittedon'] = findAdmissionDetails.admittedon;
                    aObject['discharged'] = findAdmissionDetails.discharged;
                    aObject['reason'] = findAdmissionDetails.reason;
                    aObject['deptid'] = findAdmissionDetails.deptid;
                    responseObject['admission'] = aObject;
                        
                } 

            }
                  
        }
        catch (err) 
        {
	         console.log(err.stack);
             res.status(500);
             res.send(err);
	    }
	    finally 
        {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
  }
  


  // Function to lookup an admission to a ward by recordnumber
  static async admissionlookup(req, res) 
  {
    
    console.log("Get made - ADMISSION");

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";

    // Fetch query parameter
    if(req.params.hasOwnProperty('recordnumber'))
    {
        var recordnumber = req.params.recordnumber; 
    }
    else
    {
        // missing parameter details
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = "Missing record number in request parameters. (example: /wards/admissions/<RECORD_NUMBER>)";
        res.status(400);
        res.send(responseObject);
        return;
    }



    async function run() {
	    try 
        {
	        
            await client.connect();
	         console.log("Connected correctly to server");
	         const db = client.db(DB_NAME);
	
	         // Use the collection "patients", "sessions"
	         const colPatients = db.collection("patients");
             const colSessions = db.collection("sessions");
             const colAdmissions = db.collection("admissions");
             const colDepartment = db.collection("departments");
             const colWard = db.collection("wards");

            
        
            // session found 
            // Find document by recordnumber
            const patientDocument = await colPatients.findOne({_id:{ $eq: new ObjectID(req.params.recordnumber) }});
            if(!patientDocument)
            {
                // record not found
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error'] = "A record with this number does not exist in the system.";
                res.status(404);
            }
            else
            {
                // record found
                responseObject['message'] = "Request successful.";
                responseObject['error'] = "None.";

                // create patient object and push to response object
                var patientObject = {};
                patientObject['recordnumber'] = patientDocument._id;
                patientObject['email'] = patientDocument.email;
                patientObject['name'] = patientDocument.name;
                patientObject['gender'] = patientDocument.gender;
                patientObject['birthdate'] = patientDocument.birthdate;
                patientObject['diseases'] = patientDocument.diseases;
                patientObject['allergies'] = patientDocument.allergies;
                patientObject['deptid'] = colDepartment._id;
                patientObject['deptname'] = colDepartment.deptname;
                patientObject['wardid'] = colWard._id;
                patientObject['wardname'] = colWard.name;
                responseObject['patient'] = patientDocument;

            }    
        }
	   // }
        catch (err) 
        {
            res.status(500);
            res.send(err);
	         console.log(err.stack);
	    }
	    finally {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
    
  }

  // Function to lookup a list of all admissions
  static async alladmissions(req, res) {

    console.log("Get made - ADMISSIONS");
    
    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error']   = "None";

    async function run() 
    {
	    try 
        {
            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);

            // Use the collection "admissions"
            const colAdmissions = db.collection("admissions");

            // Find documents
            const admissionsDocuments = await colAdmissions.find().toArray();
            console.log(admissionsDocuments);
            if(!admissionsDocuments)
            {
                // not found, something is VERY wrong!
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "No records found in the system. Contact system admin ASAP.";
                res.status(404);
            }
            else if (admissionsDocuments.length > 0)
            {
                // record found
                responseObject['message'] = "Request successful.";
                responseObject['error']   = "None.";

                // push to response object
                responseObject['admissions']  = admissionsDocuments;
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

  // Function to lookup a list of all wards
  static async allwards(req, res) 
  {

    console.log("Get made - WARDS");
    
    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error']   = "None";

    async function run() 
    {
	    try 
        {
            await client.connect();
            console.log("Connected correctly to server");
            const db = client.db(DB_NAME);

            // Use the collection "admissions"
            const colWards = db.collection("wards");

            // Find documents
            const wardsDocuments = await colWards.find().toArray();
            console.log(wardsDocuments);
            if(!wardsDocuments)
            {
                // not found, something is VERY wrong!
                responseObject['message'] = "Request failed. See error for details.";
                responseObject['error']   = "No records found in the system. Contact system admin ASAP.";
                res.status(404);
            }
            else if (wardsDocuments.length > 0)
            {
                // record found
                responseObject['message'] = "Request successful.";
                responseObject['error']   = "None.";

                // push to response object
                responseObject['wards']  = wardsDocuments;
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
}

module.exports = admissionsController;
