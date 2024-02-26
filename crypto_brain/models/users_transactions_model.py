from datetime import datetime
from bson import ObjectId
from crypto_brain.config.mongoconnection import get_db

class Transaction:
    def __init__(self, user_id, coin_id, transaction_type, amount, price, timestamp=None):
        self.user_id = user_id
        self.coin_id = coin_id
        self.transaction_type = transaction_type  # 'buy' or 'sell'
        self.amount = amount 
        self.price = price 
        self.timestamp = timestamp if timestamp else datetime.utcnow()  # Timestamp of the transaction

    @classmethod
    def save(cls, transaction_data):
        db = get_db()
        transaction = {
            'user_id': ObjectId(transaction_data['user_id']),
            'coin_id': transaction_data['coin_id'],
            'transaction_type': transaction_data['transaction_type'],
            'amount': transaction_data['amount'],
            'price': transaction_data['price'],
            'timestamp': transaction_data.get('timestamp', datetime.utcnow())
            }
        db.transactions.insert_one(transaction)

    @classmethod
    def get_transactions_by_user_id(cls, user_id):
            db = get_db()
            transactions = list(db.transactions.find({'user_id': ObjectId(user_id)}))
            return transactions  # You might want to convert these to `Transaction` objects or leave as dictionaries

