
window.APP = window.angular.module('main', []).controller('MainCtrl', function($scope) {
  var happyFunTimeAudio = new Audio("mario-kart.ogg");
  var requestAnimationFrame = window.requestAnimationFrame;

  $scope.state = {
    people: [
      {
        name: "Andy",
        times: [],
        profile_img: "img/faces/andy.png",
      },
      {
        name: "Josh",
        times: [],
        profile_img: "img/faces/josh_wolfe.png",
      },
    ],
    gameState: 'setup',
    checkpoints: [
      {
        name: "Deku Tree",
        img_src: "img/deku_stone.png",
        desc: "Pause immediately after the cutscene after...",
      },
      {
        name: "Dodongo's Cavern",
        img_src: "img/goron_stone.png",
        desc: "Pause at some point...",
      },
      {
        name: "Adult Link",
        img_src: "img/Light_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Forest Temple",
        img_src: "img/Forest_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Fire Temple",
        img_src: "img/Fire_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Water Temple",
        img_src: "img/Water_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Shadow Temple",
        img_src: "img/Shadow_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Spirit Temple",
        img_src: "img/Spirit_Medallion.png",
        desc: "Pause",
      },
      {
        name: "Ganon's Castle",
        img_src: "img/triforce.png",
        desc: "Pause",
      },
    ],
    current_checkpoint: 0,
  };

  $scope.addPerson = function() {
    $scope.state.people.push({name: "new person", times: []});
    saveState();
  };

  $scope.save = function() {
    saveState();
  };

  $scope.deletePerson = function(index) {
    $scope.state.people.splice(index, 1);
    saveState();
  };

  $scope.startGame = function() {
    $scope.state.gameState = 'ready';
    saveState();
  };

  $scope.backToSetup = function() {
    $scope.state.gameState = 'setup';
    saveState();
  };

  $scope.currentCheckpoint = function() {
    return $scope.state.checkpoints[$scope.state.current_checkpoint];
  };

  $scope.readySetGo = function() {
    var checkpoint = $scope.currentCheckpoint();
    // mario kart gives an 8 second count down
    checkpoint.start = new Date(new Date().getTime() + 8000);
    document.title = checkpoint.name + " - Zelda Race - ";
    $scope.state.gameState = 'play';
    saveState();
    happyFunTimeAudio.play();
  };

  $scope.personIsDone = function(person) {
    var checkpoint_index = $scope.state.current_checkpoint;
    var checkpoint = $scope.currentCheckpoint();
    var end_time = new Date();
    person.times[checkpoint_index] = end_time - checkpoint.start;
    var all_done = $scope.state.people.every(function(person) {
      return !!person.times[checkpoint_index];
    });
    if (all_done) {
      $scope.state.gameState = 'ready';
      $scope.state.current_checkpoint += 1;
      document.title = "Zelda Race - ";
    }
    saveState();
  };

  $scope.totalTime = function(person) {
    var total_time = 0;
    person.times.forEach(function(time) {
      if (time) total_time += time;
    });
    return total_time;
  };

  $scope.rupeesForCheckpoint = function(person, checkpoint_index) {
    var my_time = person.times[checkpoint_index];
    if (!my_time) return "";
    var rupees = 0;
    $scope.state.people.forEach(function(other) {
      var their_time = other.times[checkpoint_index];
      if (!their_time || my_time < their_time) rupees += 1;
    });
    return rupees;
  };

  $scope.totalRupees = function(person) {
    var rupees = 0;
    for (var i = 0; i < $scope.state.checkpoints.length; i++) {
      var prt = $scope.rupeesForCheckpoint(person, i);
      if (prt) rupees += prt;
    }
    return rupees;
  };

  loadState();

  requestAnimationFrame(function animateClock() {
    var clock = document.getElementById("clock");
    if ($scope.state.gameState !== 'play') {
      clock.style.display = "none";
    } else {
      clock.style.display = "";
      var start = $scope.currentCheckpoint().start;
      clock.innerText = formatMs(new Date() - start, true);
    }
    requestAnimationFrame(animateClock);
  });

  function saveState() {
    localStorage.state = window.angular.toJson($scope.state);
  }

  function loadState() {
    if (localStorage.state) {
      $scope.state = window.angular.fromJson(localStorage.state);
      $scope.state.checkpoints.forEach(function(checkpoint) {
        if (checkpoint.start) checkpoint.start = new Date(checkpoint.start);
      });
    }
  }

});

function formatMs(ms, include_ms) {
  if (!ms) return "";
  var result = "";
  if (ms < 0) {
    result += "-";
    ms = -ms;
  }
  var hours = Math.floor(ms / (60 * 60 * 1000));

  var minutes = Math.floor((ms / 60000) % 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var seconds = Math.floor((ms / 1000) % 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  result += hours + ":" + minutes + ":" + seconds;
  if (include_ms) {
    var millis = "" + (ms % 1000);
    while (millis.length < 3) millis = "0" + millis;
    result += "." + millis;
  }
  return result;
}

window.APP.filter('formatMs', function() {
  return formatMs;
});

window.APP.run();

setInterval(updateTitle, 200);
function updateTitle() {
  document.title = document.title.substring(1, document.title.length) + document.title[0];
}
