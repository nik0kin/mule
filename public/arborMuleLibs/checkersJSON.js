define([], function () {
  return {
    "name" : "Checkers",
    "turnSubmitStyle" : "roundRobin",

    "staticBoardSettings" : {
      "boardStyle" : "squareGrid"
    },

    "gameSettings" : {
      "playerLimit" : 2,
      "customBoardSettings" : {
        "size" : [8, 10]
      }
    },

    "rules" : {
      "spaces" : [
        {
          "className": "moveable",
          "spots": 1,
          "attributes": {
            "kingme": ["null", "player1", "player2"]
          }
        }
      ],

      "pieces" : [
        {
          "className": "checker"
        },
        {
          "className": "king"
        }
      ],

      "board" : [
        {
          "id": "1",
          "class": "moveable",
          "attributes": {
            "kingme": "player2"
          },
          "edges" : [
            {"id": "5", "direction": "down"}
          ]
        },
        {
          "id": "2",
          "class": "moveable",
          "attributes": {
            "kingme": "player2"
          },
          "edges" : [
            {"id": "5", "direction": "down"},
            {"id": "6", "direction": "down"}
          ]
        },
        {
          "id": "3",
          "class": "moveable",
          "attributes": {
            "kingme": "player2"
          },
          "edges" : [
            {"id": "6", "direction": "down"},
            {"id": "7", "direction": "down"}
          ]
        },
        {
          "id": "4",
          "class": "moveable",
          "attributes": {
            "kingme": "player2"
          },
          "edges" : [
            {"id": "7", "direction": "down"},
            {"id": "8", "direction": "down"}
          ]
        },
        {
          "id": "5",
          "class": "moveable",
          "edges": [
            {"id": "1", "direction": "up"},
            {"id": "2", "direction": "up"},
            {"id": "9", "direction": "down"},
            {"id": "10", "direction": "down"}
          ]
        },
        {
          "id": "6",
          "class": "moveable",
          "edges": [
            {"id": "2", "direction": "up"},
            {"id": "3", "direction": "up"},
            {"id": "10", "direction": "down"},
            {"id": "11", "direction": "down"}
          ]
        },
        {
          "id": "7",
          "class": "moveable",
          "edges": [
            {"id": "3", "direction": "up"},
            {"id": "4", "direction": "up"},
            {"id": "11", "direction": "down"},
            {"id": "12", "direction": "down"}
          ]
        },
        {
          "id": "8",
          "class": "moveable",
          "edges": [
            {"id": "4", "direction": "up"},
            {"id": "12", "direction": "down"}
          ]
        },
        {
          "id": "9",
          "class": "moveable",
          "edges": [
            {"id": "5", "direction": "up"},
            {"id": "13", "direction": "down"}
          ]
        },
        {
          "id": "10",
          "class": "moveable",
          "edges": [
            {"id": "5", "direction": "up"},
            {"id": "6", "direction": "up"},
            {"id": "13", "direction": "down"},
            {"id": "14", "direction": "down"}
          ]
        },
        {
          "id": "11",
          "class": "moveable",
          "edges": [
            {"id": "6", "direction": "up"},
            {"id": "7", "direction": "up"},
            {"id": "14", "direction": "down"},
            {"id": "15", "direction": "down"}
          ]
        },
        {
          "id": "12",
          "class": "moveable",
          "edges": [
            {"id": "7", "direction": "up"},
            {"id": "8", "direction": "up"},
            {"id": "15", "direction": "down"},
            {"id": "16", "direction": "down"}
          ]
        },
        {
          "id": "13",
          "class": "moveable",
          "edges": [
            {"id": "9", "direction": "up"},
            {"id": "10", "direction": "up"},
            {"id": "17", "direction": "down"},
            {"id": "18", "direction": "down"}
          ]
        },
        {
          "id": "14",
          "class": "moveable",
          "edges": [
            {"id": "10", "direction": "up"},
            {"id": "11", "direction": "up"},
            {"id": "18", "direction": "down"},
            {"id": "19", "direction": "down"}
          ]
        },
        {
          "id": "15",
          "class": "moveable",
          "edges": [
            {"id": "11", "direction": "up"},
            {"id": "12", "direction": "up"},
            {"id": "19", "direction": "down"},
            {"id": "20", "direction": "down"}
          ]
        },
        {
          "id": "16",
          "class": "moveable",
          "edges": [
            {"id": "12", "direction": "up"},
            {"id": "20", "direction": "down"}
          ]
        },
        {
          "id": "17",
          "class": "moveable",
          "edges": [
            {"id": "13", "direction": "up"},
            {"id": "21", "direction": "down"}
          ]
        },
        {
          "id": "18",
          "class": "moveable",
          "edges": [
            {"id": "13", "direction": "up"},
            {"id": "14", "direction": "up"},
            {"id": "21", "direction": "down"},
            {"id": "22", "direction": "down"}
          ]
        },
        {
          "id": "19",
          "class": "moveable",
          "edges": [
            {"id": "14", "direction": "up"},
            {"id": "15", "direction": "up"},
            {"id": "22", "direction": "down"},
            {"id": "23", "direction": "down"}
          ]
        },
        {
          "id": "20",
          "class": "moveable",
          "edges": [
            {"id": "15", "direction": "up"},
            {"id": "16", "direction": "up"},
            {"id": "23", "direction": "down"},
            {"id": "24", "direction": "down"}
          ]
        },
        {
          "id": "21",
          "class": "moveable",
          "edges": [
            {"id": "17", "direction": "up"},
            {"id": "18", "direction": "up"},
            {"id": "25", "direction": "down"},
            {"id": "26", "direction": "down"}
          ]
        },
        {
          "id": "22",
          "class": "moveable",
          "edges": [
            {"id": "18", "direction": "up"},
            {"id": "19", "direction": "up"},
            {"id": "26", "direction": "down"},
            {"id": "27", "direction": "down"}
          ]
        },
        {
          "id": "23",
          "class": "moveable",
          "edges": [
            {"id": "19", "direction": "up"},
            {"id": "20", "direction": "up"},
            {"id": "27", "direction": "down"},
            {"id": "28", "direction": "down"}
          ]
        },
        {
          "id": "24",
          "class": "moveable",
          "edges": [
            {"id": "20", "direction": "up"},
            {"id": "28", "direction": "down"}
          ]
        },
        {
          "id": "25",
          "class": "moveable",
          "edges": [
            {"id": "21", "direction": "up"},
            {"id": "29", "direction": "down"}
          ]
        },
        {
          "id": "26",
          "class": "moveable",
          "edges": [
            {"id": "21", "direction": "up"},
            {"id": "22", "direction": "up"},
            {"id": "29", "direction": "down"},
            {"id": "30", "direction": "down"}
          ]
        },
        {
          "id": "27",
          "class": "moveable",
          "edges": [
            {"id": "22", "direction": "up"},
            {"id": "23", "direction": "up"},
            {"id": "30", "direction": "down"},
            {"id": "31", "direction": "down"}
          ]
        },
        {
          "id": "28",
          "class": "moveable",
          "edges": [
            {"id": "23", "direction": "up"},
            {"id": "24", "direction": "up"},
            {"id": "31", "direction": "down"},
            {"id": "32", "direction": "down"}
          ]
        },
        {
          "id": "29",
          "class": "moveable",
          "attributes": {
            "kingme": "player1"
          },
          "edges" : [
            {"id": "25", "direction": "up"},
            {"id": "26", "direction": "up"}
          ]
        },
        {
          "id": "30",
          "class": "moveable",
          "attributes": {
            "kingme": "player1"
          },
          "edges" : [
            {"id": "26", "direction": "up"},
            {"id": "27", "direction": "up"}
          ]
        },
        {
          "id": "31",
          "class": "moveable",
          "attributes": {
            "kingme": "player1"
          },
          "edges" : [
            {"id": "27", "direction": "up"},
            {"id": "28", "direction": "up"}
          ]
        },
        {
          "id": "32",
          "class": "moveable",
          "attributes": {
            "kingme": "player1"
          },
          "edges" : [
            {"id": "28", "direction": "up"}
          ]
        }
      ],

      "startingPieces" : [
        {
          "player": "player1",
          "pieces": [
            { "class" : "checker", "space" : "1" , "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "2", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "3", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "4", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "5", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "6", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "7", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "8", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "9", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "10", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "11", "attributes" : {"direction" : "down"}},
            { "class" : "checker", "space" : "12", "attributes" : {"direction" : "down"}}
          ]
        },
        {
          "player": "player2",
          "pieces": [
            { "class" : "checker", "space" : "21", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "22", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "23", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "24", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "25", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "26", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "27", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "28", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "29", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "30", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "31", "attributes" : {"direction" : "up"}},
            { "class" : "checker", "space" : "32", "attributes" : {"direction" : "up"}}
          ]
        }
      ]
    }
  };
});