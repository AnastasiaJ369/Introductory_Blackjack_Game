fetch ('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
    //const url = new URL('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
    //const pathSegments = url.pathname.split('/');
    //const deckId = pathSegments[pathSegments.length - 6];

    //console.log(deckId) would produce the deck id

    //.then property handles the promise returned by fetch
    .then(response => response.json())
    .then(data => {
        // Use the initial new/shuffle response only — do NOT draw all cards here.
        const deckId = data.deck_id;
        window.latestDeckId = deckId;
        console.log('Deck ID:', deckId);
        // The response includes how many cards are remaining (deck_count * 52)
        const count = data.remaining || 6 * 52;
        window.latestDeckCount = count;
        console.log('Initial deck remaining:', count);
        renderStackedCards(count);
        showDeckInfo(window.latestDeckId, count);
        // dispatch a custom event so other scripts know the deck is ready
        const ev = new CustomEvent('deckReady', { detail: { deckId: window.latestDeckId, count } });
        window.dispatchEvent(ev);
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
    // ensure the container has an explicit size so absolutely positioned card backs are visible
    if (!cardContainer.style.width) cardContainer.style.width = '120px';
    if (!cardContainer.style.height) cardContainer.style.height = '170px';
    // ensure container is positioned so absolutely positioned children align
    if (window.getComputedStyle(cardContainer).position === 'static') {
        cardContainer.style.position = 'relative';
    }

    const backUrl = 'https://deckofcardsapi.com/static/img/back.png';
    const cardWidth = 100;
    const cardHeight = 145;

    // Count variable is the number of cards to render in the stack
    for (let i = 0; i < count; i++) {

        //div container for each card back
        const cardDiv = document.createElement('div');
        //two CSS classes: 'card' for styling, 'back-stack' for specific back styling
        cardDiv.className = 'card back-stack';
        //ensures the cards can be layered on top of each other
        cardDiv.style.position = 'absolute';
        cardDiv.style.right = '0px';
        cardDiv.style.top = '0px';
        //creates a staggered effect by slightly offsetting every 10 cards
        const offset = Math.floor(i / 10);
        //shifts each card down and to the right by the offset amount
        cardDiv.style.transform = `translate(${offset}px, ${offset}px)`;
        //z-index ensures cards stack in correct order, last card on top
        cardDiv.style.zIndex = `${i}`;
        cardDiv.innerHTML = `<img src="${backUrl}" alt="Card Back" style="width:${cardWidth}px;height:${cardHeight}px;display:block;">`;
        cardContainer.appendChild(cardDiv);
    }
}

(function () {
const rankValue = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10,
    'A': 11 // start as 11, reduce later if needed
};
function apiValueToRank(apiValue) {
    if (!apiValue) return apiValue;
    const v = apiValue.toString().toUpperCase();
    if (v === 'ACE') return 'A';
    if (v === 'KING') return 'K';
    if (v === 'QUEEN') return 'Q';
    if (v === 'JACK') return 'J';
    return v; // '2'..'10'
}
function convertApiCard(apiCard) {
    return {
        rank: apiValueToRank(apiCard.value || apiCard.rank),
    suit: apiCard.suit || apiCard.suit,
    code: apiCard.code,
    image: apiCard.image
    };
}

function handValue(cards) {
    let total = 0;
    let aces = 0;

    for (const c of cards) {
    let rank = c.rank;
    if (!rank && c.value) rank = apiValueToRank(c.value);
    if (!rank) continue;
        if (rank === 'A') {
            aces += 1;
            total += 11;
        } else if (rank === 'K' || rank === 'Q' || rank === 'J') {
            total += 10;
        } else {
            total += Number(rank);
        }
    }
    let acesUsedAsEleven = aces;
    while (total > 21 && acesUsedAsEleven > 0) {
        total -= 10;
        acesUsedAsEleven -= 1;
    }

    const isSoft = aces > acesUsedAsEleven;
    return { total, isSoft, acesUsedAsEleven };
}

window.blackjackHelpers = {
    rankValue,
    apiValueToRank,
    convertApiCard,
    handValue
};
})();
document.addEventListener('DOMContentLoaded', () => {
    const pointsEl = document.getElementById('points');
    if (pointsEl) {
        pointsEl.textContent = '$2500';
    }
});

/* --- Blackjack game logic (merged from BlackjackGame.js) --- */
document.addEventListener('DOMContentLoaded', () => {
    const dealBtn = document.getElementById('deal');
    if (!dealBtn) return;
    // start disabled until deck is ready
    dealBtn.disabled = true;

    function enableWhenReady() {
        dealBtn.disabled = false;
    }

    if (window.latestDeckId) enableWhenReady();
    window.addEventListener('deckReady', enableWhenReady, { once: true });

    dealBtn.addEventListener('click', async () => {
        if (!window.latestDeckId) {
            console.error('No deck id available. Make sure the deck is ready.');
            return;
        }

        try {
            console.log('Drawing 4 cards from deck:', window.latestDeckId);
            const res = await fetch(`https://deckofcardsapi.com/api/deck/${window.latestDeckId}/draw/?count=4`);
            const data = await res.json();
            console.log('Draw result:', data);
            const apiCards = data.cards || [];
            if (!apiCards.length) {
                console.warn('Draw returned no cards:', data);
                alert('Draw returned no cards — check deck ID and API response (see console).');
            }

            const converted = apiCards.map(c => blackjackHelpers.convertApiCard(c));
            const dealerHand = [converted[0], converted[2]].filter(Boolean);
            const playerHand = [converted[1], converted[3]].filter(Boolean);
            console.log('Dealer hand:', dealerHand, 'Player hand:', playerHand);

            const playerContainer = document.getElementById('player-bottom');
            if (playerContainer) {
                playerContainer.innerHTML = '';
                playerHand.forEach(c => {
                    const el = document.createElement('div');
                    el.className = 'card';
                    el.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front"><img src="${c.image}" alt="${c.code}" style="width:80px;height:116px;display:block"></div>
                        </div>`;
                    playerContainer.appendChild(el);
                });
            }

            const hv = blackjackHelpers.handValue(playerHand);
            const playerTotalEl = document.getElementById('player-total');
            if (playerTotalEl) {
                playerTotalEl.textContent = `Player: ${hv.total}` + (hv.isSoft ? ' (soft)' : '');
            }

            const dealerContainer = document.getElementById('dealer-top');
            if (dealerContainer) {
                dealerContainer.innerHTML = '';
                if (dealerHand[0]) {
                    const el = document.createElement('div');
                    el.className = 'card';
                    el.innerHTML = `<div class="card-inner"><div class="card-front"><img src="${dealerHand[0].image}" alt="${dealerHand[0].code}" style="width:80px;height:116px;display:block"></div></div>`;
                    dealerContainer.appendChild(el);
                }
                if (dealerHand[1]) {
                    const el2 = document.createElement('div');
                    el2.className = 'card';
                    el2.innerHTML = `<div class="card-inner"><div class="card-back"><img src="https://deckofcardsapi.com/static/img/back.png" alt="card back" style="width:80px;height:116px;display:block"></div></div>`;
                    dealerContainer.appendChild(el2);
                }
            }

        } catch (err) {
            console.error('Deal failed', err);
        }
    });
});

function showDeckInfo(deckId, count) {
    let el = document.getElementById('deck-info');
    if (!el) {
        el = document.createElement('div');
        el.id = 'deck-info';
        el.style.position = 'fixed';
        el.style.right = '12px';
        el.style.top = '12px';
        el.style.padding = '6px 10px';
        el.style.background = 'rgba(0,0,0,0.6)';
        el.style.color = '#fff';
        el.style.borderRadius = '6px';
        el.style.zIndex = '2000';
        document.body.appendChild(el);
    }
    el.textContent = `Deck: ${deckId || '—'}  Count: ${count}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const pointsEl = document.getElementById('points');
    if (pointsEl) {
        // example starting points — in a real game you would compute/update this
        pointsEl.textContent = '$2500';
    }
});