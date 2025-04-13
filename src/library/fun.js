const colors = ["red", "yellow", "green", "blue"];

const specialCards = ["skip", "reverse", "draw2"];

const wildCards = [
  { color: "black", value: "wild", type: "wild" },
  { color: "black", value: "wild draw4", type: "wild" },
];

const unoDeck = [];

colors.forEach((color) => {
  unoDeck.push({ color, value: 0, type: "number" });
  for (let i = 1; i <= 9; i++) {
    unoDeck.push({ color, value: i, type: "number" });
    unoDeck.push({ color, value: i, type: "number" });
  }
  specialCards.forEach((action) => {
    unoDeck.push({ color, value: action, type: "special" });
    unoDeck.push({ color, value: action, type: "special" });
  });
});

for (let i = 0; i < 4; i++) {
  wildCards.forEach((wild) => {
    unoDeck.push({ ...wild });
  });
}

const shuffle = (deck) => {
  for (let i = 0; i < deck.length; i++) {
    let randomNum = Math.floor(Math.random() * deck.length);
    let temp = deck[i];
    deck[i] = deck[randomNum];
    deck[randomNum] = temp;
  }
  return deck;
};

shuffle(unoDeck);

export default unoDeck;
