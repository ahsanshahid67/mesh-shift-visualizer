# Mesh Circular Shift Visualizer

Interactive web application that simulates and visualizes circular q-shift operations on a 2D mesh topology in parallel computing.

## 🔗 Live Deployment

**Live URL:**: `mesh-shift-visualizer-iota.vercel.app`

## Features

- **Input Controls** — Select number of processors (p: 4–64, perfect squares) and shift amount (q)
- **Mesh Grid Visualization** — Renders a √p × √p grid showing node indices and data values
- **Step-by-Step Animation** — Animated Stage 1 (row shift) and Stage 2 (column shift) with directional arrows
- **Before/After State** — Displays initial state, after row shift, and final state
- **Complexity Analysis Panel** — Real-time comparison of Mesh vs Ring shift efficiency with bar chart

## Tech Stack

- **Backend:** Python / Flask
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Deployment:** Render / Vercel

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mesh-shift-visualizer.git
cd mesh-shift-visualizer

# Install dependencies
pip install -r requirements.txt

# Run the application
python src/App.py
```

### Access
Open your browser and navigate to `http://127.0.0.1:5000`

## Project Structure

```
mesh-shift-visualizer/
├── public/
│   ├── index.html          ← Main HTML page
│   └── style.css           ← Stylesheet
├── src/
│   ├── components/
│   │   ├── MeshGrid.js     ← Grid rendering + animation
│   │   ├── ControlPanel.js ← User inputs
│   │   └── ComplexityPanel.js ← Analysis panel
│   ├── utils/
│   │   └── shiftLogic.py   ← Pure shift algorithm (testable)
│   ├── App.py              ← Flask application entry point
│   └── index.js            ← Entry reference
├── README.md
├── requirements.txt
└── package.json
```

## Algorithm

The circular q-shift on a 2D mesh is implemented in two stages:
1. **Stage 1 (Row Shift):** Each node shifts within its row by `q mod √p` positions
2. **Stage 2 (Column Shift):** Each node shifts within its column by `⌊q / √p⌋` positions

**Mesh steps** = `(q mod √p) + ⌊q / √p⌋`  
**Ring steps** = `min(q, p − q)`

The mesh topology is more efficient because it decomposes the shift into two smaller independent operations.
