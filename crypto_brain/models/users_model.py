from flask import flash
from flask import render_template, redirect, request, session, current_app
from flask_bcrypt import Bcrypt
from bson import ObjectId
from crypto_brain.config.mongoconnection import get_db
import re 

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

class User:
    
    def __init__(self, db_data):
        self.id = db_data.get('_id')
        self.first_name = db_data.get('first_name')
        self.last_name = db_data.get('last_name')
        self.email = db_data.get('email')
        self.password = db_data.get('password')
        self.created_at = db_data.get('created_at')
        self.updated_at = db_data.get('updated_at')

    @classmethod
    def save(cls, form_data):
        hashed_data = {
            'first_name': form_data['first_name'],
            'last_name': form_data['last_name'],
            'email': form_data['email'],
            'password': current_app.bcrypt.generate_password_hash(form_data['password']).decode('utf-8'),
        }
        db = get_db()  # Function to get MongoDB database instance
        db.users.insert_one(hashed_data) 

    @classmethod
    def get_by_email(cls, email):
            db = get_db()
            user_data = db.users.find_one({'email': email})
            return cls(user_data) if user_data else None

    @classmethod
    def get_by_id(cls, user_id):
            db = get_db()
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            return cls(user_data) if user_data else None

    @staticmethod
    def validate_reg(form_data):
        is_valid = True

        if len(form_data['email']) < 1:
            flash("Email cannot be blank.", "register")
            is_valid = False
        elif not EMAIL_REGEX.match(form_data['email']):
            flash("Invalid email address.", "register")
            is_valid = False
        elif User.get_by_email(form_data):
            flash("A user already exists for that email.", "register")
            is_valid = False
        if len(form_data['password']) < 8:
            flash("Password must be at least 8 characters long.", "register")
            is_valid = False
        if form_data['password'] != form_data['confirm_password']:
            flash("Passwords must match.", "register")
            is_valid = False
        if len(form_data['first_name']) < 3:
            flash("First name must be at least 3 characters long.", "register")
            is_valid = False
        if len(form_data['last_name']) < 3:
            flash("Last name must be at least 3 characters long.", "register")
            is_valid = False

        return is_valid
    
    @staticmethod
    def validate_login(form_data, bcrypt):
        if not EMAIL_REGEX.match(form_data['email']):
            flash("Invalid email/password.", "login")
            return False
        user = User.get_by_email(form_data['email'])
        if user and bcrypt.check_password_hash(user.password, form_data['password']):
            return user
        else:
            return None
