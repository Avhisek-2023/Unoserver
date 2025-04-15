const shuffle = (deck) => {
  for (let i = 0; i < deck.length; i++) {
    let randomNum = Math.floor(Math.random() * deck.length - 1);
    let randomArrInd = deck[randomNum];
    deck[i] = randomArrInd;
  }
};
