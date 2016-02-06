(function() {
  var firstName = friendName.substring(0, friendName.indexOf(' '));
  var userFirstName = userName.substring(0, userName.indexOf(' '));

  var responses = [
    'Will you marry me?',
    'Really?',
    'Sorry...',
    firstName+'-Senpai!',
    'I’ll beat him up for you.',
    'Er…',
    'Happy birthday!',
    'But I\'m already taken',
    'What was that?',
    'Of course. I understand.',
    'Wait!',
    'Since I\'ve set my eyes on you, I\'ve always known.',
    'I\'ve only used 0.01\% of my charm!',
    'I got lost in your eyes.'
  ]

  var intro = 'It\'s an unusually nice day at Carnegie Mellon University. You\'ve just finished your classes and are ready to head home when you hear the quiet sound of footsteps.';
  var dia1 = 'Oh...it\'s good to see you. I have a secret, something I\'ve been meaning to tell you. You see...';
  var dia2 = 'W-wait, even after all these years...you still remember my birthday?'
  var theEnd = 'THE END.'
  var diaGoodEnd = 'Thanks ' + userFirstName + '...You know, ever since that time...I\'ve always liked you...\n' + theEnd;
  var diaBadEnd = 'Thanks ' + userFirstName + '. I\'m so happy for all the time we\'ve spent together...as good friends.\n' + theEnd;

  var affection = 0.0;
  var progress = 0;
  var replies;
  function playScene(num) {
    switch (num) {
      case 0:
        hideName();
        hidePhoto();
        loadDialogue(intro, ['...' + firstName + '? Is that you?']);
        break;

      case 1:
        showName(friendName);
        showPhoto();
        loadDialogue(dia1, ['What?']);
        break;

      case 5:
        $.get('/birthday', function (data) {
          if (data['birthday']) {
            loadDialogue(dia2, ['Of course. It\'s ' + birthday]);
          } else {
            babble();
          }
        });
        break;

      case 10:
        if (affection >= 80) {
          loadDialogue(diaGoodEnd, []);
        } else {
          loadDialogue(diaBadEnd, []);
        }
        break;

      default:
        babble();
    }
  }

  function selectChoice() {
    updateAffection();
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
  function updateAffection() {
    var incr = Math.random() * 0.25;
    if (affection > incr && Math.random() < 0.7) {
      incr = incr * -1;
    } else if (affection + incr >= 1.0) {
      // you win
    }
    affection += incr;
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
        .on('click', selectChoice)
        .text(replies[i])
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
    $.get('/babble', function (data) {
      loadDialogue(data['babble'], chooseResponses());
    });
  }

  function updateBackground() {
    var height = $(window).height();
    $('body').css('background-image', 'url(/static/images/school.jpg)');
    $('body').css('background-repeat', 'no-repeat');
    $('body').css('background-size', 'cover');
    $('body').height(height);
  }

  $(document).ready(function() {
    updateBackground();
    playScene(0);
  });
})();
