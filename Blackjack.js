
const suits = ['&heart', '&diamond', '&clubs', '&spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
const redSuits = ['&heart', '&diamond'];
const blackSuits = ['&clubs', '&spades'];

const suitSymbol = {
    '&heart': '♥',
    '&diamond': '♦',
    '&clubs': '♣',
    '&spades': '♠'
};

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

const cardContainer = document.getElementById('cards-container');
function renderDeck(deck) {

    cardContainer.innerHTML='';
    for (const card of deck) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        if (card.suit === '&heart' || card.suit === '&diamond') {
            cardElement.classList.add('red');
        } else {
            cardElement.classList.add('black');
        }
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-top-left">${card.rank} ${card.getSymbol()}</div>
                    <div class="card-center">${card.getSymbol()}</div>
                    <div class="card-bottom-right">${card.rank} ${card.getSymbol()}</div>
                </div>
                <div class="card-back"></div>
            </div>
        `;
        cardContainer.appendChild(cardElement);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const deck = new Deck();
    deck.shuffleDeck();
    renderDeck(deck.cards);
});