(function() {
  var firstName = friendName.substring(0, friendName.indexOf(' '));
  var userFirstName = userName.substring(0, userName.indexOf(' '));
  var gameOver = false;

  // Response and probability of increasing affection.
  var responses = [
    ['Will you marry me?', 0.2],
    ['Really?', 0.5],
    ['Sorry', 0.9],
    [firstName+'-Senpai!', 1.0],
    ['I’ll beat him up for you', 1.0],
    ['Er…', 0.5],
    ['Happy birthday', 0.8],
    ['But I\'m already taken', 0.2],
    ['What was that?', 0.3],
    ['Of course. I understand.', 0.8],
    ['Wait!', 0.7]
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
    if (gameOver) {
      num = 10;
    }

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
          console.log(data['birthday']);
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

  function selectChoice(prob) {
    console.log('clicked');
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
  }

  function hidePhoto() {
    $('#photo').hide();
  }

  var intervalId;
  function updateAffection(prob) {
    if (progress == 0) {
      return;
    }
    var incr = Math.random() * 0.5;
    if (affection > incr && Math.random() > prob) {
      incr = incr * -1;
      affection += incr;
    } else if (affection + incr >= 1.0) {
      gameOver = true;
      affection = 1.0;
    } else {
      affection += incr;
    }
    var width = $('#affection').width();
    var newWidth = Math.floor(width * affection);
    $('#bar').animate({
      width: newWidth + 'px'
    })
    console.log(affection);
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
        curr[rand] = responses[i][0];
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
        .text(replies[0][i])
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
    console.log('loading dialogue');
    $.get('/babble', function (data) {
      loadDialogue(data['babble'], chooseResponses());
    });
  }

  function updateBackground() {
    var height = $(window).height();
    $('body').css('background-image', 'url(/static/images/school.jpg)');
    $('body').css('background-size', 'cover');
    $('body').height(height);
  }

  $(document).ready(function() {
    updateBackground();
    playScene(0);
  });
})();
