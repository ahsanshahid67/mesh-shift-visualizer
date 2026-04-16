/**
 * MeshGrid.js — Grid rendering + step-by-step animation with SVG arrows
 */

const MeshGrid = (() => {
    let currentData = null;
    let animationState = 'all'; // 'initial', 'stage1', 'stage2', 'all'

    function render(data) {
        currentData = data;
        const shift = data.shift;
        const container = document.getElementById('mesh-content');

        container.innerHTML = '';

        // Stage control buttons
        const controls = document.createElement('div');
        controls.className = 'animation-controls';
        controls.innerHTML = `
      <button class="btn-anim active" data-stage="all">Show All Stages</button>
      <button class="btn-anim" data-stage="initial">Initial State</button>
      <button class="btn-anim" data-stage="stage1">Stage 1 — Row Shift</button>
      <button class="btn-anim" data-stage="stage2">Stage 2 — Column Shift</button>
      <button class="btn-anim" data-stage="animate">▶ Animate</button>
    `;
        container.appendChild(controls);

        controls.querySelectorAll('.btn-anim').forEach(btn => {
            btn.addEventListener('click', () => {
                controls.querySelectorAll('.btn-anim').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const stage = btn.dataset.stage;
                if (stage === 'animate') {
                    runAnimation(shift, container, controls);
                } else {
                    animationState = stage;
                    renderStages(shift, container);
                }
            });
        });

        animationState = 'all';
        renderStages(shift, container);

        // Update stage indicators in sidebar
        updateStageIndicators('idle');
    }

    function renderStages(shift, container) {
        // Remove existing stage blocks but keep controls
        container.querySelectorAll('.mesh-stage-block').forEach(el => el.remove());

        const stages = [];

        if (animationState === 'all' || animationState === 'initial') {
            stages.push({ title: 'Initial State', badge: 'initial', grid: shift.initial, moves: null, moveType: null });
        }
        if (animationState === 'all' || animationState === 'stage1') {
            stages.push({ title: `After Stage 1 — Row Shift (→ ${shift.row_shift})`, badge: 'stage1', grid: shift.after_stage1, moves: shift.stage1_moves, moveType: 'row' });
        }
        if (animationState === 'all' || animationState === 'stage2') {
            stages.push({ title: `After Stage 2 — Column Shift (↓ ${shift.col_shift}) — Final`, badge: 'stage2', grid: shift.final, moves: shift.stage2_moves, moveType: 'col' });
        }

        stages.forEach((stage, idx) => {
            const block = document.createElement('div');
            block.className = 'mesh-stage-block';
            block.innerHTML = `<h3><span class="stage-badge ${stage.badge}">${stage.badge === 'initial' ? 'Before' : stage.badge === 'stage1' ? 'Stage 1' : 'Final'}</span> ${stage.title}</h3>`;

            const wrapper = document.createElement('div');
            wrapper.className = 'mesh-grid-wrapper';

            const grid = createGrid(shift.sqrt_p, stage.grid, stage.badge);
            wrapper.appendChild(grid);

            if (stage.moves && stage.moves.length > 0) {
                const svg = createArrows(shift.sqrt_p, stage.moves, stage.moveType);
                wrapper.appendChild(svg);
            }

            block.appendChild(wrapper);
            container.appendChild(block);

            // Stagger animation
            const nodes = grid.querySelectorAll('.mesh-node');
            nodes.forEach((node, i) => {
                node.classList.add('animate-in');
                node.style.animationDelay = `${i * 30 + idx * 150}ms`;
            });
        });
    }

    function createGrid(sqrtP, gridData, badgeType) {
        const grid = document.createElement('div');
        grid.className = 'mesh-grid';
        grid.style.gridTemplateColumns = `repeat(${sqrtP}, 60px)`;

        for (let r = 0; r < sqrtP; r++) {
            for (let c = 0; c < sqrtP; c++) {
                const node = document.createElement('div');
                const nodeIdx = r * sqrtP + c;
                node.className = 'mesh-node';
                if (badgeType === 'stage1') node.classList.add('highlight-row');
                else if (badgeType === 'stage2') node.classList.add('highlight-final');
                node.dataset.row = r;
                node.dataset.col = c;
                node.innerHTML = `
          <span class="node-index">N${nodeIdx}</span>
          <span class="node-value">${gridData[r][c]}</span>
        `;
                grid.appendChild(node);
            }
        }
        return grid;
    }

    function createArrows(sqrtP, moves, type) {
        const nodeSize = 60;
        const gap = 6;
        const padding = 12;
        const cellSize = nodeSize + gap;
        const svgW = padding * 2 + sqrtP * nodeSize + (sqrtP - 1) * gap;
        const svgH = svgW;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'arrow-overlay');
        svg.setAttribute('width', svgW);
        svg.setAttribute('height', svgH);
        svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);

        const defsStr = type === 'row'
            ? `<defs><marker id="arrowhead-cyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#06b6d4"/></marker></defs>`
            : `<defs><marker id="arrowhead-purple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#8b5cf6"/></marker></defs>`;
        svg.innerHTML = defsStr;

        const color = type === 'row' ? '#06b6d4' : '#8b5cf6';
        const markerId = type === 'row' ? 'arrowhead-cyan' : 'arrowhead-purple';

        moves.forEach((move, idx) => {
            const x1 = padding + move.from_col * cellSize + nodeSize / 2;
            const y1 = padding + move.from_row * cellSize + nodeSize / 2;
            const x2 = padding + move.to_col * cellSize + nodeSize / 2;
            const y2 = padding + move.to_row * cellSize + nodeSize / 2;

            // Offset arrows slightly so they don't go through center
            const offset = type === 'row' ? -8 : -8;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', type === 'row' ? y1 + offset : y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', type === 'row' ? y2 + offset : y2);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('marker-end', `url(#${markerId})`);
            line.setAttribute('opacity', '0');
            line.classList.add('visible');
            line.style.transition = `opacity 0.3s ease ${idx * 40}ms`;

            svg.appendChild(line);
        });

        return svg;
    }

    async function runAnimation(shift, container, controls) {
        updateStageIndicators('initial');

        // Show initial
        animationState = 'initial';
        renderStages(shift, container);
        await delay(1200);

        // Show stage 1
        updateStageIndicators('stage1');
        animationState = 'stage1';
        renderStages(shift, container);
        await delay(1500);

        // Show stage 2
        updateStageIndicators('stage2');
        animationState = 'stage2';
        renderStages(shift, container);
        await delay(1500);

        // Show all
        updateStageIndicators('done');
        animationState = 'all';
        renderStages(shift, container);

        // Reset button state
        controls.querySelectorAll('.btn-anim').forEach(b => b.classList.remove('active'));
        controls.querySelector('[data-stage="all"]').classList.add('active');
    }

    function updateStageIndicators(state) {
        const dots = document.querySelectorAll('.stage-dot');
        const labels = document.querySelectorAll('.stage-label');

        dots.forEach(d => { d.classList.remove('active', 'done'); });
        labels.forEach(l => { l.classList.remove('active', 'done'); });

        if (state === 'initial' || state === 'stage1' || state === 'stage2' || state === 'done') {
            dots[0].classList.add(state === 'initial' ? 'active' : 'done');
            labels[0].classList.add(state === 'initial' ? 'active' : 'done');
        }
        if (state === 'stage1' || state === 'stage2' || state === 'done') {
            dots[1].classList.add(state === 'stage1' ? 'active' : 'done');
            labels[1].classList.add(state === 'stage1' ? 'active' : 'done');
        }
        if (state === 'stage2' || state === 'done') {
            dots[2].classList.add(state === 'stage2' ? 'active' : 'done');
            labels[2].classList.add(state === 'stage2' ? 'active' : 'done');
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return { render };
})();
