var express = require("express");
var https = require("https");
var bodyparser = require("body-parser");
var path = require("path");
var mongo = require("mongodb");

var myDBClient = mongo.MongoClient;
var myDBUrl = process.env.mongodb_url;
var objectId = mongo.ObjectID;
var app = express();

app.listen(process.env.PORT,process.env.IP);

app.use(express.static(path.resolve(__dirname, 'views')));
app.use(express.cookieParser(process.env.cookie_secret_key));
app.use(express.session());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');



app.get("/",function(req,res){
    if(req.session.username)
        res.redirect("/allbooks");
   else
        res.render("index",{page:0,login:false});
});

app.get("/login",function(req,res){
    if(req.session.username)
        res.redirect("/mybooks");
   else
        res.render("index",{page:2,login:false});
});

app.post("/login",function(req,res){
   checkUser(req,res);
});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/register",function(req, res) {
    if(req.session.username)
        res.redirect("/");
   else
        res.render("index",{page:3,login:false});
});


app.post("/register",function(req, res) {
   insertUser(req,res);
});


app.get("/allbooks",function(req,res){
    allbooks(req,res);
});

app.get("/mybooks",function(req,res){
    if(req.session.username)
        myBooks(req,res);   
   else
        res.redirect("/");
});

app.get("/myprofile",function(req,res){
    if(req.session.username)
        retrieveProfile(req,res);
    else
       res.redirect("/");  
});

app.post("/myprofile",function(req,res){
  updateProfile(req,res);  
});

app.get("/book/:id",function(req, res) {
    retrievebook(req,res);
});

app.post("/book/:id",function(req, res) {
    updateTradeOffers(req,res);
});

app.get("/add",function(req,res){
        if(req.session.username)
        res.render("index",{page:7,login:true,username:req.session.username});
   else
        res.redirect("/mybooks");
});

app.post("/add",function(req,res){
    searchAndRetrieve(req,res);
});

app.post("/addbook",function(req, res) {
    console.log(req.body);
    insertBooks(req,res);
});

app.get("/outrequests",function(req,res){
        if(req.session.username)
            retrieveMyRequests(req,res);
   else
        res.redirect("/");
});

app.get("/inrequests",function(req,res){
    if(req.session.username)
        retrieveTradeOffers(req,res);
    else
        res.redirect("/");
});
app.get("/imagesearch/:id",function(req,res){
    searchAndRetrieve(req,res);
});

app.post("/tradeBook",function(req,res){
    if(req.session.username){
        if(req.body.accept)
            tradeAccept(req,res);
        else
            tradeReject(req,res);
    }else
    res.redirect("/");
});

function insertUser(req,res){

       myDBClient.connect(myDBUrl, function(err, db) {
        if (err)
            console.log('Unable to connect to the mongoDB server. Error:', err);
        else {
             var myCol = db.collection('user');
             var myCol2 = db.collection('user');
             myCol.find({username:req.body.uName}).toArray(function(e,d){
                if (e) console.log("err"+e);
                else if(d.length){
                    console.log("rendering");
                      res.render("index",{
                          page:3,
                          login:false,
                          alert:1
                       });
                    db.close();
                   }else{
                       console.log("inserting");
                myCol2.insert({
                   username:req.body.uName,
                   firstname:"",
                   lastname:"",
                   password:req.body.pass1,
                   mail:"",
                   city:"",
                   state:"",
                   country:"",
                   inrequests:[],
                   outrequest:[]
                }, function(error, response) {
                    if (error)
                        console.log("er" + error);
                    res.redirect("/login");
                 db.close();
                });   
                   }
             });

            }


    });
}


function checkUser(req,res) {
  myDBClient.connect(myDBUrl, function(err, db) {
        if (err)
            console.log('Unable to connect to the mongoDB server. Error:', err);
        else {
             var myCol = db.collection('user');
             myCol.find({username:req.body.uName,
                         password:req.body.pass
             }).toArray(function(e,d){
                if (e) console.log("err"+e);
                else if(d.length){
                      req.session.username = req.body.uName;
                      res.redirect("/mybooks");
                    db.close();
                   }else{
                      res.render("index",{
                          page:2,
                          login:false,
                          alert:2
                       });
                    db.close(); 
                   }
             });
        }
        });
}
function searchAndRetrieve(req,res){
    var url = "https://fcc-image-search-project.herokuapp.com/api/imagesearch/"+req.params.id;

    https.get(url, function(rs) {
            console.log(`Got response: ${rs.statusCode}`);
            var body =[];
            
            rs.on('data', function(d) {
                body += d;
            });

            rs.on('end', function() {
                var parsed = JSON.parse(body);
             res.send(parsed);
             });
                    
        rs.resume();
        
    }).on('error', function (e) {
                console.log(`Got error: ${e.message}`);
          });
    
}

