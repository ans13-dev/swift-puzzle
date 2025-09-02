import { useState, useEffect } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { app, db } from "./firebase";

let cachedSongs = null
const analytics = getAnalytics(app);

export async function getRandomSong() {
    try {
        if (!cachedSongs) {
            const res = await fetch("https://taylor-swift-api.sarbo.workers.dev/songs")
            cachedSongs = await res.json()
        }
        const randomSongId = Math.floor(Math.random() * cachedSongs.length)
        return cachedSongs[randomSongId]
    } catch (err) {
        if (err.name === "AbortError") {
            console.log("Fetch aborted")
        } else {
            console.error("Fetch error:", err)
        }
    }
}

export function useWindowSize() {
    // 初始化 state，以取得視窗的初始寬高
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        // 定義一個處理視窗大小改變的函式
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        // 在 component mount 時註冊事件監聽器
        window.addEventListener('resize', handleResize);

        // 在 component unmount 時移除事件監聽器
        return () => window.removeEventListener('resize', handleResize);
    }, []); // 空陣列表示只在 component mount/unmount 時執行

    return windowSize;
}

export async function logGameResult({ result, song, album, wrongGuesses, totalGuesses, hint, duration }) {
    try {
        await addDoc(collection(db, "game_sessions"), {
            result,                 // "won" 或 "lost"
            song_name: song,
            album_name: album,
            wrong_guesses: wrongGuesses,
            total_guesses: totalGuesses,
            hint,
            duration,               // 秒數
            created_at: new Date()  // Firestore 會存 timestamp
        })
    } catch (e) {
        console.error("Error adding doc: ", e)
    }
}

export function logGameEvent(eventName, params) {
    logEvent(analytics, eventName, params);
}