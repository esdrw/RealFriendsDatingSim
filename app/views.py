from facebook import get_user_from_cookie, GraphAPI, GraphAPIError
from functools import wraps
from flask import g, jsonify, render_template, redirect, request, session, url_for
from app import app
from babbler import get_reply

# Facebook app details
FB_APP_ID = '1561303244188583'
FB_APP_NAME = 'Kawaii Tomodachi-desu'
FB_APP_SECRET = '51026d49c3cf27a091d502b1f8ef0698'

FB_USERAGENT_BOT = 'facebookexternalhit/1.1'

PROFILE_FIELDS = 'id,name,first_name,gender,birthday,link'

# Max number of objects to return from FB query
REQUEST_LIMIT = 100

# Login wrapper
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None and FB_USERAGENT_BOT not in request.headers.get('User-Agent'):
            return redirect(url_for('login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/')
@login_required
def index():
    user = session.get('user')
    return render_template('index.html', app_id=FB_APP_ID,
                           app_name=FB_APP_NAME, user=user,
                           root_url=request.url_root)

@app.route('/privacy')
def get_privacy():
    return render_template('privacy.html', app_id=FB_APP_ID,
                           app_name=FB_APP_NAME,
                           root_url=request.url_root)

@app.route('/about')
def get_about():
    return render_template('about.html', app_id=FB_APP_ID,
                           app_name=FB_APP_NAME,
                           root_url=request.url_root)

@app.route('/login')
def login():
    """Log in user on Facebook."""
    next = request.args.get('next') or url_for('index')
    return render_template('login.html', app_id=FB_APP_ID, name=FB_APP_NAME,
                           root_url=request.url_root, next=next[1:])

@app.route('/logout')
def logout():
    """Log out the user from the application.

    Log out the user from the application by removing them from the
    session.  Note: this does not log the user out of Facebook - this is done
    by the JavaScript SDK.
    """
    session.pop('user', None)
    session.pop('access_token', None)
    g.user = None
    return redirect(url_for('login'))


@app.route('/date/<friendId>', methods=['GET'])
@login_required
def date_friend(friendId=None):
    """ Return a json of a random friend's data."""
    user = session.get('user')
    access_token = session.get('access_token', None)

    try:
        graph = GraphAPI(access_token)
        profile = graph.get_object(friendId, fields=PROFILE_FIELDS)
    except GraphAPIError:
        # If something went wrong with token, redirect to logout and login
        return redirect(url_for('logout'))

    friend = profileToDict(profile)

    session['friend'] = friend
    return render_template('dating.html', app_id=FB_APP_ID,
                           app_name=FB_APP_NAME, user=user,
                           friend=friend)


@app.route('/babble', methods=['GET'])
@login_required
def gen_babble():
    limit = request.args.get('limit') or REQUEST_LIMIT
    friendId = request.args.get('id') or session['friend']['id']
    access_token = session.get('access_token', None)
    if not access_token:
        return jsonify(babble=None, error="Missing access token.")

    try:
        graph = GraphAPI(access_token)
        posts = graph.get_connections(id=friendId, connection_name='posts', fields='message', limit=limit)
    except GraphAPIError as e:
        return jsonify(babble=None, error=e.result)

    dialogue = babble_posts(posts)
    return jsonify(babble=dialogue)


@app.route('/birthday', methods=['GET'])
@login_required
def get_birthday():
    return jsonify(birthday=session['friend']['birthday'])

@app.route('/permissions', methods=['GET'])
@login_required
def get_permissions():
    access_token = session.get('access_token', None)
    if not access_token:
        return jsonify(permissions=None, error="Missing access token.")

    try:
        graph = GraphAPI(access_token)
        permissions = graph.get_connections(id='me', connection_name='permissions')
    except GraphAPIError as e:
        return jsonify(permissions=None, error=e.result)

    return jsonify(permissions=permissions)


@app.route('/friends', methods=['GET'])
@login_required
def get_friends():
    # TODO: paginate friends
    access_token = session.get('access_token', None)
    if not access_token:
        return jsonify(friends=None, error="Missing access token.")

    try:
        graph = GraphAPI(access_token)
        profiles = graph.get_connections(id='me', connection_name='friends', limit=REQUEST_LIMIT)
    except GraphAPIError as e:
        return jsonify(friends=None, error=e.result)

    # TODO: include privacy filters?
    friends = profiles['data']

    if not friends:
        # you have no friends :(
        return jsonify(friends=None)

    return jsonify(friends=friends)


def babble_posts(posts):
    if not posts['data']:
        return ''
    return get_reply([post.get('message') for post in posts['data'] if post.get('message')])

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
    if session.get('user') and session.get('access_token'):
        g.user = session.get('user')
        return

    # Attempt to get the short term access token for the current user.
    try:
        result = get_user_from_cookie(cookies=request.cookies, app_id=FB_APP_ID,
                                      app_secret=FB_APP_SECRET)

        # If there is no result, we assume the user is not logged in.
        if result:
            # Not an existing user so get info
            graph = GraphAPI(result['access_token'])
            profile = graph.get_object('me', fields=PROFILE_FIELDS)

            # Add the user to the current session
            session['user'] = profileToDict(profile)
            session['access_token'] = result['access_token']

    except GraphAPIError:
        pass

    # Set the user as a global g.user
    g.user = session.get('user', None)


def profileToDict(profile):
    return dict(name=profile['name'],
                id=str(profile['id']),
                first_name=profile.get('first_name'),
                profile_url=profile.get('link', ''),
                birthday=profile.get('birthday'),
                gender=profile.get('gender'))
