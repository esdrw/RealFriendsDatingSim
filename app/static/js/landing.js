(function() {
  function findFriends() {
    $.get('/friends', function (data) {
      console.log(data);
      if (data && data.friends.length > 0) {
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

  $(document).ready(function() {
    findFriends();
  });
})();
