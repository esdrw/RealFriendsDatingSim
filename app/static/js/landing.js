(function() {
  function findFriends() {
    $.get('/friends', function(data) {
      if (data.error) {
        // Redirect to login page in case access token expired
        window.location.assign(root_url + 'logout');
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
    $('#relogin').click(function(e) {
      e.preventDefault();
      FB.login(function(response) {
          window.location = window.location; // refresh
      }, {
        scope: 'user_posts',
        auth_type: 'rerequest'
      });
    });

    $.get('/permissions', function(data) {
      if (data.error) {
        // Redirect to login page in case access token expired
        window.location.assign(root_url + 'logout');
        return;
      }

      var permissions = data.permissions.data;
      var permissionError = false;
      for (var i = 0; i < permissions.length; i++) {
        if (permissions[i].permission === 'user_posts' && permissions[i].status === 'declined') {
          permissionError = true;
          break;
        }
      }

      if (permissionError) {
        $('#dating-info').hide();
        $('#dating-error1').show();
      } else {
        // Test babbling to make sure we can generate text
        $.get('/babble?limit=5&id=me', function(data) {
          if (!data.babble) {
            $('#dating-info').hide();
            $('#dating-error2').show();
          } else {
            findFriends();
          }
        });
      }
    });
  }

  $(document).ready(function() {
    checkPermissions();
  });
})();
