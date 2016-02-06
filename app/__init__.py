from flask import Flask
from flask_sslify import SSLify
import os


app = Flask(__name__)

from app import views

if 'HEROKU' in os.environ: # Production mode
    sslify = SSLify(app) # redirect to SSL
else:
    app.debug = True

