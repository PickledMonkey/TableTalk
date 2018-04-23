var socket = io();

$(document).ready(function(){

    var playerName = $('#playerName').text();
    var players = [];
    var dmConversationsList = [];

    socket.emit('playerConnect', {playerName:playerName, playerType:'dungeonMaster'});

    function updateConversationList()
    {
         $.get('/html/conversationList.ejs', function(template)
        {
            var str = ejs.render(template, {conversations: dmConversationsList});
            $("#conversationList").html(str);
        });
    }

    socket.on('sendConversationsList', function(msg)
    {
        dmConversationsList = msg
        updateConversationList();
    });
    socket.emit('getConversationsList', {playerName:playerName});
 
    function writeFormEntryButton()
    {
        $("#formEntry").load('/html/startConversationButton.html');
    }
    writeFormEntryButton();

    socket.on('newConversationAdded', function(msg) {
        socket.emit('getConversationsList', {playerName:playerName});
    });

    $("#formEntry").on('click', '#startConversationButton', function(event)
    {
        socket.on('sendFullPlayerList', function(msg)
        {
            players = msg;
            $.get('/html/startConversationForm.ejs', function(template)
            {
                var str = ejs.render(template, {players: players, thisPlayer:playerName});
                $("#formEntry").html(str);
            });
        });
        socket.emit('getFullPlayerList');
    });

    $("#formEntry").on('submit', '#newConversationForm',  function(event)
    {
        event.preventDefault();
        msg = {};
        msg.topic = $('#topicName').val();
        msg.players = $('#selectPlayers option:selected').map(function() { 
            return $(this).val(); 
        }).get();
        msg.dungeonMaster = playerName;
        console.log(msg);

        socket.emit('newConversation', msg);
        writeFormEntryButton();
    });

    $("#conversationList").on('click', 'li', function()
    {
        window.location.href= 'chat/'+$(this).attr('id') + '/' +playerName;
    });
    
});