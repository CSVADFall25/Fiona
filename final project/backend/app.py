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
    data = request.json
    username = data.get("username")
    
    # Call upon bundle function within processing.py:
    bundle = full_bundle(username, API_KEY)

    return jsonify(bundle)

if __name__ == "__main__":
    app.run(port=5000, debug=True)