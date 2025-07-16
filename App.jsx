import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { getRandomSong } from "./utils"
import { albumList } from "./albumList"
import Confetti from "react-confetti"


export default function GussTheSwift() {
    // State values
    useEffect(() => {
        loadRandomSong()
    }, [])
    const [currentSong, setCurrentSong] = useState("")
    const [currentAlbum, setCurrentAlbum] = useState("")
    const [guessedLetters, setGuessedLetters] = useState([])
    const hitPoints = ["💚", "💛", "💜", "❤️", "💙", "🖤", "💖", "🤍"]

    // Derived values
    const numGuessesLeft = 8
    const wrongGuessCount =
        guessedLetters.filter(letter => !currentSong.toLowerCase().includes(letter)).length
    const isGameWon =
        currentSong.toLowerCase().split("").filter(char => /^[a-zA-Z]$/.test(char)).every(letter => guessedLetters.includes(letter))
    const isGameLost = wrongGuessCount >= numGuessesLeft
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentSong.toLowerCase().includes(lastGuessedLetter)

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function isLetter(char) {
        return /^[A-Z]$/i.test(char);
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

    const hitPointsElements = hitPoints.map((hp, index) => {
        const isLanguageLost = index < wrongGuessCount
        const className = clsx("chip", isLanguageLost && "lost")
        return (
            <span
                className={className}
                key={hp}
            >
                {hp}
            </span>
        )
    })

    const songElements = currentSong.split("").map(
        (letter, index) => {
            const shouldRevealLetter = isGameLost || guessedLetters.includes(letter.toLowerCase())
            const letterClassName = clsx(
                isGameLost && !guessedLetters.includes(letter.toLowerCase()) && "missed-letter"
            )
            if (isLetter(letter)) {
                return (
                    <span key={index} className={letterClassName}>
                        {shouldRevealLetter ? letter : ""}
                    </span>
                )
            } else {
                if (letter == " ") {
                    return (
                        <span key={index} className="space-letter">
                            {letter}
                        </span>
                    )
                }
                else {
                    return (
                        <span key={index} className="non-letter">
                            {letter}
                        </span>
                    )
                }
            }

        }
    )

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

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {`You have ${numGuessesLeft - wrongGuessCount} chances left`}
                    {wrongGuessCount == 7 ? <div class="tooltip-wrapper">
                        <span class="tooltip-icon">💡</span>
                        <div class="tooltip-text">
                            {`Hint: The Song is in the Album "${currentAlbum}".`}
                        </div>
                    </div> : null}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <span>
                    <h2>You win ! 🎉</h2>
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
                <span>
                    <h2>Game over ! ☠️</h2>
                    <button
                        className="new-game"
                        onClick={startNewGame}
                    >
                        New Game
                    </button>
                </span>
            )
        }

        return null
    }

    return (
        <main>
            {isGameWon && <Confetti />}
            <header>
                <h1>Guess the Swift 🎵</h1>
                <p>Guess a Taylor Swift song in 8 attempts</p>
                <section className="life-chips">{hitPointsElements}</section>
            </header>

            <section className="word">
                {songElements}
            </section>


            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>
        </main>
    )
}
