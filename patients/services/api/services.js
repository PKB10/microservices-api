// Import required frameworks 
const express = require('express');
const app = express();


// Use routes
require("./routes/routes.js")(app);

// Set application listening port
const port = 8081;
app.listen(port, () => {

    console.log(`Task API app is listening at http://localhost:${port}`);

});

module.exports = app;