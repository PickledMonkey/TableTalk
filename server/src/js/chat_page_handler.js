var socket = io();

$(document).ready(function(){

    var conversation = {};

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
            return a.id - b.id;
        });

        $.get('/html/chatMessageList.ejs', function(template)
        {
            var str = ejs.render(template, {conversation: conversation});
            $("#chatMessageList").html(str);
        });
    }

    socket.on('getConversationInfo', function(msg) {
        conversation = msg;
        updatePlayerList();   
        updateChatMessageList();
    });
    socket.emit('getConversationInfo');

});