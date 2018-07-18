app.get('/books/find',function(req,res){
var bookTYPE = req.query.type 
  console.dir(req.query)
  console.log(bookTYPE)
var params = {
  TableName : "Books",
  KeyConditionExpression:"#type = :type",
  ExpressionAttributeNames:{
    "#type":"type"
  },
  ExpressionAttributeValues:{
    ":type":bookTYPE
  }
};
docClient.query(params, function(err, data) {
  if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
  } else {
      console.log("Query succeeded.");
      res.send(data.Items)
      data.Items.forEach(function(book) {
          console.log(book.book_id,book.type,book.lend_time);
      });
  }
});
})

{
    TableName: "Music",
    AttributeDefinitions:[
        {AttributeName: "Genre", AttributeType: "S"},
        {AttributeName: "Price", AttributeType: "N"}
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "GenreAndPriceIndex",
                KeySchema: [
                    {AttributeName: "Genre", KeyType: "HASH"}, //Partition key
                    {AttributeName: "Price", KeyType: "RANGE"}, //Sort key
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
}

app.post('/lend',function(req,res){
    console.dir(req.body);
    var bookTYPE = req.body.type
    var stuID= req.body.stu_id
    var stu_id = stuID;
    var type = bookTYPE;
    console.log(stu_id);
    console.log(bookTYPE);
    
    //res.send(req.body.type)
    var params_b = {
      TableName : "Books",
      KeyConditionExpression:"#type = :type",//对于type值和输入相同的，
      ExpressionAttributeNames:{
        "#type":"type"
      },
      ExpressionAttributeValues:{
        ":type":bookTYPE
      }
    };
  
    docClient.query(params_b, function(err, data1) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded.");
          res.send(data1.Items)
          data1.Items.forEach(function(book) {
              console.log(book.book_id,book.type,book.lend_time);
          });
      }
    });


    app.get('/hotbooks',function(req,res){
        //bookList = new Object();
        var book_list=new Array();
        var params = {
        TableName:"Books",
        ProjectionExpression:"#book_id,#lend_time",
        ExpressionAttributeNames:{
          "#book_id": "book_id",
          "#lend_time":"lend_time"
        }
      };
      console.log("Scanning Stus table.");
      docClient.scan(params,onScan);
      
      function onScan(err, data){
        if(err){
          console.error("Unable to scan.Error JSON:",JSON.stringify(err,null,2));
        }
        else{
          //res.send(data.Items)
          console.log("Scan succeeded.");
          ///////////////////////////////////////////////////
          data.Items.forEach(function(book){
            book_list.unshift(book);//插入数组  
          });
          console.log(book_list)
          //book_list.sort(function(a,b){return b-a});//括号内控制为降序排列
          book_list.sort(compare("lend_time"))//对于book_list.lend_time进行排序
          console.log(book_list)
          res.send(book_list)
        if (typeof data.LastEvaluatedKey != "undefined") {
          console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
        }
      }
      })