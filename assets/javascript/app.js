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
    var player2 = null;
    var player = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        ties: 0,
        choice: ""
    };
    var opponent = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        ties: 0,
        choice: ""
    };
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
    var $playerChoices = $(".player-choices-" + player.number);
    var $opponentChoices = $(".player-choices-" + opponent.number);
    var $playerSelect = $(".player-select-" + player.number);
    var $opponentSelect = $(".player-select-" + opponent.number);
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
            // Send your player info (name/ local wins/ local losses/ local turns)
            playerConnected.set(player);
            // Remove user from the connection list when they disconnect.
            database.ref("/players/").child(player.number).onDisconnect().remove();



        } else {
            // If 1 and 2 were taken, your number is still 0.
            // Disconnect from Firebase.
            app.delete();
        }
        // If any errors are experienced, log them to console.


    }).catch(function (error) {
        console.log("The .once('value') read failed: " + error.code);
    });

    // Ongoing event listening if Player1 & Player2 exist and display message
    // -------------------------------------------------------------
    database.ref("/players/").on('value', function (snapshot) {

        console.log("The result of .on'value':", snapshot.val());

        // Check if player1 exists in Firebase
        if (snapshot.child('1').exists()) {

            if (snapshot.val()[1].name === "") {
                console.log("You are player 1. Please enter your name.")
                $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");

            } else {

                console.log("Player 1 exists in database.")

                // Record Player 1 data
                player1 = snapshot.val()[1];
                player1name = player1.name;

                console.log(player1, "snapshot.val()[1]")

                // Update Playey1 Display
                $greeting.text("Hi " + player1name + "! You're Player 1.");
                $turnSignal.hide();
                $(".player-name-1").text(player1name)
                $(".waiting-player-1 ").hide();
                $(".waiting-player-2 ").show();
                $(".player-choices-1").hide();
                $(".player-choices-2").hide();
                $playerSelect.hide();
                $opponentSelect.hide();
                $(".player-stat-1").text("Wins: " + player1.wins + " | Losses: " + player1.losses + " | Ties: " + player1.ties);
                $(".player-stat-1").show();
                $winner.hide();
            }

        } else {
            player1 = null;
            player1name = "";

            console.log(player1, "no player1 exist")

            // Waiting for Player 1
            $turnSignal.hide();
            $(".waiting-player-1 ").show();
            $(".player-choices-1").hide();
            $(".player-choices-2").hide();
            $playerSelect.hide();
            $opponentSelect.hide();
            $(".player-stat-1").hide();
            $winner.hide();
        }

        // Check if player2 exists in Firebase
        if (snapshot.child('2').exists()) {
            if (snapshot.val()[2].name === "") {
                console.log("You are player 2. Please enter your name.")
                $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");

            } else {

                if (snapshot.child('1').exists() && snapshot.val()[1].name !== "") {
                    console.log("Player 2 exists in database.")

                    // Record Player 2 data
                    player2 = snapshot.val()[2];
                    player2name = player2.name;

                    console.log(player2, "snapshot.val()[2]")

                    // Update Playey2 Display
                    $greeting.text("Hi " + player2name + "! You're Player 2.");
                    $turnSignal.hide();
                    $(".player-name-2").text(player2name)
                    $(".waiting-player-1 ").show();
                    $(".waiting-player-2 ").hide();
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();
                    $playerSelect.hide();
                    $opponentSelect.hide();
                    $(".player-stat-2").text("Wins: " + player2.wins + " | Losses: " + player2.losses + " | Ties: " + player2.ties);
                    $(".player-stat-2").show();
                    $winner.hide();
                }

            }
        } else {
            player2 = null;
            player2name = "";
            console.log(player2, "no player2 exist")

            // Waiting for Player 2
            $turnSignal.hide();
            $(".waiting-player-2 ").show();
            $(".player-choices-1").hide();
            $(".player-choices-2").hide();
            $(".player-select-1").hide();
            $(".player-select-2").hide();
            $(".player-stat-2").hide();
            $winner.hide();
        }

        // If both player1 & player2 exists in Firebase
        if (player1 && player2) {

            $(".username-form").hide();
            console.log("Both player1 & player2 exist.")
            // Remove Waiting for player 1 & 2
            $(".waiting-player-1 ").hide();
            $(".waiting-player-2 ").hide();
            // -------------------------------------------------------------
            if (snapshot.val()[1].choice !== "") {
                database.ref().child("/turn/").set(2);
            } else {
                database.ref().child("/turn/").set(1);
            }
            // -------------------------------------------------------------

            // check if the user is player1 or player2
            if (player.name === player1name) {
                // The user is player1. 
                // Save local player equalto player1 & local opponent equal player2.
                player = player1;
                opponent = player2;
                // Customize greeting
                /*                 $greeting.text("Hi " + player1name + "! You're Player 1.");
                                $(".turn").show();
                                $(".turn").text("It's your turn!");
                                $(".wait").hide();
                                $(".player-choices-1").show();
                                $(".player-choices-2").hide(); */

            } else if (player.name === player2name) {
                // The user is player2.
                // Save local player equalto player2 & local opponent equal player1.
                player = player2;
                opponent = player1;
                // Customize greeting
                /* $greeting.text("Hi " + player.name + "! You're Player 2.");
                $(".turn").hide();
                $(".wait").show();
                $(".wait").text("Waiting for " + opponent.name + " to choose.");
                $(".player-choices-1").hide();
                $(".player-choices-2").hide(); */
            } else {
                // If the user is not one of the current players.
                $greeting.text("Two players are currently playing. Please come back later!");
                $("#game-notification").removeClass("is-primary");
                $("#game-notification").addClass("is-warning");
                return false;
            }

        }

    });



    // Attach a listener to the database /turn/ node to listen for any changes
    // ---------------------------------------------------------------------
    database.ref("/turn/").on("value", function (snapshot) {
        console.log("/turn/  snapshot.val()", snapshot.val())

        if (player1 && player2) {
            if (snapshot.val() == 1) {
                console.log("TURN for Player 1");
                turn = 1;
                console.log("Your player.number:", player.number)
                // If it's player1's turn
                // Update display of Player1's box with green border
                $(".player1-box").addClass("has-background-primary has-text-white");
                $(".player2-box").removeClass("has-background-primary has-text-white");

                // Update the display if both players are in the game
                if (player.number == 1) {
                    // It's turn 1 and the user is player 1. It's the user's turn to select r, p, s
                    $(".turn").show();
                    $(".turn").text("It's your turn!");
                    $(".wait").hide();
                    $(".player-choices-1").show();
                    $(".player-choices-2").hide();
                    $(".player-select-1").show();
                    $(".player-select-2").hide();

                } else {
                    // It's turn 1 and the user is player 2. The user cannot see what player1 selects
                    $(".turn").hide();
                    $(".wait").show();
                    $(".wait").text("Waiting for " + opponent.name + " to choose.");
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();
                    $(".player-select-1").hide();
                    $(".player-select-2").hide();
                }
            } else {
                console.log("TURN for Player 2");
                turn = 2;
                // If it's player2's turn
                // Update display of Player2's box with green border
                $(".player1-box").removeClass("has-background-primary has-text-white");
                $(".player2-box").addClass("has-background-primary has-text-white");
                // Update the display if both players are in the game
                if (player.number == 2) {
                    // It's turn 2 and the user is player 2. It's the user's turn to select r, p, s
                    $(".turn").show();
                    $(".turn").text("It's your turn!");
                    $(".wait").hide();
                    $(".player-choices-1").hide();
                    $(".player-choices-2").css('display', 'block');
                    $(".player-select-1").hide();
                    $(".player-select-2").show();
                } else {
                    // It's turn 2 and the user is player 1. The user cannot see what player1 selects
                    $(".turn").hide();
                    $(".wait").show();
                    $(".wait").text("Waiting for " + opponent.name + " to choose.");
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();
                    $(".player-select-1").hide();
                    $(".player-select-2").hide();
                }
            }
        } else {
            return false
        }
    });

    // Click events for Rock, Paper, Scissors
    // ==============================================================
    // Player 1 
    // --------------------------------------------------------------
    $(".player-rock-1").on("click", function (e) {
        e.preventDefault();
        console.log("Player 1 clicked Rock.");
        choice1 = $(this).attr("data-choice");
        choice1Text = $(this).attr("data-text");
        console.log("Player 1 " + player1.name + " select " + choice1Text)
        // Save Player1's choice to database
        database.ref().child("/players/1/choice").set(choice1Text);
        // Set the turn value to 2, as it is now player2's turn
        turn = 2;
        database.ref().child("/turn").set(2);

    });

    $(".player-paper-1").on("click", function (e) {
        e.preventDefault();
        console.log("Player 1 clicked Paper.");
        choice1 = $(this).attr("data-choice");
        choice1Text = $(this).attr("data-text");
        console.log("Player 1 " + player1.name + " select " + choice1Text)
        // Save Player1's choice to database
        database.ref().child("/players/1/choice").set(choice1Text);
        // Set the turn value to 2, as it is now player2's turn
        turn = 2;
        database.ref().child("/turn").set(2);
    });
    $(".player-scissors-1").on("click", function (e) {
        e.preventDefault();
        console.log("Player 1 clicked Scissors.");
        choice1 = $(this).attr("data-choice");
        choice1Text = $(this).attr("data-text");
        console.log("Player 1 " + player1.name + " select " + choice1Text)
        // Save Player1's choice to database
        database.ref().child("/players/1/choice").set(choice1Text);
        // Set the turn value to 2, as it is now player2's turn
        turn = 2;
        database.ref().child("/turn").set(2);
    });

    // Player 2
    // --------------------------------------------------------------
    $(".player-rock-2").on("click", function (e) {
        e.preventDefault();
        console.log("Player 2 clicked Rock.");
        // Reference the value of Player2's choice 
        choice2 = $(this).attr("data-choice");
        choice2Text = $(this).attr("data-text");
        console.log("Player 2 " + player2.name + " select " + choice2Text)
        // Save Player1's choice to database
        database.ref().child("/players/2/choice").set(choice2Text);


        // Player2 will always play after, so we can calculate outcome after Player2 selects
        // Compare player1 and player 2 choices and record the outcome
        getWinner(choice1, choice2);
    });
    $(".player-paper-2").on("click", function (e) {
        e.preventDefault();
        console.log("Player 2 clicked Paper.");
        // Reference the value of Player2's choice 
        choice2 = $(this).attr("data-choice");
        choice2Text = $(this).attr("data-text");
        console.log("Player 2 " + player2.name + " select " + choice2Text)
        // Save Player1's choice to database
        database.ref().child("/players/2/choice").set(choice2Text);

        // Player2 will always play after, so we can calculate outcome after Player2 selects
        // Compare player1 and player 2 choices and record the outcome
        getWinner(choice1, choice2);
    });
    $(".player-scissors-2").on("click", function (e) {
        e.preventDefault();
        console.log("Player 2 clicked Scissors.");
        // Reference the value of Player2's choice 
        choice2 = $(this).attr("data-choice");
        choice2Text = $(this).attr("data-text");
        console.log("Player 2 " + player2.name + " select " + choice2Text)
        // Save Player1's choice to database
        database.ref().child("/players/2/choice").set(choice2Text);

        // Player2 will always play after, so we can calculate outcome after Player2 selects
        // Compare player1 and player 2 choices and record the outcome
        getWinner(choice1, choice2);
    });


    // =============================================================
    // Function to Calculate Winner
    // =============================================================

    function getWinner(choice1, choice2) {
        if (choice1 === choice2) { recordTie(); }
        if (choice1 === 'r' && choice2 === 's') { recordWin('1', '2'); }
        if (choice1 === 'r' && choice2 === 'p') { recordWin('2', '1'); }
        if (choice1 === 'p' && choice2 === 'r') { recordWin('1', '2'); }
        if (choice1 === 'p' && choice2 === 's') { recordWin('2', '1'); }
        if (choice1 === 's' && choice2 === 'p') { recordWin('1', '2'); }
        if (choice1 === 's' && choice2 === 'r') { recordWin('2', '1'); }
    };

    function recordTie() {
        console.log("This round is a tie.")
        player.turns++
        database.ref("/players/").child(player.number).update({
            choice: '',
            turns: player.turns
        });
        player.ties++;
        database.ref("/players/").child(player.number).update({
            ties: player.ties
        });
        endGameRound("It's a tie.");
    };

    function recordWin(winner, loser) {
        console.log(winner + " is a winner. " + loser + " is a loser");
        player.turns++
        database.ref("/players/").child(player.number).update({
            choice: '',
            turns: player.turns
        });

        // If you are a winner, record your wins
        if (winner === player.number) {
            player.wins++;
            database.ref("/players/").child(winner).update({
                wins: player.wins
            });

        } else {
            // If you are a loser, record your losses
            player.losses++;
            players.child(loser).update({
                losses: player.losses
            });
        }
        // Update game result
        endGameRound("Player " + winner + " wins!");
    }

    function endGameRound(annoucement) {
        updateStat();
        $('.player-game-result-' + opponent.number).text(opponent.choiceText).show();
        $(".turn").hide();
        $(".winner").text(annoucement);
        hidePlayerChoices();
        setTimeout(startNewRound, 3000);
    }

    function startNewRound() {
        $(".winner").empty();
        $(".turn").show();
        player.choice = "";
        opponent.choice = "";
        // Set the turn value to 2, as it is now player1's turn
        turn = 1;
        database.ref().child("/turn").set(1);
    }

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

            database.ref().child("/turn/").set(0);
        }
        return false;
    });


    // =============================================================
    // Functions for changing HTML elements
    // =============================================================

    function renderPlayer() {

        $(".username-form").hide();
        $(".waiting-player-" + player.number).hide();
        $("#game-notification-message").text("Hello " + player.name + "! You are Player " + player.number + ".");
        $(".player-name-" + player.number).text(player.name);
        updateStat()
        $(".player-stat-" + player.number).show();
        $(".turn").show();
        $(".chat-box").show();
        hidePlayerChoices();

    }

    function renderOpponent() {
        $(".waiting-" + opponent.number).hide();
        $(".player-name-" + opponent.number).text(opponent.name);
        updateStat()
        $(".player-stat-" + opponent.number).show();
        hidePlayerChoices();
    }

    function showPlayerChoices() {
        $(".player-choices-" + player.number).show();
        $(".player-choices-" + opponent.number).show();
    }
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


        // Only show messages sent in the last half hour. A simple workaround for not having a ton of chat history.
        if (Date.now() - chatMessage.timestamp < 1800000) {
            //  update HTML elements.
            var chatDisplay = chatMessage.sender + ' : ' + chatMessage.message + '&#13;&#10;';
            $(".chat-display").append(chatDisplay);
            scrollToBottom();
        }
    });


    // Attach a listener that detects user disconnection events
    database.ref("/players/").on("child_removed", function (snapshot) {
        var msg = snapshot.val().name + " has disconnected!";

        // Get a key for the disconnection chat entry
        var chatKey = database.ref().child("/chat/").push().key;

        // Save the disconnection chat entry
        database.ref("/chat/" + chatKey).set(msg);

        // Updatec chat
        var chatDisplay = msg + '&#13;&#10;';
        $(".chat-display").append(chatDisplay);
        scrollToBottom();
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