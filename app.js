//var createError = require('http-errors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-Parser');
var logger = require('morgan');
var AWS = require("aws-sdk");
var redis = require("redis");
//client = redis.createClient(6379,"127.0.0.1");
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// var server = app.listen(3000,function(){
//   var host = server.address().address
//   var port = server.address().port
// });
app.listen(3000);

AWS.config.update({
  region:"us-west-2",
  endpoint:"http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');

// app.get('/',function(req,res){
//   res.send({title:"Books API Entry Point"})
// })

app.get('/books',function(req,res){
  var params = {
  TableName:"Books",
  ProjectionExpression:"#id,#type,#lend_time,#author,#release_date,#rating",
  ExpressionAttributeNames:{
    "#id": "book_id",
    "#type": "type",
    "#lend_time": "lend_time",
    "#author": "author",
    "#release_date": "release_date",
    "#rating": "rating"
  }
};
console.log("Scanning Books table.");
docClient.scan(params,onScan);

function onScan(err, data){
  if(err){
    console.error("Unable to scan.Error JSON:",JSON.stringify(err,null,2));
  }
  else{
    res.send(data)
    console.log("Scan succeeded.");
    data.Items.forEach(function(book){
      console.log(book.book_id,book.type,book.lend_time)
    });
  if (typeof data.LastEvaluatedKey != "undefined") {
    console.log("Scanning for more...");
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    docClient.scan(params, onScan);
  }
  }
}
})

app.get('/students',function(req,res){
  var params = {
  TableName:"Stus",
  ProjectionExpression:"#id,#book,#number",
  ExpressionAttributeNames:{
    "#id": "stu_id",
    "#book":"book",
    "#number":"number"
  }
};
console.log("Scanning Stus table.");
docClient.scan(params,onScan);

function onScan(err, data){
  if(err){
    console.error("Unable to scan.Error JSON:",JSON.stringify(err,null,2));
  }
  else{
    res.send(data.Items)
    console.log("Scan succeeded.");
    data.Items.forEach(function(stu){
      console.log(stu.stu_id,stu.book,stu.number)
    });
  if (typeof data.LastEvaluatedKey != "undefined") {
    console.log("Scanning for more...");
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    docClient.scan(params, onScan);
  }
  }
}
})


app.get('/books/findtype',function(req,res){
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
          //res.send(book.book_id+"  "+book.type)
          console.log(book.book_id,book.type,book.lend_time);
      });
  }
});
})

app.get('/books/findid',function(req,res){
  var bookID = req.query.bookid 
    console.dir(req.query)
    console.log(bookID)
  var params = {
    TableName : "Books",
    IndexName:"BookidIndex",
    KeyConditionExpression:"#book_id = :book_id",
    ExpressionAttributeNames:{
      "#book_id":"book_id"
    },
    ExpressionAttributeValues:{
      ":book_id":bookID
    }
  };
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query id. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query id succeeded.");
        res.send(data.Items)
        data.Items.forEach(function(book) {
            console.log(book.book_id,book.type,book.lend_time);
        });
    }
  });
  })

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

  // var params_b_1 = {
  //   TableName :"Books",
  //   Key:{
  //     "type":type,
  //   },
  //   UpdateExpression:"set #state = :vall,#reader = list_append(#reader,:r)",
  //   //ConditionExpression:"stu_id = :stu_id ",
  //   ExpressionAttributeNames:{
  //     "#state" : "state",
  //     "#reader": "reader"
  //   },
  //   ExpressionAttributeValues:{
  //     ":vall" :1,
  //     ":r":[stuID]
  //   },
  //   ReturnValus:"UPDATED_NEW"
  // };
  // console.log("Updating the book1...");
  // docClient.update(params_b_1, function(err, data2) {
  //     if (err) {
  //         console.error("Unable to update book1. Error JSON:", JSON.stringify(err, null, 2));
  //     } else {
  //         console.log("UpdateBook1 succeeded:", JSON.stringify(data2, null, 2));
  //     }
  // });
  
  var params_s = {
    TableName :"Stus",
    Key:{
      "stu_id":stuID
    },
    UpdateExpression:"set #number =#number+ :val ,#book = list_append(#book,:b)",
    //ConditionExpression:"stu_id = :stu_id ",
    ExpressionAttributeNames:{
      "#number" : "number",
      "#book" : "book"
    },
    ExpressionAttributeValues:{
      ":val" :1,
      ":b":[bookTYPE]
    },
    ReturnValus:"UPDATED_NEW"
  };
  console.log("Updating the student...");
  docClient.update(params_s, function(err, data3) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data3, null, 2));
      }
  });
  //res.send(lend_number)
  

})

app.get('/students/find',function(req,res){
  var stuID = req.query.stuid
    console.dir(req.query)
    console.log(stuID)
  var params = {
    TableName : "Stus",
    KeyConditionExpression:"#stu_id=:stu_id",
    ExpressionAttributeNames:{
      "#stu_id":"stu_id"
    },
    ExpressionAttributeValues:{
      ":stu_id":stuID
    }
  };
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        res.send(data.Items)
        data.Items.forEach(function(student) {
            console.log(student.stu_id);
        });
    }
  });
})

/////////////////////////HOT_BOOKS//////////////////////////////
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

app.post('/add_member',function(req,res){
  console.dir(req.body);
  var stuID = req.body.stu_id
  console.log(stuID);

  var param = {
    TableName:"Stus",
    Item:{
      "stu_id": stuID,
      "number":0,
      "book":[]

    }
  };
  console.log("Adding a new students.... ")
  docClient.put(param,function(err,data){
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    res.send( "Add Successfully!")
      console.log("Added item:", JSON.stringify(data, null, 2));
  }
  })
})
app.get('/recommend',function(req,res){
  var stuID = req.query.stuid
    console.dir(req.query)
    console.log(stuID)
  var params_stu = {
    TableName:"Stus",
    //ProjectionExpression:"#s"
    KeyConditionExpression:"#id = :id",
    ExpressionAttributeNames:{
      "#id":"stu_id"
    },
    ExpressionAttributeValues:{
      ":id":stuID
    }
  };
  /////////////////寻找输入stu_id学生所对应的typeTop//////////////////////
  docClient.query(params_stu, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        //res.send(data.Items)
        data.Items.forEach(function(student) {
          bookTYPE = student.book[0];
          var rBook = {
            TableName:"Books",
            KeyConditionExpression:"#type= :type",
            ExpressionAttributeNames:{
              "#type":"type",
            },
            ExpressionAttributeValues:{
              ":type":bookTYPE
            }
          };
          docClient.query(rBook,function(err,data){
            if(err){
              console.error("fail to recommend books",JSON.stringify(err,null,2));
            }else{
              console.log("successful to recommend books");
              data.Items.forEach(function(rbook){
                res.send(data.Items)
              })
            }
          })
            console.log(student.book[0]);
        });
    }
  })
})

///////////////////Sort/////////////////////
function compare(pro) { 
  return function (obj1, obj2) { 
      var val1 = obj1[pro]; 
      var val2 = obj2[pro]; 
      if (val1 < val2 ) { //正序
          return 1; 
      } else if (val1 > val2 ) { 
          return -1; 
      } else { 
          return 0; 
      } 
  } 
} 

