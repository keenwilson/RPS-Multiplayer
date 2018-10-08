# RPS-Multiplayer


Welcome to Rock-Paper-Scissors Multiplayer! Just like when we play this game at the playground, you won't be able to play it alone. So, be sure to grab a friend (or a second browser tab!). [Click to Play](https://keenwilson.github.io/RPS-Multiplayer/ "Rock-Paper-Scissors Multiplayer")
---

![Show Choices to Player 1](./assets/screenshots/screenshot-showplayer1choices.png)

![Show Choices to Player 2](./assets/screenshots/screenshot-showplayer2choices.png)

![Show Choices to Player 2](./assets/screenshots/screenshot-annoucewinner.png)

##  Technical Approach
This app utilizes the concept of data-persistence and simple server-side (Firebase) approaches for storing data using `firebase.database.Reference` methods such as  `child`, `on`, `once`, `onDisconnect`, `set`, and `update`. 

### How this app is built
* Created an online _two-player Rock-Paper-Scissors_ game with the help of _Firebase_ to store and sync data between users and devices in realtime using **_a cloud-hosted, NoSQL database_**. 
* Utilized  `JavaScript` to build game logic and display results.
* Use  `Bulma CSS framework` to make development lifecycle faster and easier. 
* This app comes with chat functionality that users can send texts and see if the opponent has disconnected.

---

## User Story
* Only two users can play at the same time.
* Both players pick either rock, paper or scissors. After the players make their selection, the game will tell them whether a tie occurred or if one player defeated the other.
* The game will track each player's wins and losses.

---

## Author

[Keen Wilson](https://github.com/keenwilson/keenwilson.github.io "Keen Wilson's Portfolio")


