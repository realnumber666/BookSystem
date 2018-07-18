var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing books into DynamoDB. Please wait.");

var allBooks = JSON.parse(fs.readFileSync('bookdata.json', 'utf8'));
allBooks.forEach(function(book) {
    var params = {
        TableName: "Books",
        Item: {
            "book_id":  book.book_id,
            "type": book.type,
            "lend_time":book.lend_time,
            "author":book.author,
            "release_date":book.release_date,
            "rating":book.rating,
            "state":book.state,
            "reader":book.reader
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add book", book.book_id, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", book.book_id);
       }
    });
});