function insertBooks(req,res){
    console.log(req.body.book_author.split(/_/));
   myDBClient.connect(myDBUrl, function(err, db) {
        if (err)
            console.log('Unable to connect to the mongoDB server. Error:', err);
        else {
             var myCol = db.collection('book');

                myCol.insert({
                   owner:req.session.username,
                   bookname:req.body.book_author.split(/_/)[0],
                   author:req.body.book_author.split(/_/)[1],
                   url:req.body.url,
                   tradeOffers:[],
                   tradeFlag:false
                }, function(error, response) {
                    if (error)
                        console.log("er" + error);
                    res.redirect("/mybooks");
                 db.close();
                });   


            }


    });
}

function myBooks(req,res){
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        var tempArr =[];
        myCol.find({
                "owner":req.session.username
            }).toArray(function(e,d){
                if(e) throw(e);
                else if(d.length){
                    for(var i=0;i<d.length;i++){
                        tempArr.push(d[i]);
                    }
                    res.render("index",{page:5,login:true,username:req.session.username,books:tempArr});
                }else{
                    console.log("no book");
                    res.render("index",{page:5,login:true,username:req.session.username});
                }                
                    
                });
    
        db.close();
    }); 
}

function allbooks(req,res){
   myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        var temp =[];
        myCol.find().toArray(function(e,d){
                if(e) throw(e);
                else if(d.length){
                    console.log(d);

                for(var i=0;i<d.length;i++){
                      temp.push(d[i]);
                }
                 if(req.session.username)
                     res.render("index",{page:1,login:true,username:req.session.username,books:temp});
                 else
                     res.render("index",{page:1,login:false,books:temp});
                }else{
                    console.log("no book");
                  if(req.session.username)
                     res.render("index",{page:1,login:true,username:req.session.username});
                 else
                     res.render("index",{page:1,login:false});
                }    
                });
    
        db.close();
    });   
}
function retrievebook(req,res){
     var tempStr = req.params.id.toString();
        myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        var myCol2 = db.collection('book');
        myCol.find({
            "_id":objectId(tempStr)
        }).toArray(function(e, d) {
            if (e) throw(e);
            else if (d.length) {
                console.log(d);
                if(req.session.username){
                        var tempArr =[];
                                myCol2.find({
                                "owner":req.session.username,
                                "tradeFlag":false
                            }).toArray(function(ee,dd){
                                if(ee) throw(ee);
                                else if(dd.length){
                                        for(var i=0;i<dd.length;i++){
                                            tempArr.push(dd[i]);
                                        }
                                res.render("index",{page:6,login:true,username:req.session.username,book:d[0],userbooks:tempArr});
                                }else{
                                res.render("index",{page:6,login:true,username:req.session.username,book:d[0],userbooks:tempArr});   
                                }
                            });
                }else
                    res.render("index",{page:6,login:false,book:d[0]});
            }
        db.close();
        });
   });
}

function updateTradeOffers(req,res){
         var tempStr = req.params.id.toString();
       myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        myCol.update( { "bookname":req.body.tradingBook},
                {   $addToSet: { "tradeOffers": {bookId:objectId(tempStr),
                                                 owner:req.session.username,
                                                 bookname:req.body.reqBookName,
                                                 author:req.body.reqBookAuthor,
                                                 url: req.body.reqBookUrl
                }}},
                { upsert: true } );
              res.redirect("/allbooks");
            
              db.close();
       });
}



function updateProfile(req,res){

       myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('user');
        myCol.update( {  "username":req.session.username},
                {   $set: { 
                "firstname":req.body.fName,
                "lastname":req.body.lName,
                "mail":req.body.mail,
                "city":req.body.city,
                "state":req.body.state,
                "country":req.body.country
                }},
                { upsert: true } );
              res.redirect("/myprofile");
            
              db.close();
       });
}
function retrieveProfile(req,res){
       myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('user');
        myCol.find({"username":req.session.username}).toArray(function(e,d){
            if(e) throw(e);
            if(d.length){
            res.render("index",{page:8,login:true,username:req.session.username,info:d[0]});  
            }
        });
        db.close();
       });
    
}

