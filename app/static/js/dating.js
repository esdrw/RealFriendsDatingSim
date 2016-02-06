(function() {
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
    if (affection > incr && Math.floor(Math.random() * 2) == 0) {
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

  function loadDialogue() {
    $.get('/babble', function (data) {
      // TODO: make text appear one at a time: typed.js
      $('#dialogue').text(data['them']);
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

  $(document).ready(function() {
    loadDialogue();
  });
})();
