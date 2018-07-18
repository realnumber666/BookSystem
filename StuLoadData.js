var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing students into DynamoDB. Please wait.");

var allStus = JSON.parse(fs.readFileSync('studata.json', 'utf8'));
allStus.forEach(function(stu) {
    var params = {
        TableName: "Stus",
        Item: {
            "stu_id":  stu.stu_id,
            "book": stu.lend_book,
            "number":stu.lend_number,
            
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add student", stu.stu_id, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", stu.stu_id);
       }
    });
});