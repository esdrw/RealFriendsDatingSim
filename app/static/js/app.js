$(document).ready(function() {

  $.ajax({
    url: '/posts',
    type: 'GET',
    success: function(json) {
      console.log(json);
    },
    error: function(xhr, status, error) {
      console.log("error getting posts!", error);
    }
  });

});
