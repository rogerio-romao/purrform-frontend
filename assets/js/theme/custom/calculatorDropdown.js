export default function () {
    $(() => {
        const togglerActive = document.getElementById('toggler-active');
        if (togglerActive) {
            togglerActive.addEventListener('click', () => {
                document
                    .getElementById('toggler-dropdown')
                    .classList.toggle('active');
                document
                    .getElementById('toggler-dropdown-chevron')
                    .classList.toggle('open');
            });
        }
    });
}
