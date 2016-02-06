$(document).ready(function() {

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
