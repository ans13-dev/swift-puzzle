import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { getRandomSong } from "./utils"
import { albumList } from "./albumList"
import Confetti from "react-confetti"
import { useWindowSize } from "./utils"

export default function GussTheSwift() {
    // State values
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
    const [isInitialized, setIsInitialized] = useState(false)
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

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    useEffect(() => {
        loadRandomSong().then(() => setIsInitialized(true))
    }, [])

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

    const keyboardElements = alphabet.split("").map(letter => {
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
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <span className="game-result">
                    <h3>
                        {`You have ${numGuessesLeft - wrongGuessCount} chances left`}
                    </h3>
                </span>
            )
        }

        if (isGameWon) {
            return (
                <span className="game-result">
                    <h3>You win ! 🎉</h3>
                    <button
                        className="new-game"
                        onClick={startNewGame}
                    >
                        New Game
                    </button>
                </span>
            )
        }
        if (isGameLost) {
            return (
                <span className="game-result">
                    <h3>Game over ! ☠️</h3>
                    <button
                        className="new-game"
                        onClick={startNewGame}
                    >
                        New Game
                    </button>
                </span>
            )
        }

        if (!isGameOver && wrongGuessCount == 0 && guessedLetters == 0) {
            return <span className="game-result">
                <h3>Are you ready for it?</h3>
            </span>
        }

        return <span className="game-result">
            <h3>{getRandomPhrase(encouragePhrases)}</h3>
        </span>
    }

    return (
        <main>
            {isGameWon && <Confetti width={width} height={height} />}
            <header>
                <h1>Guess a Taylor Swift's Song: 7 Tries</h1>
                {wrongGuessCount == 6 ? <div className="tooltip-wrapper">
                    <span className="tooltip-icon-shine">🎵</span>
                    <div className="tooltip-text">
                        {`Hint: The Song is in the Album "${currentAlbum}".`}
                    </div>
                </div> : <div className="tooltip-wrapper">
                    <span className="tooltip-icon">🎵</span>
                </div>}
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
                {keyboardElements}
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
