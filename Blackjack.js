
const suits = ['&heart', '&diamond', '&clubs', '&spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];

const suitSymbol = {
    '&heart': '♥',
    '&diamond': '♦',
    '&clubs': '♣',
    '&spades': '♠'
};

// Card class
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
    getSymbol() {
        return suitSymbol[this.suit];
    }
}

// Deck class
class Deck {
    constructor() {
        this.cards = [];
        this.createDeck();
    }
    createDeck() {
        for (let suit of suits) {
            for (let i = 0; i < ranks.length; i++) {
                this.cards.push(new Card(suit, ranks[i], values[i]));
            }
        }
    }
    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

// Example usage:
const deck = new Deck();
deck.shuffleDeck();

// Function to render a card in the player's hand
function renderCard(card, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <div class="card-top-left">${card.rank} ${card.getSymbol()}</div>
                <div class="card-center">${card.getSymbol()}</div>
                <div class="card-bottom-right">${card.rank} ${card.getSymbol()}</div>
            </div>
            <div class="card-back"></div>
        </div>
    `;
    container.appendChild(cardDiv);
}

// Display the first card in the player's hand as an example
document.addEventListener('DOMContentLoaded', () => {
    renderCard(deck.cards[0], 'player-bottom');
});