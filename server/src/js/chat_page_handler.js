$(document).ready(function(){

	var conversation = {
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
	};

	function updatePlayerList()
    {
        $.get('/html/playerList.ejs', function(template)
        {
            var str = ejs.render(template, {conversation: conversation});
            $("#playerList").html(str);
        });
    }
    updatePlayerList();

    function updateChatMessageList()
    {
    	conversation.messages.sort(function(a, b) {
    		return a.id - b.id;
		});

        $.get('/html/chatMessageList.ejs', function(template)
        {
            var str = ejs.render(template, {conversation: conversation});
            $("#chatMessageList").html(str);
        });
    }
    updateChatMessageList();




});