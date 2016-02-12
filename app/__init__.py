from flask import Flask
import os


app = Flask(__name__)
app.secret_key = 'bakanekotsunderedesu'

if 'HEROKU' in os.environ: # Production mode
    pass
else:
    app.debug = True

from app import views
