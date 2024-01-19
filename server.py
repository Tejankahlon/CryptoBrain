from flask import Flask, render_template, flash, send_from_directory, request, session, url_for, jsonify
import os
from crypto_brain.models.users_model import User
from flask_bcrypt import Bcrypt
from crypto_brain.config.mongoconnection import get_db
from flask_cors import CORS


# Initialize Flask app
app = Flask(__name__, static_folder='./client/build', static_url_path='')
app.secret_key = 'qm&4Bkd8*l38^Fgam%1nVTqO'
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'


# Flask routes
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/check-login')
def check_login():
    is_logged_in = 'user_id' in session
    return jsonify({'isLoggedIn': is_logged_in})

@app.route('/process-login', methods=['POST'])
def process_login():
    user = User.validate_login(request.form, bcrypt)
    if user:
        session.permanent = True
        session['user_id'] = str(user.id)
        session['logged_in'] = True
        print("Session set for user:", session['user_id'])
        return jsonify({'success': True}), 200
        # return redirect("http://localhost:3000/home")
    else:
        flash('Invalid login credentials')
        return jsonify({'success': False, 'error': 'Invalid login credentials'}), 401


@app.route('/process-register', methods=['POST'])
def process_register():
    form_data = request.form
    if not User.validate_reg(form_data):
        flash('Registration failed. Please try again.')
        return jsonify({'error': 'Registration error: Please make sure all fields are filled out correctly.'}), 400
    hashed_password = Bcrypt().generate_password_hash(form_data['password']).decode('utf-8')
    user_data = {
        'first_name': form_data['first_name'],
        'last_name': form_data['last_name'],
        'email': form_data['email'],
        'password': hashed_password,
    }
    try:
        db = get_db()
        db.users.insert_one(user_data)
        return jsonify({'success': True}), 200
        # return redirect("http://localhost:3000/home")
    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': 'Registration failed, please try again.'}), 400

@app.route('/logout')
def logout_user():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message':'Logged out successfully'}), 200

@app.route('/test-session')
def test_session():
    return jsonify({'isLoggedIn': 'user_id' in session})

@app.route('/flask-static/<path:filename>')
def flask_static(filename):
    return send_from_directory('static', filename)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
