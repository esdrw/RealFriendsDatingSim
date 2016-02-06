(function() {
  var responses = ['Will you marry me?', 'Really?', 'Sorry', 'Senpai!', 'I’ll beat him up for you', 'Er…', 'Happy birthday', 'But I have a girl/boyfriend', 'What was that?', 'Of course. I understand.', 'Wait!']

  function selectChoice() {
    console.log('clicked');
    updateAffection();
    clearDialogue();
    loadDialogue();
    return false;
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

  function updateProgress() {
    // intervalId = setInterval(frame, 10);
    var width = $('#progress').width();
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
    updateProgress();
    console.log(affection);
  }

  function clearDialogue() {
    $('#dialogue').text('');
    $('ul').remove();
  }

  function createResponse() {
    var responseList = $('<ul>');
    /* $.each(data['you'], function(i) {
      // TODO: replace existing list on page
      // console.log(data['you'][i])
      var li = $('<li/>').appendTo(responseList);
      var ahref = $('<a/>')
        .on('click', selectChoice)
        .text(data['you'][i])
        .appendTo(li);
      }); */
    $('#dialogue-box').append(responseList);
  }

  function loadDialogue() {
    $.get('/babble', function (data) {
      // make text appear one letter at a time
      $('#dialogue').typed({
        strings: [data['them']],
        typeSpeed: 0,
        showCursor: false,
        contentType: 'text',
        callback: createResponse
      });
      responseList = $('<ul>');
      $.each(data['you'], function(i) {
        var li = $('<li/>').appendTo(responseList);
        var ahref = $('<a/>')
          .on('click', selectChoice)
          .text(data['you'][i])
          .appendTo(li);
        });
      $('#dialogue-box').append(responseList);
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
