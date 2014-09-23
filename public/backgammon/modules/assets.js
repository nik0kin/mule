
define(function(){
  return function (_theme) {
    var theme = _theme || 'classic',
      path = 'assets/' + theme + '/';

    return {
      /*fonts: {
        "someFont": {
          fontFamily: "RBNo2",
          color: "#ffffff",
          size: 24
        }
      },*/
      images: [
        {src: path + 'board-main.png', id: 'board_background'},
        {src: path + 'board-overlay.png', id: 'board_overlay'},

        {src: path + 'dice-1.png', id: 'die1'},
        {src: path + 'dice-2.png', id: 'die2'},
        {src: path + 'dice-3.png', id: 'die3'},
        {src: path + 'dice-4.png', id: 'die4'},
        {src: path + 'dice-5.png', id: 'die5'},
        {src: path + 'dice-6.png', id: 'die6'},

        {src: path + 'checker-p1.png', id: 'red_piece'},
        {src: path + 'checker-p2.png', id: 'black_piece'},

        {src: 'assets/shaker.png', id: 'shaker'},

        {src: 'assets/indicator-selection.png', id: 'indicator-selection'},
        {src: 'assets/indicator-move.png', id: 'indicator-move'},
        {src: 'assets/indicator-knock.png', id: 'indicator-knock'}
      ],

      sounds: []
    };
  };
});
