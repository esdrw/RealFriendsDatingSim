(function() {
  var responses = ['Will you marry me?', 'Really?', 'Sorry', friendName+'-Senpai!', 'I’ll beat him up for you', 'Er…', 'Happy birthday', 'But I have a girl/boyfriend', 'What was that?', 'Of course. I understand.', 'Wait!']

  function selectChoice() {
    console.log('clicked');
    updateAffection();
    clearDialogue();
    loadDialogue();
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

  var affection = 0.0;
  var intervalId;
  function frame() {
    if (width >= (100 - (affection * 100))) {
      width = width-1;
      $('#bar').width = width + 'px';
    } else {
      clearInterval(intervalId);
    }
  }

  function updateAffection() {
    // intervalId = setInterval(frame, 10);
    var width = $('#affection').width();
    var newWidth = Math.floor(width - (width * affection));
    $('#bar').animate({
      width: newWidth + 'px'
    })
  }

  function updateAffection() {
    var incr = Math.random() * 0.25;
    if (affection > incr && Math.random() < 0.5) {
      incr = incr * -1;
    } else if (affection + incr >= 1.0) {
      // you win
    }
    affection += incr;
    updateAffection();
    console.log(affection);
  }

  function clearDialogue() {
    $('#dialogue').remove();
    $('<div>')
      .attr('id', 'dialogue')
      .appendTo($('#dialogue-box'));
    $('ul').remove();
  }

  function createResponse() {
    var responseList = $('<ul>');
    var curr = responses.slice(0, 4);
    for (var i = 4; i < responses.length; i++) {
      var rand = Math.floor(Math.random() * i);
      if (rand < 4) {
        curr[rand] = responses[i];
      }
    }
    $.each(curr, function(i) {
      var li = $('<li/>').appendTo(responseList);
      var ahref = $('<a/>')
        .on('click', selectChoice)
        .text(curr[i])
        .appendTo(li);
      });
    $('#dialogue-box').append(responseList);
  }

  function loadDialogue() {
    console.log('loading dialogue');
    $.get('/babble', function (data) {
      // make text appear one letter at a time
    console.log(data);
      $('#dialogue').typed({
        strings: [data['babble']],
        typeSpeed: 0,
        showCursor: false,
        contentType: 'text',
        callback: createResponse
      });
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
    loadDialogue();
  });
})();
