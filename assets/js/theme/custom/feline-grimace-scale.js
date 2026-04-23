import PageManager from '../page-manager';

// ── Data ─────────────────────────────────────────────────────────────

const units = [
    {
        id: 'ears',
        label: 'Ear Position',
        options: [
            {
                score: 0,
                label: 'Ears facing forward',
                sublabel: 'Absent',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-a-ear-position-0.jpg?t=1771863537" alt="Ear position - absent" loading="lazy">',
            },
            {
                score: 1,
                label: 'Ears slightly pulled apart',
                sublabel: 'Moderately present or uncertain',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-a-ear-position-1.jpg?t=1771863537" alt="Ear position - moderately present" loading="lazy">',
            },
            {
                score: 2,
                label: 'Ears rotated outwards',
                sublabel: 'Markedly present',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-a-ear-position-2.jpg?t=1771863538" alt="Ear position - markedly present" loading="lazy">',
            },
        ],
    },
    {
        id: 'eyes',
        label: 'Orbital Tightening',
        options: [
            {
                score: 0,
                label: 'Eyes opened',
                sublabel: 'Absent',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-b-orbital-tightening-0.jpg?t=1771863539" alt="Orbital tightening - absent" loading="lazy">',
            },
            {
                score: 1,
                label: 'Partially closed eyes',
                sublabel: 'Moderately present or uncertain',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-b-orbital-tightening-1.jpg?t=1771863539" alt="Orbital tightening - moderately present" loading="lazy">',
            },
            {
                score: 2,
                label: 'Squinted eyes',
                sublabel: 'Markedly present',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-b-orbital-tightening-2.jpg?t=1771863540" alt="Orbital tightening - markedly present" loading="lazy">',
            },
        ],
    },
    {
        id: 'muzzle',
        label: 'Muzzle Tension',
        options: [
            {
                score: 0,
                label: 'Relaxed (round shape)',
                sublabel: 'Absent',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-c-muzzle-tension-0.jpg?t=1771863541" alt="Muzzle tension - absent" loading="lazy">',
            },
            {
                score: 1,
                label: 'Mild tension',
                sublabel: 'Moderately present or uncertain',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-c-muzzle-tension-1.jpg?t=1771863542" alt="Muzzle tension - moderately present" loading="lazy">',
            },
            {
                score: 2,
                label: 'Tense (elliptical shape)',
                sublabel: 'Markedly present',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-c-muzzle-tension-2.jpg?t=1771863542" alt="Muzzle tension - markedly present" loading="lazy">',
            },
        ],
    },
    {
        id: 'whiskers',
        label: 'Whiskers Change',
        options: [
            {
                score: 0,
                label: 'Loose and curved',
                sublabel: 'Absent',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-d-whiskers-change-0.jpg?t=1771863543" alt="Whiskers change - absent" loading="lazy">',
            },
            {
                score: 1,
                label: 'Slightly curved or straight (closer together)',
                sublabel: 'Moderately present or uncertain',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-d-whiskers-change-1.jpg?t=1771863544" alt="Whiskers change - moderately present" loading="lazy">',
            },
            {
                score: 2,
                label: 'Straight and moving forward',
                sublabel: 'Markedly present',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-d-whiskers-change-2.jpg?t=1771863545" alt="Whiskers change - markedly present" loading="lazy">',
            },
        ],
    },
    {
        id: 'head',
        label: 'Head Position',
        options: [
            {
                score: 0,
                label: 'Head above the shoulder line',
                sublabel: 'Absent',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-e-head-position-0.jpg?t=1771863545" alt="Head position - absent" loading="lazy">',
            },
            {
                score: 1,
                label: 'Head aligned with the shoulder line',
                sublabel: 'Moderately present or uncertain',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-e-head-position-1.jpg?t=1771863546" alt="Head position - moderately present" loading="lazy">',
            },
            {
                score: 2,
                label: 'Head below the shoulder line or tilted down',
                sublabel: 'Markedly present',
                img: '<img src="https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/-e-head-position-2.jpg?t=1771863547" alt="Head position - markedly present" loading="lazy">',
            },
        ],
    },
];

const unitIds = ['ears', 'eyes', 'muzzle', 'whiskers', 'head'];

// ── Helpers ───────────────────────────────────────────────────────────

function getColorClass(total) {
    if (total === 0) return 'color-0';
    if (total <= 3) return 'color-mild';
    if (total <= 8) return 'color-pain';
    return 'color-severe';
}

function getBadgeClass(total) {
    if (total === 0) return 'badge-0';
    if (total <= 3) return 'badge-mild';
    if (total <= 8) return 'badge-pain';
    return 'badge-severe';
}

function getBadgeLabel(total) {
    if (total === 0) return 'No Pain';
    if (total <= 3) return 'Mild / No Pain';
    if (total <= 8) return 'Likely In Pain';
    return 'Severe Pain';
}

