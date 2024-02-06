from flask import Flask, render_template, flash, send_from_directory, request, session, url_for, jsonify
import os
from crypto_brain.models.users_model import User
from flask_bcrypt import Bcrypt
from crypto_brain.config.mongoconnection import get_db
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import requests, time
from dotenv import load_dotenv


# Initialize Flask app
app = Flask(__name__, static_folder='./client/build', static_url_path='')
load_dotenv()
app.secret_key = os.environ.get('FLASK_APP_SECRET_KEY')
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)
cache = {}

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

@app.route('/api/markets', methods=['GET'])
def get_market_data():
    current_time = time.time()
    # Checks if we have cached data and it's still valid (within 1 minute)
    cached_data = cache.get('market_data')
    if cached_data and current_time - cached_data['timestamp'] < 60:
        return jsonify(cached_data['data']) # Return cached data
    # If no valid cache, makes a request to CoinGecko API
    response = requests.get("https://api.coingecko.com/api/v3/coins/markets", params={
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 50,
        'page': 1
    })
    # Update cache with new data and current timestamp
    cache['market_data'] = {
        'timestamp': current_time,
        'data': response.json()
    }
    # Return the fresh new data from API call
    return jsonify(response.json())

@app.route('/api/coins')
def get_coins():
    response = requests.get('https://api.coingecko.com/api/v3/coins/list')
    return jsonify(response.json())

@app.route('/api/price/<coin_id>', methods=['GET'])
def get_coin_price(coin_id):
    response = requests.get(f'https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd')
    return jsonify(response.json())

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
