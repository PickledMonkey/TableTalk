var socket = io();

$(document).ready(function(){

    var playerName = $('#playerName').text();
    var topic = $('#topic').text();
    var topicId = $('#topic').attr('name');
    var conversation = {};

    socket.emit('playerConnect', {playerName:playerName, playerType:'dungeonMaster'});
    socket.emit('joinChatRoom', {topic_id:topicId});

    function updatePlayerList()
    {
        $.get('/html/playerList.ejs', function(template)
        {
            var str = ejs.render(template, {conversation: conversation});
            $("#playerList").html(str);
        });
    }

    function updateChatMessageList()
    {
        conversation.messages.sort(function(a, b) {
            a = new Date(b.time);
            b = new Date(a.time);
            return a>b ? -1 : a<b ? 1 : 0;
        });

        $.get('/html/chatMessageList.ejs', function(template)
        {
            var str = ejs.render(template, {conversation: conversation});
            $("#chatMessageList").html(str);
        });
    }

    // newMessage
    socket.on('newMessage', function(msg) {
        conversation.messages.push(msg);
        updateChatMessageList();
    });

    $("#messageForm").submit(function(event) {
        event.preventDefault();
        msg = {};
        if ($.trim( $('#messageInput').val() ) == '')
        {
            return; //ignore blank input
        }
        msg.message = $("#messageInput").val();
        msg.topic_id = topicId;
        msg.num = conversation.messages.length;
        msg.player = playerName;

        $("#messageInput").val("");
        socket.emit('newMessage', msg);
    });

    // getConversationInfo
    socket.on('getConversationInfo', function(msg) {
        conversation = msg;
        updatePlayerList();   
        updateChatMessageList();
    });
    socket.emit('getConversationInfo', {topic_id:topicId});



});