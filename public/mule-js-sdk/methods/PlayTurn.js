define([], function () {
  return function (contextPath) {
    var that = {};

    that.sendQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"playTurn",
        data: params
      });
    };

    return that;
  };
});