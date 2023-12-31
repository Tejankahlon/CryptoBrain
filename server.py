from flask import Flask, render_template, redirect, send_from_directory, request, session, url_for, jsonify
import os
from crypto_brain.models.users_model import User
from flask_bcrypt import Bcrypt
from crypto_brain.config.mongoconnection import get_db


# Initialize Flask app
app = Flask(__name__, static_folder='./client/build', static_url_path='')
app.secret_key = 'qm&4Bkd8*l38^Fgam%1nVTqO'
bcrypt = Bcrypt(app)
# Flask routes
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/process-login', methods=['POST'])
def process_login():
    user = User.validate_login(request.form, bcrypt)
    if user:
        session['user_id'] = str(user.id)
        return redirect("http://localhost:3000/home")
    else:
        return jsonify({'success': False, 'error': 'Invalid login credentials'}), 401

@app.route('/process-register', methods=['POST'])
def process_register():
    form_data = request.form
    if not User.validate_reg(form_data):
        return jsonify({'error': 'Registration validation failed'}), 400
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
        return redirect("http://localhost:3000/home")
    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': 'Registration failed, please try again.'}), 400


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
