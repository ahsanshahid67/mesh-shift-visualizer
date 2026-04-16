/**
 * ComplexityPanel.js — Displays complexity analysis, formulas, and bar chart
 */

const ComplexityPanel = (() => {
    function update(complexity) {
        const container = document.getElementById('complexity-content');
        if (!complexity) {
            container.innerHTML = '<div class="empty-state" style="min-height:200px"><p style="color:var(--text-muted)">Run a shift to see analysis</p></div>';
            return;
        }

        const { p, q, sqrt_p, row_shift, col_shift, mesh_steps, ring_steps, mesh_formula, ring_formula, efficiency_gain } = complexity;
        const maxSteps = Math.max(mesh_steps, ring_steps, 1);

        container.innerHTML = `
      <div class="shift-info-tags">
        <span class="shift-tag row">Row Shift: ${row_shift}</span>
        <span class="shift-tag col">Col Shift: ${col_shift}</span>
      </div>

      <div class="metric-row">
        <span class="metric-label">Mesh Total Steps</span>
        <span class="metric-value mesh">${mesh_steps}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Ring Total Steps</span>
        <span class="metric-value ring">${ring_steps}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Grid Size</span>
        <span class="metric-value">${sqrt_p} × ${sqrt_p}</span>
      </div>

      <div class="formula-block">
        <span class="formula-label">Mesh Formula</span>
        <span class="formula-mesh">${escapeHtml(mesh_formula)}</span>
      </div>
      <div class="formula-block">
        <span class="formula-label">Ring Formula</span>
        <span class="formula-ring">${escapeHtml(ring_formula)}</span>
      </div>

      <div class="bar-chart-container">
        <div class="bar-chart-title">Step Count Comparison</div>
        <div class="bar-row">
          <span class="bar-label mesh">Mesh</span>
          <div class="bar-track">
            <div class="bar-fill mesh-bar" style="width: ${(mesh_steps / maxSteps * 100).toFixed(1)}%">${mesh_steps}</div>
          </div>
        </div>
        <div class="bar-row">
          <span class="bar-label ring">Ring</span>
          <div class="bar-track">
            <div class="bar-fill ring-bar" style="width: ${(ring_steps / maxSteps * 100).toFixed(1)}%">${ring_steps}</div>
          </div>
        </div>
        ${efficiency_gain > 0
                ? `<div class="efficiency-badge">⚡ Mesh saves ${efficiency_gain} step${efficiency_gain > 1 ? 's' : ''} (${((1 - mesh_steps / ring_steps) * 100).toFixed(0)}% fewer)</div>`
                : efficiency_gain === 0
                    ? `<div class="efficiency-badge" style="background:rgba(245,158,11,0.12);color:var(--accent-orange)">⚖️ Same step count</div>`
                    : `<div class="efficiency-badge" style="background:rgba(239,68,68,0.12);color:var(--accent-red)">Ring is more efficient here</div>`
            }
      </div>
    `;

        // Animate bar widths
        requestAnimationFrame(() => {
            const bars = container.querySelectorAll('.bar-fill');
            bars.forEach(bar => {
                const target = bar.style.width;
                bar.style.width = '0%';
                requestAnimationFrame(() => { bar.style.width = target; });
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { update };
})();
