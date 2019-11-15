
const wrongMatchWaitTime = 1250; // in milliseconds

let numberOfMoves = 0;
let matchedCards = 0;
let openCardList = [];

let ableToInteract = true;


const deck = document.querySelector('.deck');
const movesText = document.querySelector('.moves');
const restartButton = document.querySelector('.restart');

// Add event listeners
deck.addEventListener('click', onCardClicked);
restartButton.addEventListener('click', onRestartGame);

const cardList = document.querySelectorAll('.card');
const cardArray = Array.from(cardList);

// TODO: Shuffle deck and update with document fragment
// TODO: Timer
// TODO: Star counter
// TODO: Win condition modal

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

    if(ableToInteract) {

    for(var i = 0; i< cardList.length; i++) {
        if(cardClicked === cardList[i]) {
            console.log("True index" + i);

            isCardClickable(cardClicked);
        }
    }
}
}

function isCardClickable(cardClicked) {
    // If the card's state is open or match it is considered 'unclickable'
    let isUnclickable = cardClicked.className.includes('open') || cardClicked.className.includes('match');

    // If card is clickable flip the card
    if(isUnclickable == false) {
        // Locks event listeners until after player's turn is over
        ableToInteract = false;

        console.log('clickable');
        flipCard(cardClicked)
    }
}

function flipCard(cardClicked) {
    // Update clicked card to open/show state
    cardClicked.classList.add('open', 'show');

    // Add card to open list
    openCardList.push(cardClicked);

    // If we have two cards open, deterimine if they match
    if(openCardList.length == 2) {
        determineMatch(cardClicked);
    } 
    else {
        // Otherwise end the player's turn
        endTurn();
    }     
}

function determineMatch(cardClicked) {
        
    // Grab the face of the clicked card
    let cardFace = cardClicked.innerHTML;

        // If card face's match, we have a match
        // We only need loose equality since we're comparing content of strings
        if(cardFace == openCardList[0].innerHTML) {
            foundMatch(cardClicked);
        }
        else {
            // No Match
            noMatch(cardClicked);
        }

    // Increment player moves
    updateMoves();     
}

function foundMatch(cardClicked) {
    console.log("match");
    
    // Update player's score
    updateScore();

    // Set cards to match state
    // For 2 cards the overhead for a loop seemed unecessary. 
    openCardList[0].classList.remove('open', 'show');
    openCardList[0].classList.add('match');
    openCardList[1].classList.remove('open', 'show');
    openCardList[1].classList.add('match');

    // Reset open card array and end player's turn
    resetOpenCardList();
    endTurn();
}

function noMatch(cardClicked) {
    console.log("no match");

    // Wait a bit so player can see their cards did not match
   setTimeout( function () {
       
    // Set cards to open/show state
    // For 2 cards the overhead for a loop seemed unecessary. 
    openCardList[0].classList.remove('open', 'show');
    openCardList[1].classList.remove('open', 'show');
    resetOpenCardList();
    endTurn();
   }, wrongMatchWaitTime);
}

// Empty the array that keeps track of open cards
function resetOpenCardList() {
    openCardList = [];
}

// Update the move counter and the corresponding CSS
function updateMoves() {
    numberOfMoves++;
    movesText.innerHTML = numberOfMoves;
}

// Update the score
function updateScore() {
    matchedCards++;
}

// End player's turn
function endTurn() {
    ableToInteract = true;
}

// Reset and start a new game
function onRestartGame(e) {
    if(ableToInteract) {
        ableToInteract = false;
    resetMoves();
    resetScore();
    resetOpenCardList();
    //createNewDeck();

    ableToInteract = true;
    }
}

// Reset move counter and correspoding CSS
function resetMoves() {
    numberOfMoves = 0;
    movesText.innerHTML = numberOfMoves;
}

function resetScore() {
    numberOfMatches = 0;
}