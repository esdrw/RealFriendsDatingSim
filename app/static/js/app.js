$(document).ready(function() {

  $.ajax({
    url: '/posts',
    type: 'GET',
    success: function(json) {
      showDialogue(json.dialogue);
    },
    error: function(xhr, status, error) {
      console.log("error getting posts!", error);
    }
  });

  function showDialogue(text) {
    $('#dialogue').text(text);
  }

});
