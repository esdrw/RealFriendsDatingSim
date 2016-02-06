$(document).ready(function() {
    // expected format: { them: <character speech>, you: [<response option 1>, <opt 2>, ...]}
    $.get('ajax/babble', function (data) {
    $('#mainDiv').append('<p>' + data['them'] + '</p>')
    $('#mainDiv').append('<ul>')
    // TODO: replace existing list
    for (var i = 0; i < data['you'].length; i++) {
        $('#mainDiv').append('<li><a href="#" onclick="selectChoice()>' 
            + data['you'][i] + '</a></li>')
    }

  $.ajax({
    url: '/friend',
    type: 'GET',
    success: function(json) {
      console.log(json);
    },
    error: function(xhr, status, error) {
      console.log("error getting friend!", error);
    }
  });

});
