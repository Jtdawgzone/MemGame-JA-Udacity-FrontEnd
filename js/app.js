/*
 * GAME VARIABLES
 */
const WRONG_MATCH_WAIT_TIME = 1250; // in milliseconds
const THREE_STAR_SCORE_MAX = 10; // max number of moves to have this score
const TWO_STAR_SCORE_MAX = 14;
const ONE_STAR_SCORE_MAX = 20;
const TOTAL_MATCHES_POSSIBLE = 8;
const TOTAL_STARS_POSSIBLE = 3;
let numberOfMoves = 0;
let starScore = TOTAL_STARS_POSSIBLE;
let matchesLeft = TOTAL_MATCHES_POSSIBLE;
let openCardArray = [];
let ableToInteract = false;
let numberOfSeconds = 0;
let secondsTimer;
let modalBoxText;

/*
 * QUERIES
 */
const MODAL = document.querySelector(".modal");
const MODAL_CONTENT = document.querySelector(".modal-content");
const MODAL_CLOSE_BUTTON = document.querySelector(".modal-close-button");
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

function resetStarScore() {
  starScore = TOTAL_STARS_POSSIBLE;
  resetStars();
}

function resetStars() {
  let stars = document.querySelectorAll(".fa-star");

  let starsToAdd = TOTAL_STARS_POSSIBLE - stars.length;

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

/*
 * GAME LOGIC SECTION
 */

 /*
  *  SETUP LOGIC SECTION
  */

 /*
  * Starts a new game
  */
 function startNewGame() {
  resetClock();
  createNewDeck();
  createEventListeners();
  startSecondsTimer();
  ableToInteract = true;
}

// Reset and start a new game
function onRestartGameClicked(e) {
  if (ableToInteract) {
    ableToInteract = false;
    stopTimer = true;
    removeEventListeners();
    resetScore();
    resetOpenCardArray();
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
  starScore = TOTAL_STARS_POSSIBLE;
  resetMoves();
}

function createEventListeners() {
  // Repoll for deck since the query is static not dynamic
  // and we replace the deck when we create a new one
  currentDeck = document.querySelector(".deck");

  // Add listeners
  currentDeck.addEventListener("click", onCardClicked);
  RESTART_BUTTON.addEventListener("click", onRestartGameClicked);
  MODAL_CLOSE_BUTTON.addEventListener("click", onModalCloseClicked);
}

function removeEventListeners() {
  currentDeck.removeEventListener("click", onCardClicked);
  RESTART_BUTTON.removeEventListener("click", onRestartGameClicked);
  MODAL_CLOSE_BUTTON.removeEventListener("click", onModalCloseClicked);
}

function toggleModalBox() {
  MODAL.classList.toggle("show-modal");
}

function onModalCloseClicked() {
  MODAL.classList.toggle("show-modal");
}



function resetClock() {
  clearTimeout(secondsTimer);
  numberOfSeconds = 0;
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


/*
 * Shuffles the deck based on the current one and updates the DOM with the new deck
 */
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
  *  PLAY LOGIC SECTION
  */

 /*
 * Event Handler for when a card is clicked. Checks to see which card was clicked and 
 * then checks to see if that card was 'clickable'.
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

/*
 * Determines if the player is able to click the card they clicked. 
 * Aka the card is face-down and not open or matched. A player is not
 * penalized for clicking a card that is already showing.
 */
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
    flipCard(cardClicked);
  }
}

/*
 * Flips the card that was clicked (changes it to open and show state)
 */
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

/*
 * Determines if the card that was flipped matches the other card already being shown
 */
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

  // Adjust star score based on number of moves performed
  updateStarScore();
}

/*
 * Changes both cards to the match state since a match was found.
 * After doing so resets the open card array. 
 */
