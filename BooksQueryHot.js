var AWS = require("aws-sdk");
var express = require('express');
var app = express();

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Querying for type3 book.");

var params = {
    TableName : "Books",
    KeyConditionExpression: "#ty = :t",
    ExpressionAttributeNames:{
        "#ty": "type"
    },
    ExpressionAttributeValues: {
        ":t":"type3"
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log(" -", item.book_id + ": " + item.type);
        });
    }
});

app.get('/', function (req, res) {
    res.send(item.book_id);
 })

var server = app.listen(8002, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})