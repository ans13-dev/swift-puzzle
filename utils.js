import { useState, useEffect } from 'react';

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