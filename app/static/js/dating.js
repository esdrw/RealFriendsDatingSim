(function() {
  var firstName = friendName.substring(0, friendName.indexOf(' '));
  var userFirstName = userName.substring(0, userName.indexOf(' '));
  var canBabble = true;

  // Response and probability of increasing affection.
  var responses = [
    ['Will you marry me?', 0.2, -0.1, 0.4],
    ['Really?', 0.1, -0.1, 0.8],
    ['Sorry.', 0.1, -0.1, 0.8],
    [firstName+'-Senpai!', 0.2, -0.1, 0.7],
    ['I’ll beat him up for you.', 0.15, -0.1, 0.8],
    ['Er...', 0.1, -0.1, 0.4],
    ['Happy birthday.', 0.1, -0.1, 0.7],
    ['But I\'m already taken.', 0.1, -0.1, 0.1],
    ['What was that?', 0.1, -0.1, 0.5],
    ['Of course. I understand.', 0.1, -0.1, 0.8],
    ['Wait!', 0.1, -0.1, 0.8],
    ['Since I\'ve set my eyes on you, I\'ve always known.', 0.2, -0.1, 0.8],
    ['I\'ve only used 0.01\% of my charm!', 0.1, -0.1, 0.6],
    ['I got lost in your eyes.', 0.15, -0.1, 0.65]
  ];

  var intro = 'It\'s an unusually nice day at Kawaii Tomodachi University. You\'ve just finished your classes and are ready to head home when you hear the quiet sound of footsteps.';
  var dia1 = 'Oh...it\'s good to see you. I have a secret, something I\'ve been meaning to tell you. You see...';
  var dia2 = 'W-wait, even after all these years... you still remember my birthday?'
  var theEnd = 'THE END.'
  var diaError = 'No... must have imagined it. Everyone has gone home and you are all alone on campus.<br/>Maybe you can catch ' + firstName + ' tomorrow?<br/>' + theEnd;
  var diaGoodEnd = 'Thanks ' + userFirstName + '. You know, ever since that time... ^1000 I\'ve always liked you...<br/><br/>' + theEnd;
  var diaBadEnd = 'Thanks ' + userFirstName + '. I\'m so happy for all the time we\'ve spent together... ^1000 as good friends.<br/><br/>' + theEnd;

  var affection = 0.2;
  var progress = 0;
  var replies;

  function shuffle(array) {
    var temp, randomIndex, currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temp;
    }

    return array;
  }

  function checkBirthday(birthday) {
    // Check if birthday is of format "MM/DD/YYYY" or "MM/DD"
    return (birthday && birthday.split('/').length >= 2);
  }

  function birthdayOptions(birthday) {
    var showYear = birthday.split('/').length === 3;
    var monthNames = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    function getDateString(date) {
      return (monthNames[date.getMonth()] + ' ' + date.getDate().toString()) +
        (showYear ? ', ' + date.getFullYear() : '');
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
    return shuffle([
      ['Of course. It\'s ' + getDateString(option1), 0.2, 0, 1],
      ['Of course. It\'s ' + getDateString(option2), 0, -0.2, 0],
      ['Of course. It\'s ' + getDateString(option3), 0, -0.2, 0],
      ['Of course. It\'s ' + getDateString(option4), 0, -0.2, 0]
    ]);
  }

  var GAME_OVER = 9;
  function playScene(num) {
    switch (num) {
      case 0:
        hideName();
        hidePhoto();
        loadDialogue(intro, [['...' + firstName + '? Is that you?', 0, 0, 1]], false);
        break;

      case 1:
        if (!canBabble) {
          loadDialogue(diaError, [], true);
        } else {
          showName(friendName);
          showPhoto();
          loadDialogue(dia1, [['What is it?', 0, 0, 1]], false);
        }
        break;

      case 9:
        $.get('/birthday', function(data) {
          if (checkBirthday(data.birthday)) {
            loadDialogue(dia2, birthdayOptions(data.birthday), false);
          } else {
            babble();
          }
        });
        break;

      case 10:
        if (affection >= 0.8) {
          loadDialogue(diaGoodEnd, [], true);
        } else {
          loadDialogue(diaBadEnd, [], true);
        }
        break;

      default:
        babble();
        break;
    }
  }

  function selectChoice(e) {
    updateAffection(e.data);
    clearDialogue();
    playScene(++progress);
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
  function updateAffection(data) {
    if (Math.random() < data.prob) {
      affection = Math.min(affection + data.affUp, 1.0);
      if (affection == 1.0) {
        progress = GAME_OVER;
      }
    } else {
      affection = Math.max(affection + data.affDown, 0);
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
        .on('click', {
          affUp: replies[i][1],
          affDown: replies[i][2],
          prob: replies[i][3]
        }, selectChoice)
        .text(replies[i][0])
        .appendTo(li);
      });
    $('#dialogue-box').append(responseList);
  }

  function loadDialogue(text, resp, html) {
    replies = resp;
    $('#dialogue').typed({
      strings: [text],
      typeSpeed: 0,
      showCursor: false,
      contentType: html ? 'html' : 'text',
      callback: showResponses
    });
  }

  function babble() {
    $.get('/babble?id=' + friendId, function(data) {
      loadDialogue(data.babble, chooseResponses(), false);
    });
  }

  function init() {
    updateBackground();

    // Test babbling to make sure everything works
    $.get('/babble?limit=5&id=' + friendId, function(data) {
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
