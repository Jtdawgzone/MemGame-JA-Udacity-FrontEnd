// Game variables
const WRONG_MATCH_WAIT_TIME = 1250; // in milliseconds
const THREE_STAR_SCORE_MAX = 10; // max number of moves to have this score
const TWO_STAR_SCORE_MAX = 14;
const ONE_STAR_SCORE_MAX = 20;
const TOTAL_MATCHES_POSSIBLE = 8;
let numberOfMoves = 0;
let matchesLeft = TOTAL_MATCHES_POSSIBLE;
let openCardArray = [];
let ableToInteract = false;
let numberOfSeconds = 0;
let secondsTimer;

// Queries
const MODAL = document.querySelector(".modal");
//const MODAL_CLOSE_BUTTON = document.querySelector(".close-modal-button")
const GAME_TIMER = document.querySelector(".game-timer");
const DECK_CONTAINER = document.querySelector(".container");
const MOVES_TEXT = document.querySelector(".moves");
const STAR_CONTAINER = document.querySelector(".stars");
const RESTART_BUTTON = document.querySelector(".restart");
let currentDeck;
let cardList;
// Helper variables for queries
let cardArray = [];
let shuffledArray = [];

// START THE GAME!
startNewGame();

// TODO: Timer
// TODO: Win condition modal

function resetStars() {
  let stars = document.querySelectorAll(".fa-star");

  let starsToAdd = 3 - stars.length;

  let starFragment = document.createDocumentFragment();
  for (let i = 0; i < starsToAdd; i++) {
    let newStar = buildStarElement();
    starFragment.appendChild(newStar);
  }

  STAR_CONTAINER.appendChild(starFragment);
}

function buildStarElement() {
  let star = document.createElement("li");
  star.innerHTML = "<i class='fa fa-star'></i>";

  return star;
}

// Shuffles the deck based on the current one and updates the DOM with the new deck
function createNewDeck() {
  cardList = document.querySelectorAll(".card");
  currentDeck = document.querySelector(".deck");

  // cardList is a list of Nodes, convert to Array so we can shuffle
  let cardArray = Array.from(cardList);
  // Shuffle deck
  let shuffledArray = shuffle(cardArray);

  // Create new deck fragment and add deck HTML
  let deckFragment = document.createDocumentFragment();
  let newDeck = document.createElement("ul");
  newDeck.className = "deck";
  deckFragment.appendChild(newDeck);

  // Add new cards to the new Deck HTML node
  for (var card of shuffledArray) {
    // Create new card from shuffledArray's card
    var newCard = document.createElement("li");
    newCard.className = "card";
    newCard.innerHTML = card.innerHTML;

    // Add the new card to the new deck
    newDeck.appendChild(newCard);
  }

  // Remove the current deck from the DOM
  currentDeck.remove();
  // Add the new deck
  DECK_CONTAINER.appendChild(newDeck);

  // Query is static so we have to repoll after making changes
  // so we can compare card objects in event listner
  cardList = document.querySelectorAll(".card");
}

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
function onCardClicked(e) {
  let cardClicked = e.target;

  if (ableToInteract) {
    for (var card of cardList) {
      // Checking cards for strict equality since we want it to
      // be the same object we stored earlier that was clicked
      if (cardClicked === card) {
        isCardClickable(cardClicked);
      }
    }
  }
}

function isCardClickable(cardClicked) {
  // If the card's state is open or match it is considered 'unclickable'
  let isCardClickable = !(
    cardClicked.className.includes("open") ||
    cardClicked.className.includes("match")
  );

  // If card is clickable flip the card
  if (isCardClickable) {
    // Locks event listeners until after player's turn is over
    ableToInteract = false;

    console.log("clickable");
    flipCard(cardClicked);
  }
}

function flipCard(cardClicked) {
  // Update clicked card to open/show state
  cardClicked.classList.add("open", "show");

  // Add card to open list
  openCardArray.push(cardClicked);

  // If we have two cards open, deterimine if they match
  if (openCardArray.length == 2) {
    determineMatch(cardClicked);
  } else {
    // Otherwise end the player's turn
    endTurn();
  }
}