function retrieveTradeOffers(req,res){
    var tempArr=[];
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        myCol.find({"owner":req.session.username, 
        'tradeOffers': { $gt: [] }
            
        }).toArray(function(e,d){
            if(e) throw(e);
            if(d.length){
                var i =0;
                    do{
                     tempArr.push( d[i].tradeOffers.map(function(obj){
                        return Object.assign(obj,{myBookName:d[i].bookname,myBookId:d[i]._id})}));
                    i++;
                    }while(i<d.length);
                res.render("index",{page:10,login:true,username:req.session.username,tradeOffers:tempArr});
            }else{
                res.render("index",{page:10,login:true,username:req.session.username});
            }
        });
        db.close();
       });
}

function retrieveMyRequests(req,res){
    var tempArr=[];
        myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
        myCol.find(
             { tradeOffers: { "$elemMatch": { "owner":{  "$eq": req.session.username.toString()}, "tradeFlag":{  "$eq": false} }} }
            
            ).toArray(function(e,d){
                if(d.length){
                   var i =0;
                    do{
                    tempArr.push( d[i].tradeOffers.map(function(obj){
                        return Object.assign(obj,{wantedBookName:d[i].bookname,wantedBookId:d[i]._id,wantedBookOwner:d[i].owner,wantedBookUrl:d[i].url})}));
                    i++;
                    }while(i<d.length);
                    res.render("index",{page:9,login:true,username:req.session.username,tradeRequests:tempArr});
                }else{
                    res.render("index",{page:9,login:true,username:req.session.username});    
                }
        });
        
        db.close();
        });
}

function tradeAccept(req,res){
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');
     myCol.find( {"_id": {$in: [objectId(req.body.myBookId),objectId(req.body.offeringBookId)]}}).toArray( function (e,d) {

    var temp = d[0].owner;
    d[0].owner  =d[1].owner;
    d[1].owner = temp;
    d[0].tradeFlag=d[1].tradeFlag=true;
    d[1].tradeOffers = d[0].tradeOffers =[];

    myCol.update( {"_id": {$in: [objectId(req.body.myBookId)]}}, { 
            $set: { 
                "owner":d[0].owner,
                "bookname":d[0].bookname,
                "author":d[0].author,
                "url":d[0].url,
                "tradeOffers":d[0].tradeOffers,
                "tradeFlag":d[0].tradeFlag
                }},
                { upsert: true });
    myCol.update( {"_id": {$in: [objectId(req.body.offeringBookId)]}}, { 
            $set: { 
                "owner":d[1].owner,
                "bookname":d[1].bookname,
                "author":d[1].author,
                "url":d[1].url,
                "tradeOffers":d[1].tradeOffers,
                "tradeFlag":d[1].tradeFlag
                }},
                { upsert: true } );
    res.redirect("/mybooks");
    db.close();

});
    });  
}

function tradeReject(req,res){
    myDBClient.connect(myDBUrl, function(err, db) {
        if (err) {
            console.log(err);
        }
        var myCol = db.collection('book');

     myCol.find( {"_id": {$in: [objectId(req.body.myBookId),objectId(req.body.offeringBookId)]}}).toArray( function (e,d) {

        d[1].tradeOffers=d[0].tradeOffers =[];

        myCol.update( {"_id": {$in: [objectId(req.body.myBookId)]}}, { 
                    $set: { 
                        "owner":d[0].owner,
                        "bookname":d[0].bookname,
                        "author":d[0].author,
                        "url":d[0].url,
                        "tradeOffers":d[0].tradeOffers,
                        "tradeFlag":d[0].tradeFlag
                        }},
                        { upsert: true });
        myCol.update( {"_id": {$in: [objectId(req.body.offeringBookId)]}}, { 
                    $set: { 
                        "owner":d[1].owner,
                        "bookname":d[1].bookname,
                        "author":d[1].author,
                        "url":d[1].url,
                        "tradeOffers":d[1].tradeOffers,
                        "tradeFlag":d[1].tradeFlag
                        }},
                        { upsert: true } );
        res.redirect("/mybooks");
    db.close();

});
    });  
}