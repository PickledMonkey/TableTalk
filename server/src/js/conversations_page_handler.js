$(document).ready(function(){
    //Should be populated by database in actual implementation
    var players = ['Player1', 'Player2', 'Player3', 'Player4'];
    var conversations = [
        {topic:'Topic1', players:['Player1', 'Player2']}, 
        {topic:'Topic2', players:['Player2', 'Player3', 'Player4']}
        ];
    
    function writeFormEntryButton()
    {
        $("#formEntry").load('/html/startConversationButton.html');
    }
    writeFormEntryButton();

    function updateConversationList()
    {
         $.get('/html/conversationList.ejs', function(template)
        {
            var str = ejs.render(template, {conversations: conversations});
            $("#conversationList").html(str);
        });
    }
    updateConversationList();

    $("#newConversationForm").submit(function(){
        alert("Submitted but not doing anything yet");
    });

    $("#formEntry").delegate('#startConversationButton', 'click', function(event)
    {
        $.get('/html/startConversationForm.ejs', function(template)
        {
            var str = ejs.render(template, {players: players});
            $("#formEntry").html(str);
        });
    });


    $("#formEntry").delegate('#newConversationForm', 'submit', function(event)
    {
        event.preventDefault();
        alert('Make a new conversation');
        writeFormEntryButton();
    });
    
});