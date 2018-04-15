var socket = io();

$(document).ready(function(){

    var players = [];
    var dmConversationsList = {};

    function updateConversationList()
    {
         $.get('/html/conversationList.ejs', function(template)
        {
            var str = ejs.render(template, {conversations: dmConversationsList});
            $("#conversationList").html(str);
        });
    }

    socket.on('getConversationsList', function(msg)
    {
        dmConversationsList = msg
        updateConversationList();
    });
    socket.emit('getConversationsList');
 
    function writeFormEntryButton()
    {
        $("#formEntry").load('/html/startConversationButton.html');
    }
    writeFormEntryButton();

    $("#formEntry").on('click', '#startConversationButton', function(event)
    {
        socket.on('getFullPlayerList', function(msg)
        {
            players = msg;
            $.get('/html/startConversationForm.ejs', function(template)
            {
                var str = ejs.render(template, {players: players});
                $("#formEntry").html(str);
            });
        });
        socket.emit('getFullPlayerList');
    });

    $("#formEntry").on('submit', '#newConversationForm',  function(event)
    {
        event.preventDefault();
        alert('Make a new conversation');
        writeFormEntryButton();
    });

    $("#conversationList").on('click', 'li', function()
    {
        window.location.href= 'chat/'+$(this).attr('id');
    });
    
});