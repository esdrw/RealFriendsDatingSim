(function() {
  var firstName = friendName.substring(0, friendName.indexOf(' '));
  var userFirstName = userName.substring(0, userName.indexOf(' '));
  var gameOver = false;
  var canBabble = true;

  // Response and probability of increasing affection.
  var responses = [
    ['Will you marry me?', 0.2],
    ['Really?', 0.5],
    ['Sorry.', 0.9],
    [firstName+'-Senpai!', 1.0],
    ['I’ll beat him up for you.', 1.0],
    ['Er…', 0.5],
    ['Happy birthday.', 0.8],
    ['But I\'m already taken', 0.2],
    ['What was that?', 0.3],
    ['Of course. I understand.', 0.8],
    ['Wait!', 0.7],
    ['Since I\'ve set my eyes on you, I\'ve always known.', 0.8],
    ['I\'ve only used 0.01\% of my charm!', 0.5],
    ['I got lost in your eyes.', 0.8]
  ];

  var maxAffectionIncr = 0.3;

  var intro = 'It\'s an unusually nice day at Carnegie Mellon University. You\'ve just finished your classes and are ready to head home when you hear the quiet sound of footsteps.';
  var dia1 = 'Oh...it\'s good to see you. I have a secret, something I\'ve been meaning to tell you. You see...';
  var dia2 = 'W-wait, even after all these years...you still remember my birthday?'
  var theEnd = 'THE END.'
  var diaError = 'No... must have imagined it. Everyone has gone home and you are all alone on campus.\nMaybe you can catch ' + firstName + ' tomorrow?\n' + theEnd;
  var diaGoodEnd = 'Thanks ' + userFirstName + '...You know, ever since that time...I\'ve always liked you...\n' + theEnd;
  var diaBadEnd = 'Thanks ' + userFirstName + '. I\'m so happy for all the time we\'ve spent together...as good friends.\n' + theEnd;

  var affection = 0.0;
  var progress = 0;
  var replies;

  function checkBirthday(birthday) {
    // Check if birthday is of format "MM/DD/YYYY"
    return (birthday && birthday.split('/').length === 3);
  }

  function birthdayOptions(birthday) {
    var monthNames = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];
    function getDateString(date) {
      return monthNames[date.getMonth()] + ' ' + date.getDate().toString() + ', ' + date.getFullYear();
    }

    var option1 = new Date(birthday);
    var option2 = new Date(birthday);
    option2.setMonth((option2.getMonth() + 1) % 12);
    option2.setDate((option2.getDate() + Math.floor(Math.random() * 11 - 5)) % 28);
    var option3 = new Date(birthday);
    option3.setMonth((option3.getMonth() - 1) % 12);
    option3.setDate((option3.getDate() + Math.floor(Math.random() * 11 - 5)) % 28);
    var option4 = new Date(birthday);
    option4.setMonth((option4.getMonth() + Math.floor(Math.random() * 11 - 5)) % 12);
    option4.setDate((option4.getDate() + Math.floor(Math.random() * 11 - 5)) % 28);
    return [
      ['Of course. It\'s ' + getDateString(option1), 1.0],
      ['Of course. It\'s ' + getDateString(option2), 0],
      ['Of course. It\'s ' + getDateString(option3), 0],
      ['Of course. It\'s ' + getDateString(option4), 0]
    ];
  }

  function playScene(num) {
    if (gameOver) {
      num = 10;
    }

    switch (num) {
      case 0:
        hideName();
        hidePhoto();
        loadDialogue(intro, [['...' + firstName + '? Is that you?', 0]]);
        break;

      case 1:
        if (!canBabble) {
          loadDialogue(diaError, []);
        } else {
          showName(friendName);
          showPhoto();
          loadDialogue(dia1, [['What?', 0]]);
        }
        break;

      case 9:
        $.get('/birthday', function(data) {
          if (checkBirthday(data.birthday)) {
            loadDialogue(dia2, birthdayOptions(data.birthday));
          } else {
            babble();
          }
        });
        break;

      case 10:
        if (affection >= 0.8) {
          loadDialogue(diaGoodEnd, []);
        } else {
          loadDialogue(diaBadEnd, []);
        }
        break;

      default:
        babble();
        break;
    }
  }

  function selectChoice(prob) {
    updateAffection(prob);
    clearDialogue();
    progress++;
    playScene(progress);
    return false;
  }

  function showName(name) {
    $('#name-box').show();
    $('#name').text(name);
  }

  function hideName() {
    $('#name-box').hide();
  }

  function showPhoto() {
    $('#photo').show();
    $('#affection').show();
  }

  function hidePhoto() {
    $('#photo').hide();
    $('#affection').hide();
  }

  var intervalId;
  function updateAffection(prob) {
    var incr = Math.random() * maxAffectionIncr;
    if (Math.random() > prob.data.prob) {
      if (affection > incr) {
        incr = incr * -1;
        affection += incr;
      }
    } else {
      affection += incr;
      if (affection >= 1.0) {
        gameOver = true;
        affection = 1.0;
      }
    }

    var width = $('#affection').width();
    var newWidth = Math.floor(width * affection);
    $('#bar').animate({
      width: newWidth + 'px'
    })
  }

  function clearDialogue() {
    $('#dialogue').remove();
    $('<div>')
      .attr('id', 'dialogue')
      .appendTo($('#dialogue-box'));
    $('ul').remove();
  }

  function chooseResponses() {
    var curr = responses.slice(0, 4);
    for (var i = 4; i < responses.length; i++) {
      var rand = Math.floor(Math.random() * i);
      if (rand < 4) {
        curr[rand] = responses[i];
      }
    }
    return curr;
  }

  function showResponses() {
    var responseList = $('<ul>');
    $.each(replies, function(i) {
      var li = $('<li/>').appendTo(responseList);
      var ahref = $('<a/>')
        .on('click', { prob: replies[i][1] }, selectChoice)
        .text(replies[i][0])
        .appendTo(li);
      });
    $('#dialogue-box').append(responseList);
  }

  function loadDialogue(text, resp) {
    replies = resp;
    $('#dialogue').typed({
      strings: [text],
      typeSpeed: 0,
      showCursor: false,
      contentType: 'text',
      callback: showResponses
    });
  }

  function babble() {
    $.get('/babble?id=' + friendId, function(data) {
      loadDialogue(data.babble, chooseResponses());
    });
  }

  function init() {
    updateBackground();

    // Test babbling to make sure everything works
    $.get('/babble?limit=1&id=' + friendId, function(data) {
      if (data.error) {
        // Redirect to login page in case access token expired
        window.location.assign(root_url + 'logout');
        return;
      } else if (!data.babble) {
        // babble is empty!
        canBabble = false;
      }

      playScene(0);
    });
  }

  function updateBackground() {
    var height = $(window).height();
    $('body').css('background-image', 'url(/static/images/school.jpg)');
    $('body').css('background-repeat', 'no-repeat');
    $('body').css('background-size', 'cover');
    $('body').height(height);
  }

  $(document).ready(init);
})();
