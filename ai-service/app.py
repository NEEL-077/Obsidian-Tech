from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv('PORT', 8000))

@app.route('/')
def home():
    return jsonify({
        'message': 'Obsidian Tech AI Service is running!',
        'version': '1.0.0'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'OK',
        'service': 'AI Service'
    })

# Placeholder for AI recommendation endpoint
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    user_id = data.get('user_id')
    
    # TODO: Implement recommendation algorithm
    return jsonify({
        'user_id': user_id,
        'recommendations': [],
        'message': 'Recommendation system not yet implemented'
    })

# Placeholder for chatbot endpoint
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    message = data.get('message')
    
    # TODO: Implement chatbot logic
    return jsonify({
        'response': 'Chatbot not yet implemented',
        'message': message
    })

if __name__ == '__main__':
    print(f'🤖 AI Service running on http://localhost:{PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=True)
