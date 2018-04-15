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
    
});