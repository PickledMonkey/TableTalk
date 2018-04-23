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


// var allPlayersList = ['Player1', 'Player2', 'Player3', 'Player4'];
// var dmConversationsList = [
// 	    {topic:'Topic1', dungeonMaster:'Player0', players:['Player1', 'Player2']}, 
// 	    {topic:'Topic2', dungeonMaster:'Player0', players:['Player2', 'Player3', 'Player4']}
//     ];
// var messageList = {
// 		'Topic1': {
// 			dungeonMaster: 'Player4',
// 			players: ['Player1', 'Player2', 'Player3'],
// 			messages: [
// 				{id: 0, player:'Player1', message:'Yo Yo Yo!', time:'10:00'},
// 				{id: 1, player:'Player2', message:'What\'s up brah?', time:'10:01'},
// 				{id: 2, player:'Player1', message:'Not much man, just hanging out', time:'10:02'},
// 				{id: 3, player:'Player3', message:'Watch out! I see a cupcake!', time:'11:33'},
// 				{id: 4, player:'Player2', message:'Chill dude. It\'s nothing big.', time:'11:33'},
// 				{id: 5, player:'Player4', message:'You are all dead.', time:'12:00'},
// 				{id: 6, player:'Player1', message:'...', time:'12:01'},
// 				{id: 7, player:'Player2', message:'this game stinks...', time:'12:01'},
// 				{id: 8, player:'Player3', message:'bro... why?', time:'12:02'}
// 			]	
// 		},
// 		'Topic2': {
// 			dungeonMaster: 'Player4',
// 			players: ['Player1'],
// 			messages: [
// 				{id: 0, player:'Player4', message:'You looted a sick axe!', time:'10:00'},
// 				{id: 1, player:'Player1', message:'Sweet! I want to sell', time:'10:01'},
// 				{id: 2, player:'Player4', message:'Don\'t you want to give it to the barbarian?', time:'10:02'},
// 				{id: 3, player:'Player1', message:'No. That guy\'s a jerk.', time:'10:02'},
// 				{id: 4, player:'Player4', message:'lol k. You get 12gp', time:'10:04'}
// 			]
// 		}
// 	};
// var players = {'player1':'whatever', 'player2':'whatever2'};

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

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    // browserSync.init({
    //     server: "./src"  
    // });

    // gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'], ['sass']);
    // gulp.watch("src/*.html").on('change', browserSync.reload);

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
///users/:userId/books/:bookId
//https://expressjs.com/en/guide/routing.html
	app.get('/dmConversations/chat/:topic_id/:playerName', function(req, res) {
		var topicObjectId = new ObjectId(req.params.topic_id);
		mongoDB.collection(conversationCollectionName).findOne({ _id:topicObjectId}).then(function(conversationInfo) {
			req.params.topic = conversationInfo.topic;
			res.render('pages/chat', req.params);
		}).catch(function(error) {
			console.log(error);
		});
	});

	var playerSockets = {};
	var socketPlayers = {};

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
			socketPlayers[socket.id] = msg.playerName;
			playerSockets[msg.playerName] = socket.id;

			socket.emit('playerConnectStatus', {status:1});
		});

		// {}
		socket.on('getFullPlayerList', function(msg) {
			console.log('getFullPlayerList');
			console.log(msg);

			//check dm name and return list of players associated with dm
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

	   				if (player in playerSockets)
					{
						socket.broadcast.to(playerSockets[player]).emit('newConversationAdded', msg);
					}	
				}

   				mongoDB.collection(playerCollectionName).update(
				{ name: msg.dungeonMaster},
   				{ $push: { conversations: res.ops[0]._id}});
   				if (msg.dungeonMaster in playerSockets)
				{
					socket.broadcast.to(msg.dungeonMaster).emit('newConversationAdded', msg);
				}
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
			if (socket.id in socketPlayers)
			{
				var player = socketPlayers;
				if (player in playerSockets)
				{
					delete playerSockets[player];
				}
				delete socketPlayers[socket.id];
			}
		});
	});




	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});

gulp.task('default', ['js','serve']);