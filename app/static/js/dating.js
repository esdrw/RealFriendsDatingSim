(function() {
  var selectChoice = function () {
    console.log('clicked');
    updateAffection();
    clearDialogue();
    loadDialogue();
    return false;
  }

  var affection = 0.0;
  function updateAffection() {
    var incr = Math.random();
    if (affection > incr && Math.floor(Math.random() * 2) == 0) {
      incr = incr * -1;
    }
    affection += incr;
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
        // TODO: replace existing list on page
        // console.log(data['you'][i])
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
