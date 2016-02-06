from flask import Flask
from flask_sslify import SSLify
import os


app = Flask(__name__)
app.secret_key = 'bakanekotsunderedesu'

if 'HEROKU' in os.environ: # Production mode
    sslify = SSLify(app) # redirect to SSL
else:
    app.debug = True

from app import views
