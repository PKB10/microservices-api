const authenticationController = require("./../controllers/authenticationController");

module.exports.isAuthorized = async (req, res, next) => {
    responseObject = {};
    
    //fetch header parameters
    if(req.headers.hasOwnProperty('userid') && req.headers.hasOwnProperty('sessiontoken'))
    {
        userid = req.headers.userid;
        sessiontoken = req.headers.sessiontoken;
    }
    else
    {
        // wrong session details
        responseObject['message'] = "Request denied. See error for details 3.";
        responseObject['error'] = "No session details in request header.";
        res.status(401);
        res.send(responseObject);
        return;
    }


    try {
        var sessionDocument = await authenticationController.lookUpSession(userid, sessiontoken);
        console.log(sessionDocument);
        if(!sessionDocument)
        {
            // wrong session details
            responseObject['message'] = "Request denied. See error for details 2.";
            responseObject['error'] = "Invalid session.";
            res.status(403);
            res.send(responseObject);
        }
        else if(new Date(Date.now()) > sessionDocument.expiry)
        {
            // session timed out
            responseObject['message'] = "Request denied. See error for details 1.";
            responseObject['error'] = "Session expired. Please log in again.";
            res.status(403);
            res.send(responseObject);
        }
        else
        {
            // session found
            return next();
        }
    } catch (err) {
        console.log(err.stack);
        responseObject['message'] = "Request denied. See error for details.";
        responseObject['error'] = err;
        res.status(500);
        res.send(responseObject);
    }
}