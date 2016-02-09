(function() {
  function findFriends() {
    $.get('/friends', function(data) {
      if (data.error) {
        // Redirect to login page in case access token expired
        window.location.assign(root_url + 'login');
        return;
      }

      if (data.friends) {
        $('#friends-box').show();

        var friendsList = $('#friends');
        $.each(data.friends, function(i) {
          var li = $('<li/>').appendTo(friendsList);
          createFriendLink(data.friends[i], li)
        });
      }
    });
  }

  function createFriendLink(friend, li) {
    var ahref = $('<a/>').attr('href', '/date/' + friend.id).appendTo(li);
    var image = $('<img/>').attr('src', 'https://graph.facebook.com/' + friend.id + '/picture/').appendTo(ahref);
    var name = $('<div/>').text(friend.name).appendTo(ahref);
  }

  function checkPermissions() {
    $.get('/permissions', function(data) {
      if (data.error) {
        // Redirect to login page in case access token expired
        window.location.assign(root_url + 'login');
        return;
      }

      for (var i = 0; i < data.length; i++) {
        if (data[i].permission == 'user_posts' && data[i].status != 'granted') {
          // TODO: tell them to allow user_posts
        }
      }
    });
  }

  $(document).ready(function() {
    checkPermissions();
    findFriends();
  });
})();
