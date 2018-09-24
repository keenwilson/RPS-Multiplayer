$(document).ready(function () {

    // Initialize the Realtime Database JavaScript SDK
    var config = {
        apiKey: "AIzaSyAEzrH-E6w9tuDNhOYRN2JSOg4OQ1utn_4",
        authDomain: "rps-multiplayer-99487.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-99487.firebaseio.com",
        projectId: "rps-multiplayer-99487",
        storageBucket: "rps-multiplayer-99487.appspot.com",
        messagingSenderId: "852900666486"
    };
    firebase.initializeApp(config);

    // Get a reference to the database service
    var database = firebase.database();
    var rootRef = firebase.database().ref();
    var chats = firebase.database().ref('chat');
    var players = firebase.database().ref('players');

    // Initial Values
    var con;
    var player = {
        number: "0",
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
    // Initialing a UL element
    // --------------------------------------------------------------
    // Only at the initial load get a snapshot of the stored data.
    // .once listens for exactly one event of the specified event type, and then stops listening.
    // .once reads the data located at players
    players.once('value').then(function(snapshot) {
        console.log(snapshot.val());
        // If Firebase has an object of player 1 or player 2  stored, update our client-side variables
        if (!snapshot.child('1').exists()) {
            player.number = '1';
            opponent.number = '2';
        } else if (!snapshot.child('2').exists()) {
            player.number = '2';
            opponent.number = '1';
        }

        // If you got a player number, you're 1 or 2.
        if (player.number !== '0') {
            // Make a connection to Firebase and send your info.
            players.child(player.number).set(player);
            // When you disconnect, remove your device.
            players.child(player.number).onDisconnect().remove();            
        } else {
            // If 1 and 2 were taken, your number is still 0.
            $("#game-notification").text("Two players are playing. Please come back later")
            // And disconnect from Firebase.
            app.delete();
        }
        // If any errors are experienced, log them to console.
    }).catch(function(error) {
        console.log("The read failed: " + error.code);
    });




    // Ongoing event listening
    /* firebase.database().ref('/players/').on('value', function (snapshot) {
    
    });
     */
    // =============================================================
    // Function to handler clicks
    // =============================================================

    // Click events for Start button to submit a name
    $("#start-game").on("click", function (e) {
        e.preventDefault();
        player.name = $("#username").val().trim();
        console.log("You've clicked a 'start'button.", name);
        if (player.name.length > 0) {
            players.child(player.number).update({
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
    // ==============================================================
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

    // ==============================================================
    // Function to handle chat
    // ==============================================================
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
        chats.push(chatObj);

        // Clear chat input
        $("#chat-input").val("");
        scrollToBottom();

    });


    // Disable 'enter' key from reloading a page
    $("#chat-input").keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
        }
    });

    // Database listening function for chats.
    chats.on('child_added', function (snapshot) {
        var chatMessage = snapshot.val();
        //  update HTML elements.
        var chatDisplay = chatMessage.sender + ' : ' + chatMessage.message + '&#13;&#10;';
        $(".chat-display").append(chatDisplay);
        scrollToBottom();

        // Only show messages sent in the last half hour. A simple workaround for not having a ton of chat history.
        if (Date.now() - chatMessage.timestamp < 1800000) {
        }
    });

    // Find out when the content of the textarea changes 
    $(".chat-display").change(function () {
        scrollToBottom();
    });
    // Scroll to the bottom of the chat box
    var messages = $('.chat-display');
    function scrollToBottom() {
        messages[0].scrollTop = messages[0].scrollHeight;
    };
    scrollToBottom();

    // Prevent typing in chat box
    $(".chat-display").keypress(function (e) {
        e.preventDefault();
    });

}); /* End $(document).ready(function(){}) */