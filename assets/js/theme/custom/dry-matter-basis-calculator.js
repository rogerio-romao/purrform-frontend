import PageManager from '../page-manager';

export default class DryMatterBasisCalculator extends PageManager {
    onReady() {
        this.proteinInput = document.getElementById('dmb-protein-input');
        this.moistureInput = document.getElementById('dmb-moisture-input');
        this.calcBtn = document.getElementById('dmb-calc-btn');
        this.resultEl = document.querySelector('.dmb-result');
        if (!this.calcBtn) return;
        this.calcBtn.addEventListener('click', () => this.calculate());
    }

    calculate() {
        const protein = parseFloat(this.proteinInput.value);
        const moisture = parseFloat(this.moistureInput.value);

        if (Number.isNaN(protein) || Number.isNaN(moisture) || moisture >= 100 || moisture < 0 || protein < 0) {
            this.resultEl.hidden = true;
            return;
        }

        const dry = 100 - moisture;
        const dmb = ((protein / dry) * 100).toFixed(2);
        this.render({ protein, moisture, dry, dmb });
    }

    render({ protein, moisture, dry, dmb }) {
        this.resultEl.hidden = false;
        this.resultEl.innerHTML = '';

        const rows = [
            `% Protein = ${protein}`,
            `% Moisture = ${moisture} (dry portion = ${dry}%)`,
            `DMB = ${dmb}%`,
        ];

        const heading = document.createElement('h3');
        heading.textContent = 'Dry Matter Basis';
        this.resultEl.appendChild(heading);

        rows.forEach((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            this.resultEl.appendChild(p);
        });
    }
}
