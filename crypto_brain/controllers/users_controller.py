# from crypto_brain import app
# from flask import render_template, redirect, request, session, url_for
# from crypto_brain.models.users_model import User

# @app.route('/login')
# def index():
#     return render_template('login.html')

# @app.route("/register")
# def register():
#     return render_template('register.html')

# @app.route('/process-login', methods=['POST'])
# def process_login():
#     user = User.validate_login(request.form)
#     if not user:
#         return {'error': 'Invalid login credentials'}, 401
#     else:
#         session['user_id'] = user.id
#         return {'message': 'Login successful'}, 200


# @app.route('/process-register', methods=['POST'])
# def process_register():
#     create_user = User.validate_reg(request.form)
#     if create_user is True:
#         return {'message': 'User created successfully!'}, 201
#     else:
#         return {'error': 'Registration failed, please try again.'}, 400


# @app.route('/app')
# def react_app():
#     # Serves React App
#     return render_template('react_app.html')

