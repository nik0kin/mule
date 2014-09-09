
define(function(){
  return {
    fonts: {
      "someFont": {
        fontFamily: "RBNo2",
        color: "#ffffff",
        size: 24
      }
    },
    images: [
      {src: 'assets/board.png', id: 'backgammon_board'},

      {src: 'assets/images/dice-1.png', id: 'die1'},
      {src: 'assets/images/dice-2.png', id: 'die2'},
      {src: 'assets/images/dice-3.png', id: 'die3'},
      {src: 'assets/images/dice-4.png', id: 'die4'},
      {src: 'assets/images/dice-5.png', id: 'die5'},
      {src: 'assets/images/dice-5.png', id: 'die6'},

      {src: 'assets/images/piece-blue.png', id: 'black_piece'},
      {src: 'assets/images/piece-orange.png', id: 'red_piece'},

      {src: 'assets/shaker.png', id: 'shaker'}
    ],

    sounds: []
  };
});