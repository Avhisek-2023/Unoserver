const shuffle = (deck) => {
  for (let i = 0; i < deck.length; i++) {
    let randomNum = Math.floor(Math.random() * deck.length);
    let temp = deck[i];
    deck[i] = deck[randomNum];
    deck[randomNum] = temp;
  }
  return deck;
};
