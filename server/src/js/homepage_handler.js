var socket = io();

$(document).ready(function(){
    
    // $("#playerForm").submit(function(){
    //     alert("Player");

    //     $("#userInputForm").load("/src/html/playerForm.html");

    // });

    $("#playerSelectButton").click(function(){
        $("#userInputForm").load("html/playerForm.html");
    });

    $("#dmSelectButton").click(function(){
        $("#userInputForm").load("html/dungeonMasterForm.html");
    });

    $("#userInputForm").on("submit", "#nameForm", function(event) {
        // event.preventDefault();
        var values = {};
        $.each($('#nameForm').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });

        socket.emit("playerConnect", {playerName:values['username'], playerType:'dungeonMaster'});
    });


    
});