var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);

var mongo = require('mongodb');
var ObjectId = mongo.ObjectId;
var MongoClient = mongo.MongoClient;

var mongoUrl = "mongodb://127.0.0.1:27017";

var playerCollectionName = 'players';
var conversationCollectionName = 'conversations';
var messagesCollectionName = 'messages';


// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(['node_modules/bootstrap/scss/*.scss', 'src/scss/*.scss'])
        .pipe(sass())
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
});

// Move the javascript files into our /src/js folder
gulp.task('js', function() {

    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 
    	'node_modules/jquery/dist/jquery.min.js', 
    	'node_modules/tether/dist/js/tether.min.js',
    	'node_modules/ejs/ejs.min.js',
    	'node_modeles/socket.io-client/dist/socket.io.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
});

// MAIN
gulp.task('serve', ['sass'], function() {

    var mongoDB;
    MongoClient.connect(mongoUrl, function(err, client)
    {
    	if (err) throw err;
    	mongoDB = client.db('TableTalkDB');
    });

	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	})); 

    app.set('view engine', 'ejs')
    app.use(express.static(__dirname + '/src'));

    app.get('/', function(req, res){
    	 res.render('pages/index', {});
	});
	
	app.post('/playerConversations/', function (req, res) {
		alert("Not Implemented");
	});

	app.post('/dmConversations/', function (req, res) {
		res.render('pages/conversations', req.body);
	});

	app.get('/dmConversations/chat/:topic_id/:playerName', function(req, res) {
		var topicObjectId = new ObjectId(req.params.topic_id);
		mongoDB.collection(conversationCollectionName).findOne({ _id:topicObjectId}).then(function(conversationInfo) {
			req.params.topic = conversationInfo.topic;
			res.render('pages/chat', req.params);
		}).catch(function(error) {
			console.log(error);
		});
	});

	io.on('connection', function(socket) {

		// {playerName, playerType}
		socket.on('playerConnect', function(msg)
		{
			console.log('playerConnect');
			console.log({msg:msg, id:socket.id});

			mongoDB.collection(playerCollectionName).find({name: msg.playerName}).count().then(function(numItems) {
				if (numItems == 0)
				{
					if (msg.playerType == 'dungeonMaster')
					{
						mongoDB.collection(playerCollectionName).insert({name: msg.playerName, conversations: [], dm:1});
					}
					else
					{
						mongoDB.collection(playerCollectionName).insert({name: msg.playerName, conversations: [], dm:0});
					}
				}
			}).catch(function(error) {
				console.log(error);
			});

			socket.join(msg.playerName);

			socket.emit('playerConnectStatus', {status:1});
		});

		// {}
		socket.on('getFullPlayerList', function(msg) {
			console.log('getFullPlayerList');
			console.log(msg);

			var allPlayersCursor = mongoDB.collection(playerCollectionName).find({}).project({_id:0, conversations:0});
			allPlayersCursor.toArray(function(err, result){
				if (err) throw err;
				socket.emit('sendFullPlayerList', result);
			});
		});

		// {playerName}
		socket.on('getConversationsList', function(msg) {
			console.log('getConversationsList');
			console.log(msg);

			mongoDB.collection(playerCollectionName).findOne({name: msg.playerName}).then(function(playerData) {

				var conversations = mongoDB.collection(conversationCollectionName)
				.find({ _id: { $in: playerData.conversations }})
				.project({messages:0});

				conversations.toArray(function(err, result){
					if (err) throw err;

					socket.emit('sendConversationsList', result);
				});
			}).catch(function(error) {
				console.log(error);
			});			
		});

		// {topic, players, dungeonMaster}
		socket.on('newConversation', function(msg) {
			console.log('newConversation');
			console.log(msg);

			mongoDB.collection(conversationCollectionName).insertOne(
				{topic:msg.topic, dungeonMaster: msg.dungeonMaster, players:msg.players, messages:[]}, function(err, res) {
				if (err) throw err;

				for (player of msg.players)
				{
					mongoDB.collection(playerCollectionName).update(
					{ name: player },
	   				{ $push: { conversations: res.ops[0]._id}});
					io.to(player).emit('newConversationAdded', msg);
				}

   				mongoDB.collection(playerCollectionName).update(
				{ name: msg.dungeonMaster},
   				{ $push: { conversations: res.ops[0]._id}});
   				io.to(msg.dungeonMaster).emit('newConversationAdded', msg);
			});
		});

		// {topic_id}
		socket.on('getConversationInfo', function(msg) {
			console.log('getConversationInfo');
			console.log(msg);

			var topicObjectId = new ObjectId(msg.topic_id);
			conversation = mongoDB.collection(conversationCollectionName).findOne({_id: topicObjectId}).then(function(conversation) {
				socket.emit('sendConversationInfo', conversation);
			});
		});

		// {player, topic_id}
		socket.on('joinChatRoom', function(msg) {
			console.log('joinChatRoom');
			console.log(msg);

			socket.join(msg.topic_id);
			io.to(msg.topic_id).emit('joinChatRoomStatus', {player:msg.player, status:'joined'})
		});

		// {topic_id, player, message, num}
		socket.on('newMessage', function(msg) {
			console.log('newMessage');
			console.log(msg);

			var topicObjectId = new ObjectId(msg.topic_id);
			msg.time = new Date();
			mongoDB.collection(conversationCollectionName).update(
				{_id:topicObjectId}, 
				{$push : {messages : {num : msg.num, player:msg.player, message:msg.message, time:msg.time} }}
				);
			io.to(msg.topic_id).emit('newMessageAdded', msg);
		});

		socket.on('disconnect', function()
		{
			console.log('disconnect');
			console.log(socket.id);
		});
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});

gulp.task('default', ['js','serve']);