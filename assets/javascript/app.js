/* global moment firebase */

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDJIB4hB5B7Ut5AP4QL8KV4F4FtU08BHXI",
    authDomain: "rps-multiplayer-b9d2f.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-b9d2f.firebaseio.com",
    projectId: "rps-multiplayer-b9d2f",
    storageBucket: "rps-multiplayer-b9d2f.appspot.com",
    messagingSenderId: "744450581138"
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}
//  Create alias to reference the database and sub-levels.
var database = firebase.database();
var chats = database.ref('chat');
var connections = database.ref('connections');

// Initial Values

var player = {
    number: "",
    name: "",
    wins: 0,
    losses: 0,
    turns: 0,
    choice: ""

};
var opponent = {
    number: "0",
    name: "",
    wins: 0,
    losses: 0,
    turns: 0,
    choice: ""
};
var waiting = false;

// --------------------------------------------------------------
// Initial connection to Firebase/presence handling.
// At the initial load and subsequent value changes, get a snapshot of the stored data.
database.ref('connections').once('value', function (snapshot) {
    // If Firebase has an object of player 1 or player 2  stored, update our client-side variables
    if (Object.keys(snapshot.val()).indexOf('1') === -1) {
        player.number = '1';
        opponent.number = '2';
    } else if (Object.keys(snapshot.val()).indexOf('2') === -1) {
        player.number = '2';
        opponent.number = '1';
    }

    // If you got a player number, you're 1 or 2.
    if (player.number !== '0') {
        // Make a connection to Firebase and send your info.
        connections.child(player.number).set(player);

        // When you disconnect, remove your device.
        connections.child(player.number).onDisconnect().remove();
        // If 1 and 2 were taken, your number is still 0.
    } else {
        // Remove the name form and put the alert there.
        $('section').remove();
        $('.alert').show();
        // And disconnect from Firebase.
        firebase.initializeApp(config).delete();
    }
    // If any errors are experienced, log them to console.
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});




// =============================================================
// Function to handler clicks
// =============================================================

// Click events for Start button to submit a name
$("#start-game").on("click", function (e) {
    e.preventDefault();
    player.name = $("#username").val().trim();
    console.log("You've clicked a 'start'button.", name);
    if (player.name.length > 0) {
        connections.child(player.number).update({
            name: player.name
        });
        renderPlayer();
    }

    return false;
});

// Functions for changing HTML elements.
function renderPlayer() {

    $(".username-form").hide();
    $(".game-notification").text("Hello " + player.name + "! You are Player " + player.number + ".");
    $(".player-name-" + player.number).text(player.name);
    $(".player-stat-" + player.number).text("Wins: " + player.wins + " | Losses: " + player.losses);
    $(".turn").show();
    $(".chat-box").show();
}

function renderOpponent() {
    $(".waiting-" + opponent.number).hide();
    $(".player-name-" + opponent.number).text(opponent.name);
    $(".player-stat-" + opponent.number).text("Wins: " + opponent.wins + " | Losses: " + opponent.losses);
}

// Click events for Rock, Paper, Scissors
$("#player-rock-1").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Rock.");
});
$("#player-paper-1").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Paper.");
});
$("#player-scissors-1").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Scissors.");
});
$("#player-rock-2").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Rock.");
});
$("#player-paper-2").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Paper.");
});
$("#player-scissors-2").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Scissors.");
});

// Function to handle chat
// ===============================
$("#send-chat").on("click", function (e) {
    e.preventDefault();
    var message = $("#chat-input").val().trim();
    console.log("Send your message: " + message);

    var chatObj = {
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        sender: player.name
    };
    // Submit a chat
    firebase.database().ref('chat').push(chatObj);

    // Clear chat input
    $("#chat-input").val("");

});

// Database listening function for chats.
firebase.database().ref('chat').on('child_added', function (snapshot) {
    var chatMessage = snapshot.val();
    //  update HTML elements.
    var chatDisplay = chatMessage.sender + ' : ' + chatMessage.message + '&#13;&#10;';
    $("#chat-display").append(chatDisplay);

    // Only show messages sent in the last half hour. A simple workaround for not having a ton of chat history.
    if (Date.now() - chatMessage.timestamp < 1800000) {

    }

});