function getInterpText(total) {
    if (total === 0)
        return 'This cat is not in pain. If you are a cat owner and are concerned, please consult your veterinary surgeon.';
    if (total <= 3)
        return 'This cat is not in pain or has mild pain. Pain should be re-evaluated at regular intervals since FGS scores could increase, and the cat might require analgesics.';
    if (total <= 8)
        return 'This cat is likely to be in pain. This score indicates the need for additional analgesia. This decision should be made by a veterinary surgeon based on clinical judgement. If in doubt, reassess in 10–15 minutes. Clinical judgement will differentiate if the FGS scores are high due to pain, rather than other factors such as stress, fear or sedation.';
    return 'This cat is likely to be in severe pain. This score indicates the need for additional analgesia. This decision should be made by a veterinary surgeon. If in doubt, reassess in 10–15 minutes. Clinical judgement will differentiate if the FGS scores are high due to pain, rather than other factors such as stress, fear or sedation.';
}

// ── Page Class ────────────────────────────────────────────────────────

export default class FelineGrimaceScale extends PageManager {
    onReady() {
        this.scores = {
            ears: null,
            eyes: null,
            muzzle: null,
            whiskers: null,
            head: null,
        };
        this.buildUI();
        this.updateScorePanel();
    }

    getTotal() {
        return unitIds.reduce((sum, id) => sum + (this.scores[id] ?? 0), 0);
    }

    updateScorePanel() {
        const total = this.getTotal();
        const colorClass = getColorClass(total);

        const totalEl = document.getElementById('total-display');
        totalEl.textContent = total;
        totalEl.className = `total-number ${colorClass}`;
        totalEl.classList.add('pop-animate');
        totalEl.addEventListener(
            'animationend',
            () => totalEl.classList.remove('pop-animate'),
            { once: true },
        );

        const badge = document.getElementById('interp-badge');
        badge.className = `interp-badge ${getBadgeClass(total)}`;
        badge.textContent = getBadgeLabel(total);

        document.getElementById('interp-text').textContent =
            getInterpText(total);

        const fill = document.getElementById('progress-fill');
        fill.style.width = `${(total / 10) * 100}%`;
        fill.className = `progress-fill ${colorClass}`;

        unitIds.forEach((id) => {
            const el = document.getElementById(`score-val-${id}`);
            if (el) {
                el.textContent =
                    this.scores[id] !== null ? this.scores[id] : '—';
                el.style.color =
                    this.scores[id] !== null ? '#546153' : '#687d6a';
            }
        });

        unitIds.forEach((id) => {
            const unitBadge = document.getElementById(`unit-badge-${id}`);
            if (unitBadge) {
                if (this.scores[id] !== null) {
                    unitBadge.textContent = `Score: ${this.scores[id]}`;
                    unitBadge.classList.add('selected');
                } else {
                    unitBadge.textContent = 'Not scored';
                    unitBadge.classList.remove('selected');
                }
            }
        });
    }

    buildUI() {
        const container = document.getElementById('units-container');
        const breakdown = document.getElementById('score-breakdown');

        if (!container || !breakdown) return;

        const labels = ['Ears', 'Eyes', 'Muzzle', 'Whiskers', 'Head'];
        unitIds.forEach((id, i) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.innerHTML = /* html */ `<div class="score-item-label">${labels[i]}</div><div class="score-item-value" id="score-val-${id}">—</div>`;
            breakdown.appendChild(item);
        });

        units.forEach((unit) => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            card.innerHTML = /* html */ `
                <div class="unit-header">
                    <h2>${unit.label}</h2>
                    <span class="unit-score-badge" id="unit-badge-${unit.id}">Not scored</span>
                </div>
                <div class="options-row" role="group" aria-label="${unit.label}">
                    ${unit.options
                        .map(
                            (opt) => /* html */ `
                        <button class="option-btn" data-unit="${unit.id}" data-score="${opt.score}" aria-pressed="false">
                            <div class="score-pill">${opt.score}</div>
                            <div class="cat-illustration">${opt.img}</div>
                            <div class="option-label">${opt.label}</div>
                            <div class="option-sublabel">${opt.sublabel}</div>
                        </button>
                    `,
                        )
                        .join('')}
                </div>
            `;
            container.appendChild(card);
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.option-btn');
            if (!btn) return;
            const unitId = btn.dataset.unit;
            const score = parseInt(btn.dataset.score, 10);

            const siblings = btn
                .closest('.options-row')
                .querySelectorAll('.option-btn');
            siblings.forEach((s) => {
                s.classList.remove('selected');
                s.setAttribute('aria-pressed', 'false');
            });

            btn.classList.add('selected');
            btn.setAttribute('aria-pressed', 'true');
            this.scores[unitId] = score;

            this.updateScorePanel();
        });
    }
}