function determineMatch(cardClicked) {
  // Grab the face of the clicked card
  let cardFace = cardClicked.innerHTML;

  // Increment player moves
  updateMoves();

  // If card face's match, we have a match
  // We only need loose equality since we're comparing content of strings
  if (cardFace == openCardArray[0].innerHTML) {
    foundMatch(cardClicked);
  } else {
    // No Match
    noMatch(cardClicked);
  }

  updateScore();
}

function foundMatch(cardClicked) {
  console.log("match");

  matchesLeft--;

  // Set cards to match state
  // For 2 cards the overhead for a loop seemed unecessary.
  openCardArray[0].classList.remove("open", "show");
  openCardArray[0].classList.add("match");
  openCardArray[1].classList.remove("open", "show");
  openCardArray[1].classList.add("match");

  // Reset open card array and end player's turn
  resetOpenCardList();
  endTurn();
}

function noMatch(cardClicked) {
  console.log("no match");

  // Wait a bit so player can see their cards did not match
  setTimeout(function() {
    // Set cards to open/show state
    // For 2 cards the overhead for a loop seemed unecessary.
    openCardArray[0].classList.remove("open", "show");
    openCardArray[1].classList.remove("open", "show");
    resetOpenCardList();
    endTurn();
  }, WRONG_MATCH_WAIT_TIME);
}

// Empty the array that keeps track of open cards
function resetOpenCardList() {
  openCardArray = [];
}

// Update the move counter and the corresponding CSS
function updateMoves() {
  numberOfMoves++;
  MOVES_TEXT.innerHTML = numberOfMoves;
}

// Update the score
function updateScore() {
  updateStarIndicators();
}

function updateStarIndicators() {
  if (
    numberOfMoves == THREE_STAR_SCORE_MAX ||
    numberOfMoves == TWO_STAR_SCORE_MAX ||
    numberOfMoves == ONE_STAR_SCORE_MAX
  ) {
    removeStarElement();
  }
}

function removeStarElement() {
  stars = document.querySelectorAll(".fa-star");
  let starsArray = Array.from(stars);

  starsArray[0].remove();
}

// End player's turn
function endTurn() {
  ableToInteract = true;
}

// Reset and start a new game
function onRestartGameClicked(e) {
    if (ableToInteract) {
        ableToInteract = false;
        stopTimer = true;
        removeEventListeners();
        resetMoves();
        resetScore();
        resetOpenCardList();
        startNewGame();
    }
}

// Reset move counter and correspoding CSS
function resetMoves() {
  numberOfMoves = 0;
  MOVES_TEXT.innerHTML = numberOfMoves;
}

function resetScore() {
  numberOfMatches = 0;
}

function createEventListeners() {
  // Repoll for deck since the query is static not dynamic
  // and we replace the deck when we create a new one
  currentDeck = document.querySelector(".deck");

  // Add listeners
  currentDeck.addEventListener("click", onCardClicked);
  RESTART_BUTTON.addEventListener("click", onRestartGameClicked);
  //MODAL_CLOSE_BUTTON.addEventListener("click", onModalCloseClicked);
}

function removeEventListeners() {
  currentDeck.removeEventListener("click", onCardClicked);
  RESTART_BUTTON.removeEventListener("click", onRestartGameClicked);
  //MODAL_CLOSE_BUTTON.addEventListener("click", onModalCloseClicked);
}

function showModalBox() {
    MODAL.style.display = "block";
}

function onModalCloseClicked() {
    MODAL.style.display = "none";
}

function startNewGame() {
  resetClock();
  resetStars();
  createNewDeck();
  createEventListeners();
  startSecondsTimer();
  ableToInteract = true;
}

function endGame() {
    showModalBox();
}

function resetClock() {
  clearTimeout(secondsTimer);
  numberOfSeconds = 0;
  console.log("Clock reset");
  updateGameTimer();
}

function startSecondsTimer() {
  secondsTimer = setTimeout(incrementSecondsTimer, 1000);
}

function incrementSecondsTimer() {
    numberOfSeconds++;
    updateGameTimer();
    startSecondsTimer();
}

function updateGameTimer() {
  GAME_TIMER.innerHTML = formatGameTimerText();
}

function formatGameTimerText() {
    let formattedTimerText;

    if(numberOfSeconds >= 0 && numberOfSeconds < 10) {
        formattedTimerText = "0" + numberOfSeconds;
    }
    else {
        formattedTimerText = numberOfSeconds;
    }

    return formattedTimerText;
}
