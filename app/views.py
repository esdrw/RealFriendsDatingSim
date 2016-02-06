from facebook import get_user_from_cookie, GraphAPI
from flask import g, jsonify, render_template, redirect, request, session, url_for

from app import app

# Facebook app details
FB_APP_ID = '1561303244188583'
FB_APP_NAME = 'Kawaii Tomodachi-desu'
FB_APP_SECRET = '51026d49c3cf27a091d502b1f8ef0698'


@app.route('/')
def index():
    # If a user was set in the get_current_user function before the request,
    # the user is logged in.
    user = session.get('user')
    if user:
        return render_template('index.html', app_id=FB_APP_ID,
                               app_name=FB_APP_NAME, user=user)

    # Otherwise, a user is not logged in.
    return render_template('login.html', app_id=FB_APP_ID, name=FB_APP_NAME)


@app.route('/logout')
def logout():
    """Log out the user from the application.

    Log out the user from the application by removing them from the
    session.  Note: this does not log the user out of Facebook - this is done
    by the JavaScript SDK.
    """
    session.pop('user', None)
    return redirect(url_for('index'))


@app.route('/friend', methods=['GET'])
def get_friend():
    """ Return a json of a random friend's data."""
    access_token = session.get('access_token', None)

    # If there is no result, we assume the user is not logged in.
    if not access_token:
        return jsonify(friends=None)

    graph = GraphAPI(access_token)
    friends = graph.get_connections(id='me', connection_name='friends')
    return jsonify(friends=friends)

@app.before_request
def get_current_user():
    """Set g.user to the currently logged in user.

    Called before each request, get_current_user sets the global g.user
    variable to the currently logged in user.  A currently logged in user is
    determined by seeing if it exists in Flask's session dictionary.

    If it is the first time the user is logging into this application it will
    create the user.  If the user is not logged in, None will be set to g.user.
    """

    # Set the user in the session dictionary as a global g.user and bail out
    # of this function early.
    if session.get('user'):
        g.user = session.get('user')
        return

    # Attempt to get the short term access token for the current user.
    result = get_user_from_cookie(cookies=request.cookies, app_id=FB_APP_ID,
                                  app_secret=FB_APP_SECRET)

    # If there is no result, we assume the user is not logged in.
    if result:
        # Not an existing user so get info
        graph = GraphAPI(result['access_token'])
        profile = graph.get_object('me')
        if 'link' not in profile:
            profile['link'] = ""

        # Add the user to the current session
        session['user'] = dict(name=profile['name'], profile_url=profile['link'],
                               id=str(profile['id']), access_token=result['access_token'])
        session['access_token'] = result['access_token']

    # Set the user as a global g.user
    g.user = session.get('user', None)
