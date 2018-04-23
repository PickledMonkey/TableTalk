var socket = io();

$(document).ready(function(){

    $("#playerSelectButton").click(function(){
        $("#userInputForm").load("html/playerForm.html");
    });

    $("#dmSelectButton").click(function(){
        $("#userInputForm").load("html/dungeonMasterForm.html");
    });

    $("#userInputForm").on("submit", "#nameForm", function(event) {
        var values = {};
        $.each($('#nameForm').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });

        socket.emit("playerConnect", {playerName:values['username'], playerType:'dungeonMaster'});
    });


    
});