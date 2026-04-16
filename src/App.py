from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import sys

# Ensure imports work
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from utils.shiftLogic import validate_inputs, compute_shift, compute_complexity

app = Flask(
    __name__,
    template_folder="public",
    static_folder="public"
)

@app.route('/')
def index():
    return render_template('index.html')


# FIXED path for components
@app.route('/components/<path:filename>')
def serve_component(filename):
    return send_from_directory(os.path.join("src", "components"), filename)


@app.route('/api/shift', methods=['POST'])
def api_shift():
    data = request.get_json(force=True)

    try:
        p = int(data.get('p', 0))
        q = int(data.get('q', 0))
    except:
        return jsonify({"errors": ["p and q must be integers."]}), 400

    errors = validate_inputs(p, q)
    if errors:
        return jsonify({"errors": errors}), 400

    return jsonify({
        "shift": compute_shift(p, q),
        "complexity": compute_complexity(p, q),
    })
