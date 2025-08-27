import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { getRandomSong } from "./utils"
import { albumList } from "./albumList"
import Confetti from "react-confetti"
import { useWindowSize } from "./utils"
import ReactGA from 'react-ga4';
const TRACKING_ID = "G-18K7C647SM";


function trackEvent(eventName, params = {}) {
    if (window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...params
        });
    } else {
        console.warn("DataLayer not loaded yet:", eventName, params);
    }
}

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
        "Look what you just did.",
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
    const [currentSong, setCurrentSong] = useState("")
    const [currentAlbum, setCurrentAlbum] = useState("")
    const [guessedLetters, setGuessedLetters] = useState([])
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



    useEffect(() => {
        ReactGA.initialize(TRACKING_ID);
        ReactGA.send({
            hitType: "pageview", page: "/landingpage", title: "Landing Page"
        })
        const interval = setInterval(() => {
            setShowNewGame(prev => !prev);
        }, 2000); // 每2秒切換一次
        loadRandomSong().then(() => setIsInitialized(true))
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        function handleKeyDown(event) {
            if (isGameOver) {
                return;
            }
            if (event.key.match(/^[a-z]$/i)) {
                addGuessedLetter(event.key.toLowerCase());
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isGameOver, addGuessedLetter]);

    function isLetter(char) {
        return /^[A-Z]$/i.test(char);
    }

    function getRandomPhrase(phrases) {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        return phrases[randomIndex];
    }

    async function loadRandomSong() {
        const song = await getRandomSong()
        const albumObj = albumList.filter(album => album.album_id == song.album_id)
        const [{ title }] = albumObj;
        setCurrentSong(song.title.replace(" (Taylor’s version)", "").replace(/\\/g, ''))
        setCurrentAlbum(title)
    }

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    function startNewGame(obj) {
        if (window.dataLayer) {
            window.dataLayer.push(obj)
        } else {
            console.warn("dataLayer not found!", obj)
        }
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
                    <h4 className="flip-text" onClick={
                        () => startNewGame(
                            {
                                event: "game_won",
                                song_name: currentSong,
                                album_name: currentAlbum,
                                wrong_guesses: wrongGuessCount,
                                total_guesses: guessedLetters.length
                            }
                        )}>{showNewGame ? "New Game ✨" : "You win ! 🎉"}</h4>
                </span>
            )
        }
        if (isGameLost) {
            return (
                <span className="game-result">
                    <h4 className="flip-text" onClick={
                        () => startNewGame(
                            {
                                event: "game_lost",
                                song_name: currentSong,
                                album_name: currentAlbum,
                                wrong_guesses: wrongGuessCount,
                                total_guesses: guessedLetters.length
                            }
                        )}>{showNewGame ? "New Game ✨" : "Game over ! ☠️"}</h4>
                </span>
            )
        }

        if (!isGameOver && wrongGuessCount == 0 && guessedLetters == 0) {
            return <span className="game-result">
                <h4>Are you ready for it?</h4>
            </span>
        }

        return <span className="game-result">
            <h4>{getRandomPhrase(encouragePhrases)}</h4>
        </span>
    }

    //Add GA4
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });



    return (
        <main>
            {isGameWon && <Confetti width={width} height={height} />}
            <header>
                <h1>Guess a Taylor Swift's Song: 7 Tries
                    {wrongGuessCount == 6 ? <div className="tooltip-wrapper">
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
                {hitPoints.map((h, i) => (
                    <span
                        key={i}
                        className={`heart ${i < hitPoints.length - wrongGuessCount ? "alive" : "dead"}`}
                    >
                        {h}
                    </span>
                ))}
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
            </footer>
        </main >
    )
}
