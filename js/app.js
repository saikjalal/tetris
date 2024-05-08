/*
Saik Jalal (saj325@lehigh.edu)
Sam Wiley (sew225@lehigh.edu)
CSE264, Spring 2024
Final Project
*/
function init() {
  const canvas = document.getElementById("tetris");
  const context = canvas.getContext("2d");
  canvas.width = 300;
  canvas.height = 600;
  context.scale(20, 20);
  // temporary variable for score
  let tempScore = 0;

  //function that will be used to initialize the matrix
  let setMatrix = function (width, height) {
    //create the empty matrix
    const matrix = [];
    while (height--) {
      matrix.push(new Array(width).fill(0));
    }
    return matrix;
  };

  // this function sets the pieces and their colors
  let setPiece = function (type) {
    if (type === "t") {
      // instead of randomly generating all the colors, we assigned colors to shapes
      return [
        [0, 0, 0],
        ["#800080", "#800080", "#800080"],
        [0, "#800080", 0],
      ];
    } else if (type === "o") {
      return [
        ["#ffff00", "#ffff00"],
        ["#ffff00", "#ffff00"],
      ];
    } else if (type === "l") {
      return [
        [0, "#ffa500", 0],
        [0, "#ffa500", 0],
        [0, "#ffa500", "#ffa500"],
      ];
    } else if (type === "j") {
      return [
        [0, "#0000ff", 0],
        [0, "#0000ff", 0],
        ["#0000ff", "#0000ff", 0],
      ];
    } else if (type === "i") {
      return [
        [0, "#00ffff", 0, 0],
        [0, "#00ffff", 0, 0],
        [0, "#00ffff", 0, 0],
        [0, "#00ffff", 0, 0],
      ];
    } else if (type === "s") {
      return [
        [0, "#008000", "#008000"],
        ["#008000", "#008000", 0],
        [0, 0, 0],
      ];
    } else if (type === "z") {
      return [
        ["#ff0000", "#ff0000", 0],
        [0, "#ff0000", "#ff0000"],
        [0, 0, 0],
      ];
    }
  };

  // function to calculate and increase score
let points = function () {
  // Initialize a variable to track the number of consecutive rows cleared
  let rowCount = 1;

  // Iterate through each row of the game area starting from the bottom
  for (let y = area.length - 1; y > 0; --y) {
    // Flag to track if the current row is full
    let isFullRow = true;

    // Check each cell in the current row
    for (let x = 0; x < area[y].length; ++x) {
      // If any cell in the row is empty, set isFullRow to false and exit the loop
      if (area[y][x] === 0) {
        isFullRow = false;
        break;
      }
    }

    // If the current row is full
    if (isFullRow) {
      // Remove the full row from the game area and fill it with zeros
      const row = area.splice(y, 1)[0].fill(0);
      // Add the empty row back to the top of the game area
      area.unshift(row);
      // Increment y to account for the newly added empty row
      ++y;
      // Update the player's score by adding rowCount * 100
      player.score += rowCount * 100;
      // Double rowCount for the next consecutive row clear
      rowCount *= 2;
    }
  }
};

  let collide = function (area, player) {
    // get the position from the matrix
    const [m, o] = [player.matrix, player.pos];
    // loop through each row
    for (let y = 0; y < m.length; ++y) {
      //check if current cell isn't empty
      for (let x = 0; x < m[y].length; ++x) {
        // get the absolute position
        if (m[y][x] !== 0 && (area[y + o.y] && area[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    //false if not empty
    return false;
  };

  let createGrid = function (matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = "#FFFFFF";
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
          context.strokeStyle = "#000000";
          context.lineWidth = 0.05;
          context.strokeRect(x + offset.x, y + offset.y, 1, 1);
          context.fillStyle = value;
          context.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
        }
      });
    });
  };

  let merge = function (area, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          area[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  };

  let rotate = function (matrix, direction) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (direction > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  };

  // this function resets the player's position
  let playerReset = function () {
    const pieces = "ijlostz"; // the shapes
    player.matrix = setPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x =
      Math.floor(area[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(area, player)) {
      area.forEach((row) => row.fill(0));
      player.score = 0;
      gameRun = false;
      // only in the case that the player reaches the top of the grid
      $("#gameOverScreen").show();
      setTimeout(function () {
        $("#gameOverScreen").hide();
      }, 2000); // this is in milisecond
    }
  };

  //drop the shape
  let playerDrop = function () {
    player.pos.y++;
    if (collide(area, player)) {
      player.pos.y--;
      merge(area, player);
      points();
      playerReset();
      updateScore();
    }
  };

  //for moving the shape
  let playerMove = function (direction) {
    player.pos.x += direction;
    if (collide(area, player)) {
      player.pos.x -= direction;
    }
  };

  // rotating the shape
  let playerRotate = function (direction) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while (collide(area, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -direction);
        player.pos.x = pos;
        return;
      }
    }
  };

  // uodating the grid each time
  let draw = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    updateScore();
    createGrid(area, { x: 0, y: 0 });
    createGrid(player.matrix, player.pos);
  };

  let dropInter = 60;
  let time = 0;

  let update = function () {
    let scoreIncrease = player.score - tempScore;

    if (scoreIncrease >= 50) {
      dropInter = dropInter / 2;
      //doube speed
      tempScore = player.score;
      console.log(
        "speed increase: block moving down 1 unit every " +
          dropInter +
          "milliseconds"
      );
    }

    time++;
    if (time >= dropInter) {
      playerDrop();
      time = 0;
    }
    draw();
  };

  let updateScore = function () {
    context.font = "bold 20px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText("Score: " + player.score, canvas.width - 10, 10);
    $("#scoreboard").text("Score: " + player.score);
  };

  const area = setMatrix(15, 30);
  const player = {
    pos: {
      x: 0,
      y: 0,
    },
    matrix: null,
    score: 0,
  };
  const move = 1;
  let gameLoop;
  let gameRun = false;
  playerReset();
  draw();

  $(document).keydown(function (control) {
    if (control.keyCode === 37) {
      playerMove(-move);
    } else if (control.keyCode === 39) {
      playerMove(+move);
    } else if (control.keyCode === 40) {
      if (gameRun) {
        playerDrop();
      }
    } else if (control.keyCode === 38) {
      playerRotate(-move);
    }
  });

  $("#start_game").click(function () {
    gameRun = true;
    playerReset();
    gameLoop = setInterval(function () {
      if (gameRun) {
        update();
      } else {
      }
    }, 10);
    $(this).prop("disabled", true);
  });
}

$(() => {
  init();
});