from pymongo import MongoClient

def get_db():
    client = MongoClient('mongodb://localhost:27017/crypto_brain_db')
    db = client['crypto_brain_db']  
    return db
