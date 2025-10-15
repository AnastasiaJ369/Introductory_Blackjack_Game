fetch ('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
    //const url = new URL('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
    //const pathSegments = url.pathname.split('/');
    //const deckId = pathSegments[pathSegments.length - 6];

    //console.log(deckId) would produce the deck id

    //.then property handles the promise returned by fetch
    .then(response => response.json())
    .then(data => {
        const deckId = data.deck_id;
        //second fetch request to draw all 312 cards from the shuffled decks
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=312`);
    })
    .then(response => response.json())
.then(data => {
    renderAPICards(data.cards);
})
//catches and logs any errors that occur during the fetch requests
.catch(error => {
    console.error('Error:', error);
});

function renderAPICards(cards) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '';
    // Iterate over each card and create its HTML representation
    cards.forEach (card => {
        //new div for each card
        const cardDiv = document.createElement('div');
        //assign css class and inner HTML structure for card
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${card.image}" alt="${card.value} of ${card.suit}">
                </div>
                <div class="card-back">
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Card Back">
                </div>
            </div>
        `;
        //adds to parent container in HTML: card-container
        cardContainer.appendChild(cardDiv);
    });
}
