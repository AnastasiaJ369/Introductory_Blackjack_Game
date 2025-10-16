fetch ('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
    //const url = new URL('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
    //const pathSegments = url.pathname.split('/');
    //const deckId = pathSegments[pathSegments.length - 6];

    //console.log(deckId) would produce the deck id

    //.then property handles the promise returned by fetch
    .then(response => response.json())
    .then(data => {
        const deckId = data.deck_id;
        // store deck id globally and log it
        window.latestDeckId = deckId;
        console.log('Deck ID:', deckId);
        //second fetch request to draw all 312 cards from the shuffled decks
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=312`);
    })
    .then(response => response.json())
    .then(data => {
    // Render a stacked, face-down pile using the number of cards returned
    const count = Array.isArray(data.cards) ? data.cards.length : (data.remaining || 0);
    renderStackedCards(count);
})
//catches and logs any errors that occur during the fetch requests
.catch(error => {
    console.error('Error:', error);
});

function renderAPICards(cards) {
    const cardContainer = document.getElementById('card-container');
    //Validation check that container exists, stops execution if not found
    if (!cardContainer) return;
    cardContainer.innerHTML = '';
    // Iterate over each card and create its HTML representation
    cards.forEach (card => {
        //new div for each card
        const cardDiv = document.createElement('div');
        //assign css class and inner HTML structure for card
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-back">
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Card Back">
                </div>
                <div class="card-front">
                    <img src="${card.image}" alt="${card.value} of ${card.suit}">
                </div>              
            </div>
        `;
        //adds to parent container in HTML: card-container
        cardContainer.appendChild(cardDiv);
    });
}
/* Render a stacked pile of card backs (face-down). Each card is absolutely 
 * positioned inside the container so they visually overlap into a single pile.
 */
function renderStackedCards(count) {
    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) return;
    cardContainer.innerHTML = '';
    // ensure container is positioned so absolutely positioned children align
    if (window.getComputedStyle(cardContainer).position === 'static') {
        cardContainer.style.position = 'relative';
    }

    const backUrl = 'https://deckofcardsapi.com/static/img/back.png';
    const cardWidth = 100;
    const cardHeight = 145;

    // Create a compact visual pile. We don't need a large offset for each card.
    for (let i = 0; i < count; i++) {

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card back-stack';
        cardDiv.style.position = 'absolute';
        cardDiv.style.right = '0px';
        cardDiv.style.top = '0px';
        const offset = Math.floor(i / 8); // subtle offset every 8 cards
        cardDiv.style.transform = `translate(${offset}px, ${offset}px)`;
        cardDiv.style.zIndex = `${i}`;
        cardDiv.innerHTML = `<img src="${backUrl}" alt="Card Back" style="width:${cardWidth}px;height:${cardHeight}px;display:block;">`;
        cardContainer.appendChild(cardDiv);
    }
}