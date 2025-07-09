import { words } from "./words"

export function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length)
    return words[randomIndex]
}

export async function getRandomSong() {
    try {
        const res = await fetch("https://taylor-swift-api.sarbo.workers.dev/songs");
        const data = await res.json();
        const randomSongId = Math.floor(Math.random() * data.length);
        return data[randomSongId]
    }
    catch (err) {
        if (err.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", err);
        }
    }
}
