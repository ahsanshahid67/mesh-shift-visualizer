"""
App.py — Flask application entry point for Mesh Circular Shift Visualizer.
"""

import sys
import os
from flask import Flask, render_template, request, jsonify, send_from_directory

# Add parent directory so we can import from utils
sys.path.insert(0, os.path.dirname(__file__))

from utils.shiftLogic import validate_inputs, compute_shift, compute_complexity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, '..', 'public'),
    static_folder=os.path.join(BASE_DIR, '..', 'public'),
    static_url_path='/static'
)


@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


@app.route('/components/<path:filename>')
def serve_component(filename):
    """Serve JS component files from src/components."""
    return send_from_directory(os.path.join(BASE_DIR, 'components'), filename)


@app.route('/api/shift', methods=['POST'])
def api_shift():
    """Compute shift results for given p and q."""
    data = request.get_json(force=True)
    try:
        p = int(data.get('p', 0))
        q = int(data.get('q', 0))
    except (ValueError, TypeError):
        return jsonify({"errors": ["p and q must be integers."]}), 400

    errors = validate_inputs(p, q)
    if errors:
        return jsonify({"errors": errors}), 400

    shift_result = compute_shift(p, q)
    complexity_result = compute_complexity(p, q)

    return jsonify({
        "shift": shift_result,
        "complexity": complexity_result,
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