function foundMatch(cardClicked) {
  // Match fouund decrement counter
  matchesLeft--;

  // Set cards to match state
  // For 2 cards the overhead for a loop seemed unecessary.
  openCardArray[0].classList.remove("open", "show");
  openCardArray[0].classList.add("match");
  openCardArray[1].classList.remove("open", "show");
  openCardArray[1].classList.add("match");

  // Reset open card array
  resetOpenCardArray();

  // Check if player has won, if not end turn
  if (matchesLeft == 0) {
    endGame();
  } else {
    endTurn();
  }
}

/*
 * Pauses player interaction so they can see their cards do not match.
 * After the timeout expires, flips both open cards back to face-down.
 */
function noMatch(cardClicked) {
  // Wait a bit so player can see their cards did not match
  setTimeout(function() {
    // Set cards to open/show state
    // For 2 cards the overhead for a loop seemed unecessary.
    openCardArray[0].classList.remove("open", "show");
    openCardArray[1].classList.remove("open", "show");
    resetOpenCardArray();
    endTurn();
  }, WRONG_MATCH_WAIT_TIME);
}

/*
 * Empty the array that keeps track of open cards
 */
function resetOpenCardArray() {
  openCardArray = [];
}

/*
 * Updates the move counter and the corresponding CSS
 */
function updateMoves() {
  numberOfMoves++;
  MOVES_TEXT.innerHTML = numberOfMoves;
}

/*
 * Updates the star score and CSS
 */
function updateStarScore() {
  if (
    numberOfMoves == THREE_STAR_SCORE_MAX ||
    numberOfMoves == TWO_STAR_SCORE_MAX ||
    numberOfMoves == ONE_STAR_SCORE_MAX
  ) {
    removeStarElement();
    starScore--;
  }
}

/*
 * Removes a star element from the CSS
 */
function removeStarElement() {
  stars = document.querySelectorAll(".fa-star");
  let starsArray = Array.from(stars);

  starsArray[0].remove();
}

/*
 * Updates the game timer
 */
function updateGameTimer() {
  GAME_TIMER.innerHTML = formatGameTimerText();
}

/*
 * Formats the game timer text for CSS
 */
function formatGameTimerText() {
  let formattedTimerText;

  if (numberOfSeconds >= 0 && numberOfSeconds < 10) {
    formattedTimerText = "0" + numberOfSeconds;
  } else {
    formattedTimerText = numberOfSeconds;
  }

  return formattedTimerText;
}

/*
 * End the player's turn
 */
function endTurn() {
  ableToInteract = true;
}

/*
 * END GAME LOGIC SECTION
 */

/*
 * Ends the game and displays the score modal box
 */
function endGame() {
  updateModalBoxText();
  toggleModalBox();
}

/*
 * Formats End Game Score Box
 */
function updateModalBoxText() {
  let modalTextHeader = document.createElement("h2");
  modalTextHeader.style.color = "#5FC663";

  if (numberOfMoves == 8) {
    modalTextHeader.textContent = "Perfect game, amazing!";
  }

  switch (starScore) {
    case 0:
      modalTextHeader.textContent = "0 Stars, try again!";
      break;
    case 1:
      modalTextHeader.textContent = "1 Star, solid!";
      break;
    case 2:
      modalTextHeader.textContent = "2 stars, great job!";
      break;
    case 3:
      if (numberOfMoves == 8) {
        modalTextHeader.textContent = "Perfect game, amazing!";
      } else {
        modalTextHeader.textContent = "3 stars, wow!";
      }
      break;
  }

  MODAL_CONTENT.appendChild(modalTextHeader);

  let numberOfMovesElement = document.createElement("h4");
  numberOfMovesElement.style.color = "#C4BBCD";
  numberOfMovesElement.innerHTML =
    "Number of Moves:&nbsp&nbsp&nbsp&nbsp&nbsp" +
    numberOfMoves +
    "<br>" +
    "Number of Seconds:&nbsp&nbsp&nbsp&nbsp&nbsp" +
    numberOfSeconds;
  numberOfMovesElement.style.width = "auto";

  MODAL_CONTENT.appendChild(numberOfMovesElement);
}
