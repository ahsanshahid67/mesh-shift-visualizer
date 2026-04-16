/**
 * ControlPanel.js — User input controls for p and q, validation, and run button.
 */

const ControlPanel = (() => {
    let onRunCallback = null;

    function init(callback) {
        onRunCallback = callback;
        const pSelect = document.getElementById('p-select');
        const qInput = document.getElementById('q-input');
        const runBtn = document.getElementById('run-btn');
        const qValidation = document.getElementById('q-validation');

        // Populate p dropdown with perfect squares
        [4, 9, 16, 25, 36, 49, 64].forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            const sq = Math.sqrt(val);
            opt.textContent = `${val}  (${sq} × ${sq} mesh)`;
            if (val === 16) opt.selected = true;
            pSelect.appendChild(opt);
        });

        // Update q range when p changes
        pSelect.addEventListener('change', () => {
            const p = parseInt(pSelect.value);
            qInput.max = p - 1;
            qInput.min = 1;
            if (parseInt(qInput.value) >= p) {
                qInput.value = p - 1;
            }
            validateQ();
        });

        qInput.addEventListener('input', validateQ);
        runBtn.addEventListener('click', handleRun);

        // Initialize q range
        qInput.max = parseInt(pSelect.value) - 1;
        qInput.value = 5;
    }

    function validateQ() {
        const p = parseInt(document.getElementById('p-select').value);
        const q = parseInt(document.getElementById('q-input').value);
        const msg = document.getElementById('q-validation');
        const runBtn = document.getElementById('run-btn');

        if (isNaN(q) || q < 1) {
            msg.textContent = 'q must be at least 1';
            runBtn.disabled = true;
            return false;
        }
        if (q >= p) {
            msg.textContent = `q must be less than ${p}`;
            runBtn.disabled = true;
            return false;
        }
        msg.textContent = '';
        runBtn.disabled = false;
        return true;
    }

    async function handleRun() {
        if (!validateQ()) return;

        const p = parseInt(document.getElementById('p-select').value);
        const q = parseInt(document.getElementById('q-input').value);
        const runBtn = document.getElementById('run-btn');

        runBtn.classList.add('loading');
        runBtn.disabled = true;

        try {
            const response = await fetch('/api/shift', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p, q }),
            });

            const data = await response.json();

            if (data.errors) {
                document.getElementById('q-validation').textContent = data.errors.join(' ');
                return;
            }

            if (onRunCallback) onRunCallback(data);
        } catch (err) {
            document.getElementById('q-validation').textContent = 'Network error. Please try again.';
            console.error(err);
        } finally {
            runBtn.classList.remove('loading');
            runBtn.disabled = false;
        }
    }

    return { init };
})();
