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
  console.log(affection)
}

function clearDialogue() {
  $('#themWords').remove();
  $('ul').remove();
}

function loadDialogue() {
  $.get('/babble', function (data) {
    var themWords = $('<p>')
      .attr('id', 'themWords')
      .text(data['them']);
    $('#mainDiv').append('<p>' + data['them'] + '</p>');
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
    $('#mainDiv').append(responseList)
  });
}

$(document).ready(function() {
  loadDialogue();

  $.ajax({
    url: '/posts',
    type: 'GET',
    success: function(json) {
      console.log(json);
    },
    error: function(xhr, status, error) {
      console.log("error getting posts!", error);
    }
  })

});
