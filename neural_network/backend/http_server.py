from flask import Flask, request, jsonify
from flask_cors import CORS
import matplotlib.pyplot as plt
import numpy as np

from neural_network.digit_recognition import recognize_digit


app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json()
    image_data = data.get('image')

    pixel_array = np.array(image_data, dtype=np.uint8)

    result = recognize_digit(pixel_array)

    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(host = "localhost", port=8080)