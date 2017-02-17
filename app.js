/*Live version https://imgsrablyfcc.herokuapp.com/ Use /api/imagesearch/searchterm?offset=number to search for images by term or /api/latest/imagesearch/  to see latest searches */
require('dotenv').config()
var imageSearch = require('node-google-image-search');
var url=require('url');
var express = require('express');
var app = express();
var mysql = require('mysql');
app.set('port', (process.env.PORT || 5000));

var arrayImageData=[];

app.get('/', function (req, res, next) {
	res.send("Use /api/imagesearch/searchterm?offset=number to search for images by term or /api/latest/imagesearch/  to see latest searches")
})

//Search
app.get('/api/imagesearch/:searchInput', function (req, res, next) {
	
	var searchString=req.params.searchInput;
	var offsetNumber=req.query.offset;
	var results = imageSearch(searchString, callback, offsetNumber, 10);
	var timestamp=new Date();
	
	function callback(results) {
	for(var i = 0; i < results.length; i++) {
    var obj = results[i];
	arrayImageData.push([obj.link,obj.snippet,obj.image.contextLink]);
	}
	res.send(arrayImageData);
	}
	
	
	var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});
var post  = {"term": searchString,"whenField": timestamp};
connection.query('INSERT INTO img SET ?', post, function(err, results) {
  if (!err)
    console.log('Inserted');
  else
	console.log('');  
    //console.log('Error while performing Query.'+err);
});

connection.end();
	arrayImageData=[];
})


//Latest Terms Searched
app.get('/api/latest/imagesearch/', function (req, res, next) {
	var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

connection.query('SELECT * from img', function(err, rows, fields) {
  if (!err){
	res.send(rows);
}
  else
	console.log('');
    //console.log('Error while performing Query.'+err);
});

connection.end();
})

app.listen(app.get('port'), function () {
  console.log('App listening')
})