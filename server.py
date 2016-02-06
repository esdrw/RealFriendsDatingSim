from flask import Flask, render_template, request, jsonify
import os


app = Flask(__name__)
if 'HEROKU' in os.environ: # Production mode
    sslify = SSLify(app) # redirect to SSL
else:
    app.debug = True

@app.route('/')
def index():
    return render_template('index.html')


def validFields(form, fields):
    for f in fields:
        if f not in form: return False
    return True

@app.route('/login', methods=['POST'])
def login():
    # login to facebook?
    pass

@app.route('/logout', methods=['POST'])
def logout():
    # logout
    pass


if __name__ == "__main__":
    app.run(host='0.0.0.0')

