var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "Books",
    AttributeDefinitions:[
        {AttributeName: "book_id", AttributeType: "S"}
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "BookidIndex",
                KeySchema: [
                    {AttributeName: "book_id", KeyType: "HASH"}, //Partition key
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    "ReadCapacityUnits": 1,"WriteCapacityUnits": 1
                }
            }
        }
    ]
};

dynamodb.updateTable(params, function(err, data) {
    if (err) {
        console.error("Unable to update table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Update table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

