import PageManager from '../page-manager';
import {
    fetchVideos,
    getVideoEmbedUrl,
    getVideoThumbnailUrl,
    getVideoTitle,
} from './purrform-api';

const MESSAGES = {
    empty: 'No videos yet, check back soon.',
    error: "Sorry, we couldn't load the videos. Please try again later.",
};

// ── Helpers ──────────────────────────────────────────────────────────

function el(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            for (const [dk, dv] of Object.entries(value)) {
                element.dataset[dk] = dv;
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    }
    return element;
}

// ── Page ─────────────────────────────────────────────────────────────

export default class Videos extends PageManager {
    onReady() {
        this.statusEl = document.getElementById('videos-status');
        this.gridEl = document.getElementById('videos-grid');
        this.dialog = document.getElementById('videos-player');
        if (!this.gridEl || !this.dialog) return;

        this.dialogTitleEl = this.dialog.querySelector('.videos-player__title');
        this.frameEl = this.dialog.querySelector('.videos-player__frame');
        this.videosById = new Map();

        this.bindPlayer();

        fetchVideos()
            .then((videos) => this.render(videos))
            .catch(() => this.showStatus(MESSAGES.error));
    }

    // ── Rendering ────────────────────────────────────────────────────

    showStatus(message) {
        this.statusEl.textContent = message;
        this.statusEl.hidden = false;
        this.gridEl.hidden = true;
    }

    render(videos) {
        if (!videos.length) {
            this.showStatus(MESSAGES.empty);
            return;
        }

        // Backend already sorts newest first, keep its order.
        videos.forEach((video) => {
            this.videosById.set(String(video.id), video);
            this.gridEl.appendChild(this.buildCard(video));
        });

        this.statusEl.hidden = true;
        this.gridEl.hidden = false;
    }

    buildCard(video) {
        const meta = el(
            'p',
            { className: 'video-card__meta' },
            video.youtube_channel
                ? el('span', { className: 'video-card__channel' }, video.youtube_channel)
                : null,
            video.category
                ? el('span', { className: 'video-card__category' }, video.category)
                : null,
        );

        return el(
            'li',
            { className: 'videos-grid__item' },
            el(
                'button',
                {
                    type: 'button',
                    className: 'video-card',
                    dataset: { videoId: String(video.id) },
                },
                el(
                    'span',
                    { className: 'video-card__thumb' },
                    el('img', {
                        src: getVideoThumbnailUrl(video.youtube_id),
                        alt: '',
                        width: '480',
                        height: '360',
                        loading: 'lazy',
                        decoding: 'async',
                    }),
                    el('span', { className: 'video-card__play', 'aria-hidden': 'true' }),
                ),
                el(
                    'span',
                    { className: 'video-card__body' },
                    el('span', { className: 'video-card__title' }, getVideoTitle(video)),
                    video.description
                        ? el('span', { className: 'video-card__description' }, video.description)
                        : null,
                    meta.childNodes.length ? meta : null,
                ),
            ),
        );
    }

    // ── Player ───────────────────────────────────────────────────────

    bindPlayer() {
        this.gridEl.addEventListener('click', (event) => {
            const card = event.target.closest('.video-card');
            if (!card) return;
            const video = this.videosById.get(card.dataset.videoId);
            if (video) this.openPlayer(video);
        });

        this.dialog
            .querySelector('.videos-player__close')
            .addEventListener('click', () => this.dialog.close());

        // Removing the iframe is what stops playback.
        this.dialog.addEventListener('close', () => {
            this.frameEl.replaceChildren();
        });

        // Light dismiss fallback for browsers without <dialog closedby> (Safari).
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            this.dialog.addEventListener('click', (event) => {
                if (event.target !== this.dialog) return;
                const rect = this.dialog.getBoundingClientRect();
                const inside =
                    rect.top <= event.clientY &&
                    event.clientY <= rect.bottom &&
                    rect.left <= event.clientX &&
                    event.clientX <= rect.right;
                if (!inside) this.dialog.close();
            });
        }
    }

    openPlayer(video) {
        const title = getVideoTitle(video);
        this.dialogTitleEl.textContent = title;
        this.frameEl.replaceChildren(
            el('iframe', {
                src: getVideoEmbedUrl(video.youtube_id),
                title,
                allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
                allowfullscreen: '',
                referrerpolicy: 'strict-origin-when-cross-origin',
            }),
        );
        this.dialog.showModal();
    }
}
