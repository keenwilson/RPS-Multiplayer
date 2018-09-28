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

    var players = firebase.database().ref('players');
    var connectedRef = database.ref(".info/connected");

    // Initial Values
    var playerConnected;
    var player1 = null;
    var player1name;
    var player1number;

    var player2 = null;
    var player2name;
    var player2number;

    var playerNumber;
    var player = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        ties: 0,
        choice: "",
        turn: 0
    };
    var opponent = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        ties: 0,
        choice: "",
        turn: 0
    };
    var hasWinner = false;
    var roundStart = false;

    // Whose turn is it (Player 1 or Player 2)
    var turn = "";
    // What Player1 and Player2 select (r, p, or s)
    var choice1 = "";
    var choice2 = "";
    var choice1Text = "";
    var choice2Text = "";

    // jQuery to grab elements for game messages
    var $greeting = $("#game-notification-message");
    var $turnSignal = $(".turn");
    var $winner = $(".winner");

    // --------------------------------------------------------------
    // Initialing a UL element
    // --------------------------------------------------------------
    // Only at the initial load get a snapshot of the stored data.
    // .once listens for exactly one event of the specified event type, and then stops listening.
    // .once reads the data located at players
    database.ref("/players/").once('value').then(function (snapshot) {

        // If Firebase has a key of player 1 or player 2 stored, update our client-side variables
        if (!snapshot.child('1').exists()) {
            player.number = '1';
            opponent.number = '2';
            console.log("There was no player 1 in Firebase, therefore you now are player 1");
        } else if (!snapshot.child('2').exists()) {
            player.number = '2';
            opponent.number = '1';
            console.log("There was no player 2 in Firebase, therefore you now are player 2");
        } else {
            player.number = '0'
            opponent.number = '0';
            console.log("There are both player 1 & player 2 in Firebase, therefore you will be disconnected");
        }

        // If you got a player number, you're 1 or 2.
        if (player.number !== '0') {

            playerConnected = database.ref("/players/").child(player.number);
            // Send your player info (name/ local wins/ local losses/ local turns to the database)
            playerConnected.set(player);
            // Remove user from the connection list when they disconnect.
            database.ref("/players/").child(player.number).onDisconnect().remove();

        } else {
            // If 1 and 2 were taken, your number is still 0.
            // Disconnect from Firebase.
            app.delete();
        }
    }).catch(function (error) {
        // If any errors are experienced, log them to console.
        console.log("The .once('value') read failed: " + error.code);
    });

    // --------------------------------------------------------------------------------------------------------------
    // Ongoing event listening if Player1 & Player2 exist and display message
    // --------------------------------------------------------------------------------------------------------------
    database.ref("/players/").on('value', function (snapshot) {

        // Check if player1 exists in Firebase
        if (snapshot.child('1').exists()) {

            if (snapshot.val()[1].name === "") {
                // Player 1 is available but has no name value
                // You are player 1. Please enter your name.
                $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");
            } else {
                // Player 1 exists in database.
                // Save Player 1 data to local player1
                player1 = snapshot.val()[1];
                player1name = player1.name;
                player1number = player1.number;

                // Update Playey1 Display
                // Say 'Hi player1's name' and 'Waiting for Player 2'
                $greeting.text("Hi " + player1name + "! You're Player 1.");
                $turnSignal.hide();
                $(".player-name-1").text(player1name)
                $(".waiting-player-1 ").hide();
                $(".waiting-player-2 ").show();

                // Set and display player1's game stat
                $(".player-stat-1").text("Wins: " + player1.wins + " | Losses: " + player1.losses + " | Ties: " + player1.ties).show();;
                $winner.hide();
            }

        } else {
            // No player1 exist
            player1 = null;
            player1name = "";

            // Show text "Waiting for Player 1"
            $turnSignal.hide();
            $(".waiting-player-1 ").show();
            $(".player-stat-1").hide();
            $winner.hide();
        }

        // Check if player2 exists in Firebase
        if (snapshot.child('2').exists()) {
            if (snapshot.val()[2].name === "") {
                // Player 2 is available but has no name value
                // You are player 2. Please enter your name.
                $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");

            } else {

                if (snapshot.child('1').exists() && snapshot.val()[1].name !== "") {
                    // Only execute if the database already has player1

                    //Player 2 exists in database 
                    // Save Player 2 data to local player2 variable
                    player2 = snapshot.val()[2];
                    player2name = player2.name;
                    player2number = player2.number;

                    // Update Playey2 Display
                    $greeting.text("Hi " + player2name + "! You're Player 2.");
                    $turnSignal.hide();
                    $(".player-name-2").text(player2name)
                    $(".waiting-player-1 ").show();
                    $(".waiting-player-2 ").hide();

                    $(".player-stat-2").text("Wins: " + player2.wins + " | Losses: " + player2.losses + " | Ties: " + player2.ties).show();;
                    $winner.hide();
                }
            }
        } else {
            // No player2 exist
            player2 = null;
            player2name = "";

            // Show text "Waiting for Player 2"
            $turnSignal.hide();
            $(".waiting-player-2 ").show();
            $(".player-stat-2").hide();
            $winner.hide();
        }


        if (player1 && player2) {
            // If both player1 & player2 exists in Firebase

            // Remove the form for username input
            $(".username-form").hide();

            // Remove text "Waiting for player 1 & 2"
            $(".waiting-player-1 ").hide();
            $(".waiting-player-2 ").hide();

            // Set box background for Player1 & Player 2 to default
            boxBackgroundDefault();


            // check if the user is player1 or player2
            if (player.name === player1name) {
                // The user is player1. 
                // Save local player equalto player1 & local opponent equal player2.
                player = player1;
                opponent = player2;
                playerNumber = player1number;
                // Customize greeting
                $greeting.text("The game has started. You're Player 1, " + player1name + "!");
/*                 database.ref().child("/players/1/turn").set(1); */
                /* database.ref("/players/").child(player.number).update({
                    turn: '1',
                }) */


            } else if (player.name === player2name) {
                // The user is player2.
                // Save local player equalto player2 & local opponent equal player1.
                player = player2;
                opponent = player1;
                playerNumber = player2number;
                // Customize greeting
                $greeting.text("The game has started. You're Player 2, " + player2name + "!");
/*                 database.ref().child("/players/2/turn").set(1); */
         /*        database.ref("/players/").child(player.number).update({
                    turn: '1',
                }); */
               
                database.ref().child("/turn/").set('start');


            } else {
                // If the user is not one of the current players.
                $greeting.text("Two players are currently playing. Please come back later!");
                $("#game-notification").removeClass("is-primary");
                $("#game-notification").addClass("is-warning");
               
            }

            // Handle turn
            //====================================================================================
           /*  if ((snapshot.val()[1].turn === 1) && (snapshot.val()[2].turn === 1)) {
                // If the turn on database for both players is 1
                // Set local turn to 1 and start round
                turn = 1;
                roundStart = true;

                // Update display of Player1's box with green border
                boxBackgroundHighlightPlayer1();

                // Display choices for Player1 to select
                $("#selection-1").children().show();
                $("#selection-2").children().hide();

                if (playerNumber === 1) {
                    $turnSignal.text("It's your turn!").show();;
                } else if (playerNumber === 2) {
                    $turnSignal.text("Waiting for " + player1.name + " to choose.").show();
                } else {
                    console.log("You are not either player1 or player2.")
                }
            }

            if ((snapshot.val()[1].turn === 2) && (snapshot.val()[2].turn === 2)) {
                // The turn on database for both players is 2
                turn = 2;
                // This only happens when player1 has selected r/p/s
                // Start round
                roundStart = true;

                // Update display of Player2's box with green border
                boxBackgroundHighlightPlayer2();

                // Display choices for Player2 to select
                $("#selection-1").children().hide();
                $("#selection-2").children().show();



                if (playerNumber === 2) {
                    $turnSignal.text("It's your turn!").show();;
                } else if (playerNumber === 1) {
                    $turnSignal.text("Waiting for " + player2.name + " to choose.").show();
                } else {
                    console.log("You are not either player1 or player2.")
                }
            } */
            //================================================================================
        }
    });




    // =============================================================
    // Attach a listener to players's turn to listen for any changes
    // =============================================================
    database.ref("/turn/").on('value', function (snapshot) {
        console.log("Turn status", snapshot.val());
    });
   
   
   
   
   
    /*  database.ref("/turn/").on("value", function (snapshot) {

        database.ref("/players/").child(player.number).update({
            choice: '',
        })
        // Handle turn
        //====================================================================================
        if ((snapshot.val()[1].turn === 1) && (snapshot.val()[2].turn === 1)) {
            // If the turn on database for both players is 1
            // Set local turn to 1 and start round
            turn = 1;
            roundStart = true;

            // Update display of Player1's box with green border
            boxBackgroundHighlightPlayer1();

            // Display choices for Player1 to select
            $("#selection-1").children().show();
            $("#selection-2").children().hide();

            if (playerNumber === 1) {
                $turnSignal.text("It's your turn!").show();;
            } else if (playerNumber === 2) {
                $turnSignal.text("Waiting for " + player1.name + " to choose.").show();
            } else {
                console.log("You are not either player1 or player2.")
            }
        }

        if ((snapshot.val()[1].turn === 2) && (snapshot.val()[2].turn === 2)) {
            // The turn on database for both players is 2
            turn = 2;
            // This only happens when player1 has selected r/p/s
            // Start round
            roundStart = true;

            // Update display of Player2's box with green border
            boxBackgroundHighlightPlayer2();

            // Display choices for Player2 to select
            $("#selection-1").children().hide();
            $("#selection-2").children().show();



            if (playerNumber === 2) {
                $turnSignal.text("It's your turn!").show();;
            } else if (playerNumber === 1) {
                $turnSignal.text("Waiting for " + player2.name + " to choose.").show();
            } else {
                console.log("You are not either player1 or player2.")
            }
        }

    });

 */

    // Click events for Rock, Paper, Scissors
    // ==============================================================
    // Player 1 
    // --------------------------------------------------------------
    $(".player-choices-1").on("click", function (e) {
        e.preventDefault();
        choice1 = $(this).attr("data-choice");
        choice1Text = $(this).attr("data-text");

        // Save Player1's choice to database
        database.ref().child("/players/1/choice").set(choice1Text);

        // For player1, shows the selected choice
        if (playerNumber === 1) {
            $("#player-select-1").text(choice1Text).show();
        } else if (playerNumber === 2) {
            $("#player-select-1").text(player1.name + " has selected.").show();
        } else {
            console.log("You are not player1 or player2.")
        }

        // Set the turn value to 2, as it is now player2's turn
        roundStart = true;
        turn = 2;
        /*         database.ref().child("/turn").set(2); */
        database.ref().child("/players/1/turn").set(2);
        database.ref().child("/players/2/turn").set(2);
    });


    // Player 2
    // --------------------------------------------------------------
    $(".player-choices-2").on("click", function (e) {
        e.preventDefault();

        boxBackgroundDefault();
        $(".center-game-result").addClass("has-background-primary has-text-white");
        // Reference the value of Player2's choice 
        choice2 = $(this).attr("data-choice");
        choice2Text = $(this).attr("data-text");
        console.log("Player 2 " + player2.name + " select " + choice2Text)
        // Save Player2's choice to database
        database.ref().child("/players/2/choice").set(choice2Text);
        getWinner(choice1Text, choice2Text);
    });

    // =============================================================
    // Function to Calculate Winner
    // =============================================================

    function getWinner(choice1, choice2) {
        console.log("choice1: " + choice1 + ", choice2: " + choice2)
        $('.player-game-result-1').text(choice1).show();
        $('.player-game-result-2').text(choice2).show();
        boxBackgroundHighlightCenter();
        $turnSignal.hide();
        hidePlayerChoices();

        // If both player select the same choice. It's a tie!
        if (choice1 === choice2) {
            console.log("It's a tie!");
            player.ties++;
            database.ref("/players/").child(player.number).update({
                choice: '',
                ties: player.ties
            })
            console.log("Wins: " + player.wins + " | Losses: " + player.losses + " | Ties: " + player.ties);
            // Display the winner on HTML
            $winner.text("It's a tie!").show();
            // Start the next game round and set Turn 1 for Player 1 to play
            setTimeout(function () {
                roundStart = false;
                hasWinner = false;
                turn = 1;
                database.ref().child("/players/1/turn").set(1);
                database.ref().child("/players/2/turn").set(1);
            }, 5000);
        };

        if (choice1 === 'rock' && choice2 === 'paper') { recordWin('2', '1'); }
        if (choice1 === 'rock' && choice2 === 'scissors') { recordWin('1', '2'); }

        if (choice1 === 'paper' && choice2 === 'rock') { recordWin('1', '2'); }
        if (choice1 === 'paper' && choice2 === 'scissors') { recordWin('2', '1'); }

        if (choice1 === 'scissors' && choice2 === 'paper') { recordWin('1', '2'); }
        if (choice1 === 'scissors' && choice2 === 'rock') { recordWin('2', '1'); }

    };


    function recordWin(winner, loser) {
        console.log(winner + " is a winner. " + loser + " is a loser");

        // If you are a winner, record your wins
        if (winner === player.number) {
            player.wins++;
            database.ref("/players/").child(winner).update({
                wins: player.wins
            });

        } else {
            // If you are a loser, record your losses
            player.losses++;
            database.ref("/players/").child(loser).update({
                losses: player.losses
            });
        }
        // Update game result
        // Display on HTML
        $winner.text("The winner is Player " + winner).show();

        // Start the next game round and set Turn 1 for Player 1 to play
        setTimeout(function () {
            roundStart = false;
            hasWinner = false;
            turn = 1;
            database.ref().child("/players/1/turn").set(1);
            database.ref().child("/players/2/turn").set(1);
        }, 5000);
    };


    // =============================================================
    // Function to handler clicks
    // =============================================================

    // Click events for Start button to submit a name
    $("#start-game").on("click", function (e) {
        e.preventDefault();
        player.name = $("#username").val().trim();
        console.log("You've clicked a 'start'button.", name);
        if (player.name.length > 0) {
            database.ref("/players/").child(player.number).update({
                name: player.name
            });
        }
        return false;
    });


    // =============================================================
    // Functions for changing HTML elements
    // =============================================================

    // Function to toggle box background color
    function boxBackgroundDefault() {
        $(".player1-box").removeClass("has-background-primary has-text-white");
        $(".player2-box").removeClass("has-background-primary has-text-white");
        $(".center-game-result").removeClass("has-background-primary has-text-white");
    };

    function boxBackgroundHighlightPlayer1() {
        $(".player1-box").addClass("has-background-primary has-text-white");
        $(".player2-box").removeClass("has-background-primary has-text-white");
        $(".center-game-result").removeClass("has-background-primary has-text-white");
    };

    function boxBackgroundHighlightPlayer2() {
        $(".player1-box").removeClass("has-background-primary has-text-white");
        $(".player2-box").addClass("has-background-primary has-text-white");
        $(".center-game-result").removeClass("has-background-primary has-text-white");
    };

    function boxBackgroundHighlightCenter() {
        $(".player1-box").removeClass("has-background-primary has-text-white");
        $(".player2-box").removeClass("has-background-primary has-text-white");
        $(".center-game-result").addClass("has-background-primary has-text-white");
    };



    // Hide Rock, Paper, Scissors buttons so that the user cannot accidentally click it
    function hidePlayerChoices() {
        $(".player-choices-" + player.number).hide();
        $(".player-choices-" + opponent.number).hide();
    }

    // Update players' wins, losses, and ties
    function updateStat() {
        $(".player-stat-" + player.number).text("Wins: " + player.wins + " | Losses: " + player.losses + " | Ties: " + player.ties);
        $(".player-stat-" + opponent.number).text("Wins: " + opponent.wins + " | Losses: " + opponent.losses + " | Ties: " + opponent.ties);
    }

    // Close notification
    $("#close-notification").on("click", function () {
        console.log("You close the notification");
        $("#game-notification").hide();
    })


    // ==============================================================
    // Function to handle chat
    // ==============================================================
    $("#send-chat").on("click", function (e) {
        e.preventDefault();
        var message = $("#chat-input").val().trim();

        var chatObj = {
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            sender: player.name
        };
        // Submit a chat
        database.ref("/chat/").push(chatObj);

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

    // Database listening function for  database.ref("/chat/").
    database.ref("/chat/").on('child_added', function (snapshot) {
        var chatMessage = snapshot.val();


        // Only show messages sent in the last half hour.
        // So that we have only a recent chat history
        if (Date.now() - chatMessage.timestamp < 1800000) {
            //  update HTML elements.
            var chatDisplay = chatMessage.sender + ' : ' + chatMessage.message + '&#13;&#10;';
            $(".chat-display").append(chatDisplay);
            scrollToBottom();
        }
    });

    // Attach a listener that detects user disconnection events
    database.ref("/players/").on("child_removed", function (snapshot) {

        // Send a message to chat 
        var msg = snapshot.val().name + " has disconnected!";

        // Get a key for the disconnection chat entry
        var chatKey = database.ref().child("/chat/").push().key;

        // Save the disconnection chat entry
        database.ref("/chat/" + chatKey).set(msg);

        // Updatec chat
        var chatDisplay = msg + '&#13;&#10;';
        $(".chat-display").append(chatDisplay);
        scrollToBottom();

        // Signal turn to stop
        database.ref().child("/turn/").set('stop');
    });

    // Find out when the content of the textarea changes 
    // Scroll to the bottom of the chat box
    $(".chat-display").change(function () {
        scrollToBottom();
    });

    // Function to scroll to the bottom of the chat box
    var messages = $('.chat-display');
    function scrollToBottom() {
        messages[0].scrollTop = messages[0].scrollHeight;
    };

    scrollToBottom();

    // Prevent typing in chat box
    $(".chat-display").keypress(function (e) {
        e.preventDefault();
    });

}); // End $(document).ready(function(){}