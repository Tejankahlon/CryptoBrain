from crypto_brain import app
from flask import render_template, redirect, request, session, url_for
from crypto_brain.models.users_model import User

@app.route('/login')
def index():
    return render_template('login.html')

@app.route("/register")
def register():
    return render_template('register.html')

@app.route('/process-login', methods=['POST'])
def process_login():
    user = User.validate_login(request.form)
    if not user:
        return redirect(url_for('index', error="Invalid login credentials"))
    session['user_id'] = user.id
    return redirect(url_for('react_app'))

@app.route('/app')
def react_app():
    # Serves React App
    return render_template('react_app.html')

# setup client for react