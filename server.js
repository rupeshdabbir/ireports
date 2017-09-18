var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "location";
var LOGIN_COLLECTION = "login";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
require('dotenv').config();



// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.get("/markers", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);  
    }
  });
});


/*Login*/
app.post("/login", function(req, res) {

  if (!(req.body.username || req.body.password)) {
    handleError(res, "Invalid user input", "Must provide a username, password.", 400);
  }

  db.collection(LOGIN_COLLECTION).find({ username: req.body.username }).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      // res.status(200).json(docs);  
      // console.log("Docs I got"+JSON.stringify(docs));
      // console.log("password I got"+JSON.stringify(req.body));
      if(docs[0].password === req.body.password){
        res.status(200).json("Success");
      } else {
        handleError(res, "Invalid user input", "Must provide a username, password or email.", 400);
      }
    }
  });
});


app.post("/signup", function(req, res) {

  console.log(req.body);
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  }
  newUser.createDate = new Date();

  // console.log(JSON.stringify(newUser));

  if (!(req.body.username || req.body.password || req.body.email)) {
    handleError(res, "Invalid user input", "Must provide a username, password or email.", 400);
  }

  db.collection(LOGIN_COLLECTION).insertOne(newUser, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to do login.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});



app.post("/contacts", function(req, res) {
  console.log()
  // var newContact = req.body;
  var newMarker = {
    latlng: {
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    title: req.body.title,
    description: req.body.description
  }
  newContact.createDate = new Date();

  // if (!(req.body.firstName || req.body.lastName)) {
  //   handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  // }

  db.collection(CONTACTS_COLLECTION).insertOne(newMarker, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.post("/markers", function(req, res) {
  // var newContact = req.body;
  // newContact.createDate = new Date();
  var newMarker = {
    latlng: {
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    title: req.body.title,
    description: req.body.description
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newMarker, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
        db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
          if (err) {
            handleError(res, err.message, "Failed to get contacts.");
          } else {
            res.status(200).json(docs);  
          }
        });
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});