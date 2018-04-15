var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);


var allPlayersList = ['Player1', 'Player2', 'Player3', 'Player4'];
var dmConversationsList = [
	    {topic:'Topic1', dungeonMaster:'Player0', players:['Player1', 'Player2']}, 
	    {topic:'Topic2', dungeonMaster:'Player0', players:['Player2', 'Player3', 'Player4']}
    ];
var messageList = {
		'Topic1': {
			dungeonMaster: 'Player4',
			players: ['Player1', 'Player2', 'Player3'],
			messages: [
				{id: 0, player:'Player1', message:'Yo Yo Yo!', time:'10:00'},
				{id: 1, player:'Player2', message:'What\'s up brah?', time:'10:01'},
				{id: 2, player:'Player1', message:'Not much man, just hanging out', time:'10:02'},
				{id: 3, player:'Player3', message:'Watch out! I see a cupcake!', time:'11:33'},
				{id: 4, player:'Player2', message:'Chill dude. It\'s nothing big.', time:'11:33'},
				{id: 5, player:'Player4', message:'You are all dead.', time:'12:00'},
				{id: 6, player:'Player1', message:'...', time:'12:01'},
				{id: 7, player:'Player2', message:'this game stinks...', time:'12:01'},
				{id: 8, player:'Player3', message:'bro... why?', time:'12:02'}
			]	
		},
		'Topic2': {
			dungeonMaster: 'Player4',
			players: ['Player1'],
			messages: [
				{id: 0, player:'Player4', message:'You looted a sick axe!', time:'10:00'},
				{id: 1, player:'Player1', message:'Sweet! I want to sell', time:'10:01'},
				{id: 2, player:'Player4', message:'Don\'t you want to give it to the barbarian?', time:'10:02'},
				{id: 3, player:'Player1', message:'No. That guy\'s a jerk.', time:'10:02'},
				{id: 4, player:'Player4', message:'lol k. You get 12gp', time:'10:04'}
			]
		}
	};



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
	app.get('/dmConversations/chat/:topic/', function(req, res) {
		res.render('pages/chat', req.params);
	});

	io.on('connection', function(socket) {
		socket.on('getFullPlayerList', function() {
			io.emit('getFullPlayerList', allPlayersList);
		});

		socket.on('getConversationsList', function() {
			io.emit('getConversationsList', dmConversationsList);
		});

		socket.on('startConversation', function(msg) {
			alert('Make a new conversation');
		});

		socket.on('getConversationInfo', function(msg) {
			io.emit('getConversationInfo', messageList['Topic1']);
		});
	});




	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});

gulp.task('default', ['js','serve']);