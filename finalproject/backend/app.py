from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from processing import full_bundle # python 

load_dotenv()

API_KEY = os.getenv("TMDB_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/get_movies", methods=["POST"])
def get_movies():
    try:
        data = request.json
        username = data.get("username")
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Call upon bundle function within processing.py:
        bundle = full_bundle(username, API_KEY)
        return jsonify(bundle)
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "api_key_set": bool(API_KEY)}), 200

@app.route("/test", methods=["POST"])
def test():
    try:
        data = request.json
        username = data.get("username", "unknown")
        return jsonify({"message": f"Received username: {username}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)