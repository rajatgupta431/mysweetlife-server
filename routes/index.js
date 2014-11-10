var express = require('express');
var router = express.Router();
var request= require('request');
var cheerio = require('cheerio');
var mongo = require('mongodb').MongoClient;

/* GET home page. */
var value;
var arr=[];
var newarr={};
var finalarr=[];

router.get('/',function(req,res){

	res.send("Welcome to mysweetlife");
})
router.get('/search',function(req,res){
	console.log(req.query.item)
	if(req.query.item==null || req.query.item==undefined || req.query.item=="") 
		res.json({error:"No results"});
	else {  //simple json record
		mongo.connect('mongodb://mysweetlife:mysweetlife@dogen.mongohq.com:10084/mysweetlife', function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");

db.collection('foods').find({key: req.query.item}).toArray(function(err, records) {
		if (err) throw err;
		console.log(records.length)
		if(records.length==-1 || records[0]==null)
		{


			 request.post({uri:"http://www.myfitnesspal.com/en/food/search",
form:{search:req.query.item}},function(err,resp,body){
    var $ = cheerio.load(body);
//var list = $(".food_search_results");
 		//console.log(body)

				
 var listItems = $(".food_search_results li");
						listItems.each(function(index,li) {
							//console.log(index);
							//console.log(li);
								var $tds1 = $(this).find('div .food_description a:first-child');
								
								function afterLOL(lol){
							        // console.log(lol)
									var newlol= {};
									newlol=JSON.parse(JSON.stringify(lol));
									
										finalarr.push(newlol);

						db.collection('foods').insert(newlol, function(err, records) {
								if (err) throw err;
								console.log("Record added as "+records[0]._id);
							});
										//console.log(finalarr)

								}

						 		var $tds2 = $(this).find('div .nutritional_info');
						  	
								value = $tds2.text().toString();

								value = value.replace(/[\t\n]/g, "");
								
									arr= value.split(",");
									var i=0;
									newarr["item"]=$tds1.text();
									newarr["key"]= req.query.item;
									arr.forEach(function(val){
									 i++;
									 val = val.split(':');
						   			newarr[val[0]]=val[1];
										
						             if (i==arr.length - 1) {
						//onsole.log();
						                    afterLOL(newarr);
						           
						                 }
						    
											


									});

								
						}
						  	)	
						    



//console.log(body);

});
 setTimeout(function(){
console.log(typeof(finalarr))
//console.log(finalarr['Daal'])
res.json(finalarr);
finalarr=[];



		},6000)
		


}
else res.json(records)

		});

	});
}

});
  
router.post('/treatment',function(req,res){
    console.log("Treatment Request ");
    console.log(req.body.enteredBy)
    var date = new Date().getTime();

	if(req.body){
		 var treatment ={ 
createdAt: date,
		 	enteredBy: req.body.enteredBy,
username:req.body.username,
  eventType:req.body.eventType,
  glucoseValue: req.body.glucoseValue,
  glucoseType: req.body.glucoseValue,
 carbsGiven: req.body.carbsGiven,
  insulinGiven: req.body.insulinGiven,
  notes: req.body.notes
}
	mongo.connect('mongodb://mysweetlife:mysweetlife@dogen.mongohq.com:10084/mysweetlife', function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");
db.collection('treatments').insert(treatment, function(err, records) {
								if (err) res.json({status:"error"})
									else
								res.json({status: "success"});
							});


});

	}
	else res.json({status:"No data received"});

});


router.get('/treatment',function(req,res){
	console.log("Treaments list")
    mongo.connect('mongodb://mysweetlife:mysweetlife@dogen.mongohq.com:10084/mysweetlife', function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");
db.collection('treatments').find({username:req.query.username}).toArray( function(err, records) {
								if (err) res.json({status:"error"})
									else
								res.json(records);
							});


});



});

	
	

router.post('/register',function(req,res){
    console.log("Register Request ");
    console.log(req.body.username)
    var date = new Date().getTime();

        if(req.body){
                 var user ={
createdAt: date,
                        name: req.body.name,
  username:req.body.username,
  password: req.body.password,
  
}
        mongo.connect('mongodb://mysweetlife:mysweetlife@dogen.mongohq.com:10084/mysweetlife', function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");
db.collection('user').find({username:req.body.username}).toArray(function(err, records) {
                                                                if (err) res.json({status:"error"})
                                                                        if(records[0]==null || records.length==-1){
					db.collection('user').insert(user, function(err, records) {
                                                                if (err) res.json({status:"error"})
                                                                        else
                                                                res.json({status: "Success"});
                                                        });
								
}
							else
                                                                res.json({status: "User Already Exists"});
                                                        });



});

        }
        else res.json({status:"No data received"});

});

router.post('/login',function(req,res){
    console.log("Register Request ");
    console.log(req.body.username)
    var date = new Date().getTime();

        if(req.body){
                 var user ={
createdAt: date,
                        name: req.body.name,
  username:req.body.username,
  password: req.body.password,

}
        mongo.connect('mongodb://mysweetlife:mysweetlife@dogen.mongohq.com:10084/mysweetlife', function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");
db.collection('user').find({username:req.body.username,password:req.body.password}).toArray(function(err, records) {
                                                                if (err) res.json({status:"error",message:"Please try again"});
                                                                        if(records[0]==null || records.length==-1){
                                        res.json({status:"Error",message:"Wrong Username/Password"});
                                                                
                                                         

}
                                                        else
                                                                res.json({status: true ,message:"Welcome "+ records[0].username,username:records[0].username});
                                                        });



});

        }
        else res.json({status:"No data received",message:"Please Try Again"});

});



module.exports = router;
