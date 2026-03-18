export default function () {
    $(() => {
        const container = document.getElementById('_product-description');
        if (!container) return;

        const fill = (id, content) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = content;
        };

        if (!container.innerHTML.includes('<!-- pagebreak -->')) {
            fill('tab-description', container.innerHTML);
            fill('tab-mobile-description', container.innerHTML);
            return;
        }

        const breaks = container.innerHTML.trim().split('<!-- pagebreak -->');

        fill('tab-description', breaks[0]);
        fill('tab-mobile-description', breaks[0]);

        fill('tab-composition', breaks[1]);
        fill('tab-instructions', breaks[1]);
        fill('tab-supplements-composition', breaks[1]);
        fill('tab-mobile-composition', breaks[1]);
        fill('tab-mobile-instructions', breaks[1]);
        fill('tab-mobile-supplements-composition', breaks[1]);

        fill('tab-constituents', breaks[2]);
        fill('tab-health-safety', breaks[2]);
        fill('tab-supplements-constituents', breaks[2]);
        fill('tab-mobile-constituents', breaks[2]);
        fill('tab-mobile-health-safety', breaks[2]);
        fill('tab-mobile-supplements-constituents', breaks[2]);

        fill('tab-supplements-instructions', breaks[3]);
        fill('tab-mobile-supplements-instructions', breaks[3]);
    });
}
