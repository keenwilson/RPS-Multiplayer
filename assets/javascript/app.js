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

    // Initial Values
    var playerConnected;
    var player1 = null;
    var player1name;
    var player1number;

    var player2 = null;
    var player2name;
    var player2number;

    var currentPlayerName;


    var player = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        choice: "",
    };
    var opponent = {
        number: "0",
        name: "",
        wins: 0,
        losses: 0,
        choice: "",
    };

    var wins1, wins2, losses1, losses2;

    // What Player1 and Player2 select (r, p, or s)
    var choice1 = "";
    var choice2 = "";
    var choice1Text = "";
    var choice2Text = "";

    // jQuery to grab elements for game messages
    var $greeting = $("#game-notification-message");
    var $startButton = $("#start-game");
    var $turnSignal = $(".turn");
    var $winner = $(".winner-announcement");



    function listeners() {

        // Click events for Join button to submit a name
        // --------------------------------------------------------------
        $("#user-enter").one("click", function (e) {
            e.preventDefault();
            currentPlayerName = $("#username").val().trim();
            if (currentPlayerName.length > 0) {
                database.ref("/players/").child(player.number).update({
                    name: currentPlayerName
                });
            }
            return false;
        });
        // --------------------------------------------------------------

        // Click events for Start! button
        // --------------------------------------------------------------
        $("#start-game").on('click', function (e) {
            e.preventDefault();
            // Initiate Game
            firebase.database().ref("/turn/").set({
                game: 'start',
                player: player1name
            });
            $startButton.hide()
            return false;
        })
        // --------------------------------------------------------------


        // .once listens for exactly one event of /"players"/ path
        // --------------------------------------------------------------
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
                // Remove user from the connection list if they close browser or refresh
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
        // --------------------------------------------------------------

        // Display player name and wins/losses stat in a box
        // --------------------------------------------------------------
        database.ref("/players/").on('value', function (snapshot) {

            // Check if player1 exists in Firebase
            if (snapshot.child('1').exists()) {

                if (snapshot.val()[1].name === "") {
                    // Player 1 is available but has no name value
                    // You are player 1. Please enter your name.
                    $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");
                    // Set the status of the tirn to 'waiting'
                    database.ref().child("/turn/").set({
                        game: 'waiting',
                        player: 'waiting for player'
                    });

                    // Make R, P, S buttons hidden
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();

                    // Hide start button
                    $startButton.hide();

                } else {
                    // Player 1 exists in database.
                    // Save Player 1 data to local player1
                    player1 = snapshot.val()[1];
                    player1name = player1.name;
                    player1number = player1.number;

                    // Update Playey1 Display
                    // Say 'Hi player1's name' and 'Waiting for Player 2'
                    $greeting.text("Hi " + player1name + "! You're Player 1.");

                    $(".player-name-1").text(player1name)
                    $(".waiting-player-1 ").hide();
                    $(".waiting-player-2 ").show();

                    // Set and display player1's game stat
                    $(".player-stat-1").text("Wins: " + player1.wins + " | Losses: " + player1.losses).show();;
                    // Hide start button
                    $startButton.hide();


                }
            } else {
                // No player1 exist
                player1 = null;
                player1name = "";

                // Show text "Waiting for Player 1"
                $(".waiting-player-1 ").show();
                // Hide start button
                $startButton.hide();
            }

            // Check if player2 exists in Firebase
            if (snapshot.child('2').exists()) {
                if (snapshot.val()[2].name === "") {
                    // Player 2 is available but has no name value
                    // You are player 2. Please enter your name.
                    $greeting.text("Welcome to Rock-Paper-Scissors. Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!).");
                    // Set the status of the turn to 'waiting'
                    database.ref().child("/turn/").set('waiting');

                    // Make R, P, S buttons hidden
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();

                    // Hide start button
                    $startButton.hide();



                } else {
                    // Only execute if the database already has player1
                    if (snapshot.child('1').exists() && snapshot.val()[1].name !== "") {
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

                        $(".player-stat-2").text("Wins: " + player2.wins + " | Losses: " + player2.losses).show();;
                        // Hide start button
                        $startButton.hide();
                    };
                }

            } else {
                // No player2 exist
                player2 = null;
                player2name = "";

                // Show text "Waiting for Player 2"
                $(".waiting-player-2 ").show();
                // Hide start button
                $startButton.hide();
            }


            if (player1 && player2) {
                // If both player1 & player2 exists in Firebase

                // Remove the form for username input
                $(".username-form").hide();

                // Remove text "Waiting for player 1 & 2"
                $(".waiting-player-1 ").hide();
                $(".waiting-player-2 ").hide();


                // Start round
                //$startButton.show();

                // check if the user is player1 or player2
                if (currentPlayerName === player1name) {
                    // The user is player1. 
                    // Save local player equalto player1 & local opponent equal player2.
                    player = player1;
                    opponent = player2;
                    currentPlayerNumber = player1number;
                    // Customize greeting
                    $greeting.text("The game has started. You're Player 1, " + player1name + "!");

                    // Notice the connection of player1
                    database.ref("/connections").child("player1").set("on")
                    // Remove user from the connection list if they close browser or refresh
                    database.ref("/connections").child("player1").onDisconnect().remove();



                } else if (currentPlayerName === player2name) {
                    // The user is player2.
                    // Save local player equalto player2 & local opponent equal player1.
                    player = player2;
                    opponent = player1;
                    currentPlayerNumber = player2number;
                    // Customize greeting
                    $greeting.text("The game has started. You're Player 2, " + player2name + "!");

                    // Notice the connection of player2
                    database.ref("/connections").child("player2").set("on")
                    // Remove user from the connection list if they close browser or refresh
                    database.ref("/connections").child("player2").onDisconnect().remove();


                } else {
                    // If the user is not one of the current players.
                    $greeting.text("Two players are currently playing. Please come back later!");
                    $("#game-notification").removeClass("is-primary");
                    $("#game-notification").addClass("is-warning");

                }
            }
        });
        // --------------------------------------------------------------

        //  Listen for the connections of both players in order to start a game
              database.ref("/connections/").on("value", function (shapshot){
                 console.log("/connections/ shapshot.val()", shapshot.val());
     
                 if ((shapshot.child("player1").exists()) && (shapshot.child("player2").exists())) {
                     // Start round
                    gameCanStart = true;
                    $startButton.show()
                 } else {
                    gameCanStart = false;
                    $startButton.hide()
                 }
     
             }); 

        // Listen for gameCanstart
        database.ref("/turn/").on("value", function (shapshot) {
            console.log("/turn/ shapshot.val()", shapshot.val());
            if ((shapshot.val() === "waiting") && (gameCanStart = true)) {
                $startButton.show()
            } else {
                $startButton.hide()
            }

        });




        // Listen for change in wins, losses, and ties for player1
        // --------------------------------------------------------------
        database.ref("/players/1/").on('child_changed', function (childSnapshot) {

            console.log("player1 childshapshot.key", childSnapshot.key);

            if (childSnapshot.key == 'wins') {
                wins1 = childSnapshot.val();
            } else if (childSnapshot.key == 'losses') {
                losses1 = childSnapshot.val();
            } else if (childSnapshot.key == 'ties') {
                ties1 = childSnapshot.val();
            }
            // Update score display
            if (wins1 !== undefined) {
                $(".player-stat-1").text("Wins: " + wins1 + " | Losses: " + losses1);
            }
        });



        // --------------------------------------------------------------

        // Listen for change in wins, losses, and ties for player2
        // --------------------------------------------------------------
        database.ref("/players/2/").on('child_changed', function (childSnapshot) {
            console.log("player2 childshapshot.key"
                , childSnapshot.key);
            if (childSnapshot.key == 'wins') {
                wins2 = childSnapshot.val();
            } else if (childSnapshot.key == 'losses') {
                losses2 = childSnapshot.val();
            } else if (childSnapshot.key == 'ties') {
                ties2 = childSnapshot.val();
            }
            // Update score display
            if (wins1 !== undefined) {
                $(".player-stat-1").text("Wins: " + wins2 + " | Losses: " + losses2);
            }
        });
        // --------------------------------------------------------------

        // Attach a listener to players's turn to listen for any changes
        // --------------------------------------------------------------
        database.ref("/turn/").on('value', function (snapshot) {
            if (snapshot.child("/game/").val() === 'start') {

                // Hide 'Start' button on both players' screens
                $startButton.hide();
                $turnSignal.text("").hide();
                $winner.text("").hide();
                $(".player-choices-1").show();
                $(".player-choices-2").show();

                // Start game with Player1's turn
                // Set the turn on database for both players is 1
                database.ref("/players/").child(player.number).update({
                    turn: '1',
                });


                // User is player1
                if (snapshot.child("/player/").val() === currentPlayerName) {
                    // Update display of Player1's box with green border
                    boxBackgroundHighlightPlayer1();

                    // Tell Player1 "it's your turn"
                    $turnSignal.text("It's your turn!").show();;

                    // Display R, P, S buttons for Player1 to select
                    $(".player-choices-1").show();
                    $(".player-choices-2").hide();
                }

                // User is player2
                if (snapshot.child("/player/").val() !== currentPlayerName) {

                    // Update display of Player1's box with green border
                    boxBackgroundHighlightPlayer1();

                    // Make R, P, S buttons hidden
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();

                    $turnSignal.text("Waiting for " + player1.name + " to choose.").show();
                    $("#player-select-1").text(player1.name + " is selecting").show();
                }

                // Continue game with Player2's turn
            } else if (snapshot.child("/game/").val() === 'continue') {

                // Hide 'Start' button on both players' screens
                $startButton.hide();

                // Set the turn on database for both players is 2
                database.ref("/players/").child(player.number).update({
                    turn: '2',
                });

                // Set local turn to 1 and start round
                turn = 2;

                // User is player2
                if (snapshot.child("/player/").val() === currentPlayerName) {
                    // Update display of Player1's box with green border
                    boxBackgroundHighlightPlayer2();

                    // Display R, P, S buttons for Player2 to select
                    $(".player-choices-1").hide();
                    $(".player-choices-2").show();

                    // Tell Player2 "it's your turn"
                    $turnSignal.text("It's your turn!").show();;

                    // Tell Player2 that Player1 has selected
                    $("#player-select-1").text(player1.name + " has selected.").show();
                }

                // User is player1
                if (snapshot.child("/player/").val() !== currentPlayerName) {

                    // Update display of Player1's box with green border
                    boxBackgroundHighlightPlayer2();

                    // Make R, P, S buttons hidden
                    $(".player-choices-1").hide();
                    $(".player-choices-2").hide();

                    $turnSignal.text("Waiting for " + player2.name + " to choose.").show();
                    $("#player-select-1").text("You have selected.").show();
                }

            } else if (snapshot.child("/game/").val() === 'result') {
                boxBackgroundHighlightCenter();

                $(".player-choices-1").hide();
                $(".player-choices-2").hide();

                $("#player-select-1").text("You have selected.").show();
                $("#player-select-2").text("You have selected.").show();


                // calculate outcome
                outcome();
            } else {
                return false
            }
        });
        // --------------------------------------------------------------


    }; // End function listeners();


    //===============================================================
    // Click events for to set choice for Rock, Paper, Scissors
    // ==============================================================
    // Player 1 
    // --------------------------------------------------------------
    $(document).on("click", ".player-choices-1", function (e) {
        e.preventDefault();
        choice1 = $(this).attr("data-choice");
        choice1Text = $(this).attr("data-text");

        // Save Player1's choice to database
        database.ref().child("/players/1/choice").set(choice1Text);

        // Update database turn to 'continue' player2's turn
        database.ref().child("/turn/").update({
            game: 'continue',
            player: player2name
        });
        return false;
    });

    // Click events for to set choice for Rock, Paper, Scissors
    // ==============================================================
    // Player 2
    // --------------------------------------------------------------
    $(document).on("click", ".player-choices-2", function (e) {
        e.preventDefault();

        // Reference the value of Player2's choice 
        choice2 = $(this).attr("data-choice");
        choice2Text = $(this).attr("data-text");
        console.log("Player 2 " + player2.name + " select " + choice2Text)
        // Save Player2's choice to database
        database.ref().child("/players/2/").update({
            choice: choice2Text,
        });

        database.ref().child("/turn/").update({
            game: 'result',
            player: '',
        });

        return false;
    });

    // =============================================================
    // Function to Calculate Winner and Display Outcome
    // =============================================================

    function outcome() {
        // Get choice, wins, losses, ties of both player1 and player2 from database
        database.ref("/players/").once('value', function (snapshot) {
            var snap1 = snapshot.val()[1];
            var snap2 = snapshot.val()[2];

            choice1 = snap1.choice;
            wins1 = snap1.wins;
            losses1 = snap1.losses;
            ties1 = snap1.ties;

            choice2 = snap2.choice;
            wins2 = snap2.wins;
            losses2 = snap2.losses;
            ties2 = snap2.ties;
        });
        logic();
    };
    // --------------------------------------------------------------

    function logic() {
        // Review choices and find a winner

        if (choice1 === choice2) {
            winner(0, choice1, choice2);
        } else if (choice1 == 'rock') {
            if (choice2 == 'paper') {
                winner(2, choice1, choice2);
            } else if (choice2 == 'scissors') {
                winner(1, choice1, choice2);
            }

        } else if (choice1 == 'paper') {
            if (choice2 == 'rock') {
                winner(1, choice1, choice2);
            } else if (choice2 == 'scissors') {
                winner(2, choice1, choice2);
            }

        } else if (choice1 == 'scissors') {
            if (choice2 == 'rock') {
                winner(2, choice1, choice2);
            } else if (choice2 == 'paper') {
                winner(1, choice1, choice2);
            }
        }
    };
    // --------------------------------------------------------------

    function winner(playerNumber, choice1, choice2) {
        var results;

        if (playerNumber == 0) {
            results = "It's a Tie!";
        } else {
            results = "Player " + playerNumber + " Wins!"

            // Set wins and losses to the winner and the loser
            if (playerNumber == 1) {
                wins = wins1;
                losses = losses2
            } else {
                wins = wins2;
                losses = losses1;
            }
            // Increment local wins and local losses
            wins++;
            losses++;

            // Set wins and losses on database
            var opponentNumber = playerNumber == 1 ? 2 : 1;

            window.setTimeout(function () {
                database.ref("/players/").child(playerNumber).update({
                    'wins': wins,
                })
                database.ref("/players/").child(opponentNumber).update({
                    'losses': losses,
                })
            }, 500)
        };
        //Display results
        window.setTimeout(function () {
            boxBackgroundHighlightCenter();
            $startButton.hide();


            $(".player-choices-1").hide();
            $(".player-choices-2").hide();

            $("#player-select-1").text(choice1).show();
            $("#player-select-2").text(choice2).show();


            $(".winner-announcement").text(results).show();
        }, 500)

        window.setTimeout(function () {
            boxBackgroundDefault();
            $startButton.hide();
            $(".winner-announcement").text('').hide();
            $("#player-select-1").text('').hide();
            $("#player-select-2").text('').hide();
        }, 3000)
        window.setTimeout(function () {
            database.ref("/turn/").set({
                // Reset turn to start
                game: 'start',
                player: player1name
            })
            $startButton.hide();
        }, 3000)
    };
    // --------------------------------------------------------------


    // =============================================================
    // Functions for changing HTML elements
    // =============================================================

    // Function to toggle box background color
    // --------------------------------------------------------------
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
    // --------------------------------------------------------------

    // Close notification
    // --------------------------------------------------------------
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
    // --------------------------------------------------------------

    // Make the chat work on the enter 
    // --------------------------------------------------------------
    $("#chat-input").keypress(function () {

        if (e.which == 13) {
            $("#send-chat").click();
        }
    });
    // --------------------------------------------------------------

    // Database listening function for  database.ref("/chat/").
    // --------------------------------------------------------------
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
    // --------------------------------------------------------------

    // Attach a listener that detects user disconnection events
    // --------------------------------------------------------------
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
    // --------------------------------------------------------------

    // Find out when the content of the textarea changes 
    // Scroll to the bottom of the chat box
    $(".chat-display").change(function () {
        scrollToBottom();
    });
    // --------------------------------------------------------------

    // Function to scroll to the bottom of the chat box
    var messages = $('.chat-display');
    function scrollToBottom() {
        messages[0].scrollTop = messages[0].scrollHeight;
    };
    // --------------------------------------------------------------

    // Prevent typing in chat box
    $(".chat-display").keypress(function (e) {
        e.preventDefault();
    });
    // --------------------------------------------------------------


    // Start game
    listeners();

    // Scroll to the bottom of the chat box
    scrollToBottom();

}); // End $(document).ready(function(){}