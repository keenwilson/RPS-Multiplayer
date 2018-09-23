// Initialize Firebase
// =============================================================

var config = {
    apiKey: "AIzaSyDJIB4hB5B7Ut5AP4QL8KV4F4FtU08BHXI",
    authDomain: "rps-multiplayer-b9d2f.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-b9d2f.firebaseio.com",
    projectId: "rps-multiplayer-b9d2f",
    storageBucket: "rps-multiplayer-b9d2f.appspot.com",
    messagingSenderId: "744450581138"
};
firebase.initializeApp(config);

var turn = 0;

var playerOneName = "";
var playerOneWins = "";
var playerOneLosses = "";
var playerOneChoice = "";

var playerTwoName = "";
var playerTwoWins = "";
var playerTwoLosses = "";
var playerTwoChoice = "";

var chat = "";


// Function to handler clicks
// =============================================================

// Click events for Start button
$("#start-game").on("click", function (e) {
    e.preventDefault();
    console.log("You've clicked a 'start'button.")
    var name = $("#player-name").val().trim();
    console.log(name);
});

// Click events for Rock, Paper, Scissors
$("#player-1-rock").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Rock.");
});
$("#player-1-paper").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Paper.");
});
$("#player-1-scissors").on("click", function (e) {
    e.preventDefault();
    console.log("Player 1 clicked Scissors.");
});
$("#player-2-rock").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Rock.");
});
$("#player-2-paper").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Paper.");
});
$("#player-2-scissors").on("click", function (e) {
    e.preventDefault();
    console.log("Player 2 clicked Scissors.");
});

// Function to handle chat
// ===============================
$("#send-chat").on("click", function (e) {
    e.preventDefault();
    var message = $("#chat-input").val().trim();
    console.log("Send your message: " + message);
});

