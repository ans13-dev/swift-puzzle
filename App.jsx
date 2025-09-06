import { useState, useEffect } from "react"
import { FaSpotify, FaYoutube, FaApple } from "react-icons/fa";
import { clsx } from "clsx"
import { getRandomSong } from "./utils"
import { albumList } from "./albumList"
import Confetti from "react-confetti"
import { useWindowSize, logGameEvent } from "./utils"

export default function GussTheSwift() {
    // Static values
    const qwertyLayout = [
        "qwertyuiop".split(""),
        "asdfghjkl".split(""),
        "zxcvbnm".split("")
    ]
    const abcLayout =
        [
            "abcde".split(""),
            "fghij".split(""),
            "klmno".split(""),
            "pqrst".split(""),
            "uvwxy".split(""),
            "z".split(""),
        ]
    const hitPoints = ["💚", "💛", "💜", "❤️", "💙", "🖤", "🤍"]
    const encouragePhrases = [
        "Look what you just did!",
        "You're so gorgeous!",
        "This is our song.",
        "Crushed it!",
        "Swiftie power!",
        "Legendary.",
        "So iconic.",
        "You nailed it!"
    ]

    // State values
    const [isInitialized, setIsInitialized] = useState(false)
    const [showNewGame, setShowNewGame] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentSong, setCurrentSong] = useState("")
    const [currentAlbum, setCurrentAlbum] = useState("")
    const [currentPhrase, setCurrentPhrase] = useState("");
    const [guessedLetters, setGuessedLetters] = useState([])
    const [gameStartTime, setGameStartTime] = useState(null);
    const { width, height } = useWindowSize()

    // Derived values
    const numGuessesLeft = 7
    const currentSongLetters = new Set(currentSong.toLowerCase().match(/[a-z]/g) || []);
    const wrongGuessCount =
        guessedLetters.filter(letter => !currentSong.toLowerCase().includes(letter)).length
    const isGameWon = isInitialized && [...currentSongLetters].every(letter => guessedLetters.includes(letter));
    const isGameLost = isInitialized && wrongGuessCount >= numGuessesLeft
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentSong.toLowerCase().includes(lastGuessedLetter)



    //初始化
    useEffect(() => {
        const interval = setInterval(() => {
            setShowNewGame(prev => !prev);
        }, 2000);

        loadRandomSong().then(() => setIsInitialized(true));

        return () => clearInterval(interval);
    }, []);


    //鍵盤事件監聽
    useEffect(() => {
        function handleKeyDown(event) {
            if (isGameOver) return;

            if (/^[a-z]$/i.test(event.key)) {
                addGuessedLetter(event.key.toLowerCase());
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isGameOver, addGuessedLetter]);


    //遊戲開始時間管理
    useEffect(() => {
        if (isInitialized && !isGameOver && !gameStartTime) {
            setGameStartTime(Date.now());
        }
    }, [isInitialized, isGameOver, gameStartTime]);


    //遊戲結束紀錄
    useEffect(() => {
        if (isGameOver && gameStartTime) {
            const duration = Math.floor((Date.now() - gameStartTime) / 1000);
            const result = isGameWon ? "won" : "lost";

            logGameEvent("game_end", {
                song: currentSong,
                album: currentAlbum,
                result: result,
                total_attempts: guessedLetters.length,
                wrong_attempts: wrongGuessCount,
                duration_ms: duration,
                hint_used: hovered,
            });

            setGameStartTime(null); // reset
        }
    }, [isGameOver, gameStartTime, isGameWon, currentSong, currentAlbum, guessedLetters, wrongGuessCount, hovered]);


    function isLetter(char) {
        return /^[A-Z]$/i.test(char);
    }

    function getRandomPhrase(phrases) {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        return phrases[randomIndex];
    }

    function handleHover() {
        if (!hovered) {
            setHovered(true);
        }
    }

    function updatePhrase() {
        setCurrentPhrase(getRandomPhrase(encouragePhrases));
    }

    async function loadRandomSong() {
        const song = await getRandomSong()
        const albumObj = albumList.filter(album => album.album_id == song.album_id)
        const [{ title }] = albumObj;
        setCurrentSong(song.title.replace(" (Taylor’s version)", "").replace(/\\/g, ''))
        setCurrentAlbum(title)
    }

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters => {
            if (prevLetters.includes(letter)) return prevLetters;

            const updated = [...prevLetters, letter];
            const isCorrect = currentSong.toLowerCase().includes(letter);

            if (isCorrect) {
                updatePhrase()
            }

            return updated;
        });
    }

    function startNewGame() {
        setGuessedLetters([])
        loadRandomSong()
    }

    const songElements = currentSong.split(" ").map((word, wi) => (
        <span key={wi} className="word-block">
            {word.split("").map((letter, li) => {
                const shouldRevealLetter =
                    isGameLost || guessedLetters.includes(letter.toLowerCase());
                const letterClassName = clsx(
                    isGameLost &&
                    !guessedLetters.includes(letter.toLowerCase()) &&
                    "missed-letter"
                );

                if (isLetter(letter)) {
                    return (
                        <span key={li} className={letterClassName}>
                            {shouldRevealLetter ? letter : ""}
                        </span>
                    );
                } else {
                    return (
                        <span key={li} className="non-letter">
                            {letter}
                        </span>
                    );
                }
            })}
        </span>
    ));
    function GameResult() {
        if (!isGameOver) {
            return (
                hitPoints.map((h, i) => (
                    <span
                        key={i}
                        className={`heart ${i < hitPoints.length - wrongGuessCount ? "alive" : "dead"}`}
                    >
                        {h}
                    </span>
                ))
            );
        }

        const querySpotify = encodeURIComponent(`track:${currentSong} artist:Taylor Swift`);
        const queryYoutube = encodeURIComponent(`${currentSong} Taylor Swift`);
        const queryApple = encodeURIComponent(`${currentSong} Taylor Swift`);

        const spotifyUrl = `https://open.spotify.com/search/${querySpotify}`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${queryYoutube}`;
        const appleMusicUrl = `https://music.apple.com/search?term=${queryApple}`;


        return (
            <div className="result-container">
                <p className="result-text">
                    {isGameWon ? "Let's review this : " : "Never heard it before ? "}{" "}
                </p>
                <div className="icon-links">
                    <a
                        href={spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon spotify"
                    >
                        <FaSpotify />
                    </a>
                    <a
                        href={appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon apple"
                    >
                        <FaApple />
                    </a>
                    <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon youtube"
                    >
                        <FaYoutube />
                    </a>
                </div>
            </div>
        );
    }

    function KeyboardElements() {
        const isMobile = width <= 768
        const renderButton = (letter) => {

            const isGuessed = guessedLetters.includes(letter)
            const isCorrect = isGuessed && currentSong.toLowerCase().includes(letter)
            const isWrong = isGuessed && !currentSong.toLowerCase().includes(letter)

            const className = clsx({
                correct: isCorrect,
                wrong: isWrong
            })

            return (
                <button
                    className={className}
                    key={letter}
                    disabled={isGameOver}
                    aria-disabled={isGuessed}
                    aria-label={`Letter ${letter}`}
                    onClick={() => addGuessedLetter(letter)}
                >
                    {letter.toUpperCase()}
                </button>
            )
        }

        return (
            <div className="keyboard">
                {isMobile
                    ? abcLayout.map((row, i) => (
                        <div key={i} className="keyboard-row">
                            {row.map(renderButton)}
                        </div>
                    ))
                    : qwertyLayout.map((row, i) => (
                        <div key={i} className="keyboard-row">
                            {row.map(renderButton)}
                        </div>
                    ))
                }
            </div>
        )
    }

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <span className="game-result">
                    <h4>
                        {`You have ${numGuessesLeft - wrongGuessCount} chances left`}
                    </h4>
                </span>
            )
        }

        if (isGameWon) {
            return (
                <span className="game-result">
                    <h4 className="flip-text" onClick={startNewGame}>{showNewGame ? "New Game ✨" : "You win ! 🎉"}</h4>
                </span>
            )
        }
        if (isGameLost) {
            return (
                <span className="game-result">
                    <h4 className="flip-text" onClick={startNewGame}>{showNewGame ? "New Game ✨" : "Game over ! ☠️"}</h4>
                </span>
            )
        }

        if (!isGameOver && wrongGuessCount == 0 && guessedLetters == 0) {
            return <span className="game-result">
                <h4>...Ready for It?</h4>
            </span>
        }

        return <span className="game-result">
            <h4>{currentPhrase}</h4>
        </span>
    }




    return (
        <main>
            {isGameWon && <Confetti width={width} height={height} />}
            <header>
                <h1>Guess a Taylor Swift's Song: 7 Tries
                    {wrongGuessCount == 6 ? <div
                        className="tooltip-wrapper"
                        onMouseEnter={handleHover}   // 桌面 hover
                        onTouchStart={handleHover}  // 手機觸控
                    >
                        <span className="tooltip-icon-shine">🎵</span>
                        <div className="tooltip-text">
                            <p>{`Hint: The Song is in the Album "${currentAlbum}"`}</p>
                        </div>
                    </div> : <div className="tooltip-wrapper">
                        <span className="tooltip-icon">🎵</span>
                    </div>}
                </h1>
            </header>

            <section className="lives">
                <GameResult />
            </section>

            <section className="word">
                {songElements}
            </section>


            <section
                aria-live="polite"
                role="status"
                className="game-status"
            >
                {renderGameStatus()}
            </section>

            <section className="keyboard">
                <KeyboardElements />
            </section>
            <footer className="app-footer">
                <p>
                    © 2025 ans13-dev ·
                    <a href="https://github.com/ans13-dev/swift-puzzle" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                </p>
                <p>{`Privacy Policy: This game collects basic gameplay data (results, attempts, and time spent) to improve the game experience. No personal information is collected or shared.`}</p>
            </footer>
        </main >
    )
}
