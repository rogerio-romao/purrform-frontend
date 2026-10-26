// ── purrform-apps backend ────────────────────────────────────────────

// `stencil start` builds with webpack.dev.js (NODE_ENV=development) → local backend.
export const PURRFORM_API_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:5555'
        : 'https://purrform-apps-027e.onrender.com';

// ── Videos ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} Video
 * @property {number} id
 * @property {string} created_at        ISO 8601 timestamp
 * @property {string} youtube_id
 * @property {string|null} source_url   original YouTube URL (may include tracking params)
 * @property {string|null} title        our custom title (wins over youtube_title)
 * @property {string|null} description
 * @property {string|null} youtube_title
 * @property {string|null} youtube_channel
 * @property {string|null} category
 */

/** @typedef {Video[]} VideosResponse */

/**
 * GET /videos — already sorted newest first by the backend.
 * Errors come back as plain text, so read the body as text before throwing.
 * @returns {Promise<VideosResponse>}
 */
export function fetchVideos() {
    return fetch(`${PURRFORM_API_URL}/videos`).then((response) => {
        if (!response.ok) {
            return response.text().then((text) => {
                throw new Error(
                    text || `Error fetching videos (${response.status})`,
                );
            });
        }
        return response.json();
    });
}

/** @param {Video} video */
export function getVideoTitle(video) {
    return video.title ?? video.youtube_title ?? 'Untitled video';
}

/** @param {string} youtubeId */
export function getVideoThumbnailUrl(youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** @param {string} youtubeId */
export function getVideoEmbedUrl(youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
}
