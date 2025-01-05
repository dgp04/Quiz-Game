import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2'
import BackgroundVideo from "./BackgroundVideo" 
import GitHubLink from "./GitHubLink";

// Función para eliminar etiquetas HTML
const sanitizeText = (text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || "";
};

export function Quiz(){
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionCount, setQuestionCount] = useState(10);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [loading, setLoading] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [answerStatus, setAnswerStatus] = useState({});
    const [showCorrect, setShowCorrect] = useState({})
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [disableClick, setDisableClick] = useState(false)
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(30)
    const [progress, setProgress] = useState(100); // Progreso de la barra
    const [startTime, setStartTime] = useState(Date.now()); // Inicio de la pregunta
    const [nextQuestion, setNextQuestion] = useState(false)
    const [countdown, setCountdown] = useState(10)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://opentdb.com/api_category.php");
                const data = await response.json();
                setCategories(data.trivia_categories || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (quizStarted && timer > 0 && !disableClick) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
    
            return () => clearInterval(interval); // Asegúrate de limpiar el intervalo
        } else if(quizStarted){
            setDisableClick(true)
            setNextQuestion(true)

            const currentQuestion = questions[currentQuestionIndex];

            setShowCorrect({ [currentQuestion.correctAnswer] : "correct"})
        }
    }, [quizStarted, timer, questions, currentQuestionIndex, disableClick]);  
    
    useEffect(() => {
        if(quizStarted && timer > 0 && !disableClick){
            // Actualización continua del progreso de la barra
            const interval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1002.25; // Segundos transcurridos
                const newProgress = Math.max(100 - (elapsed * 100) / 30, 0); // Progreso restante
                setProgress(newProgress);

                if (elapsed >= 30) {
                    clearInterval(interval);
                }
            }, 10); // Aproximadamente 60 FPS (cada 16ms)

            return () => clearInterval(interval); // Limpiar intervalo al desmontar
        }
    }, [quizStarted, startTime, timer, disableClick]);

    function showInfo(){
        Swal.fire({
            title: 'Information',
            text: 'Actually we are having some problems with the translation API, so the questions are temporary only available in English. We are working to fix it as soon as possible.',
            showIcon: 'false',
            confirmButtonText: 'Cerrar'
        })
    }

    const translateText = async (text, sourceLanguage, targetLanguage) => {
        if (sourceLanguage === targetLanguage) {
            console.error("Error: The source and target languages must be different.");
            return text; // No traducir si los idiomas son iguales
        }
    
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`);
    
            if (!response.ok) {
                console.error("Translation API error", response.status);
                return text; // Devuelve el texto original si la API falla
            }
    
            const data = await response.json();
            return data.responseData.translatedText || text; // Devuelve la traducción si está disponible
        } catch (error) {
            console.error("Error translating text:", error);
            return text; // Devuelve el texto original si ocurre un error
        }
    };
    
    const startQuiz = async () => {
        setLoading(true);
        setTimer(30);
        setStartTime(Date.now());
        try {
            const url = selectedCategory === "" ? `https://opentdb.com/api.php?amount=${questionCount}` : `https://opentdb.com/api.php?amount=${questionCount}&category=${selectedCategory}`;
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.response_code === 0) {
                const translatedQuestions = await Promise.all(
                    data.results.map(async (question) => {
                        if (selectedLanguage === "en") {
                            // Si el idioma seleccionado es inglés, no traducimos nada.
                            const shuffledOptions = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
                            return {
                                questionDifficulty: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1),
                                questionCategory: question.category,
                                questionText: sanitizeText(question.question),
                                shuffledOptions,
                                correctAnswer: question.correct_answer,
                            };
                        }
    
                        // Lógica de traducción para otros idiomas
                        const translatedQuestion = await translateText(
                            sanitizeText(question.question),
                            "en", // Idioma fuente
                            selectedLanguage // Idioma de destino
                        );
                        const translatedOptions = await Promise.all(
                            question.incorrect_answers.concat(question.correct_answer).map((answer) =>
                                translateText(sanitizeText(answer), "en", selectedLanguage)
                            )
                        );
    
                        const shuffledOptions = [...translatedOptions].sort(() => Math.random() - 0.5);
    
                        return {
                            questionDifficulty: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1),
                            questionCategory: question.category,
                            questionText: translatedQuestion,
                            shuffledOptions,
                            correctAnswer: translatedOptions[translatedOptions.length - 1],
                        };
                    })
                );
    
                setQuestions(translatedQuestions);
                setShuffledQuestions(translatedQuestions);
                setQuizStarted(true);
            }
        } catch (error) {
            console.error("Error fetching or translating questions:", error);
        } finally {
            setLoading(false);
        }
    };    

    const handleSelectedAnswer = (selectedAnswer) => {
        if(disableClick) return;
    
        const currentQuestion = questions[currentQuestionIndex];
        
        setDisableClick(true);
        
        // Normalizamos las respuestas (eliminamos espacios y convertimos a minúsculas)
        const normalizedSelectedAnswer = selectedAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
        
        // Marca la respuesta seleccionada como correcta o incorrecta
        const updatedAnswerStatus = { ...answerStatus, [selectedAnswer]: "incorrect" };
        if (normalizedSelectedAnswer === normalizedCorrectAnswer) {
            setScore(score + 1)
            updatedAnswerStatus[selectedAnswer] = "correct";
        }
    
        setAnswerStatus(updatedAnswerStatus);
    
        // Almacena la respuesta correcta para resaltarla en verde si es incorrecta
        if (normalizedSelectedAnswer !== normalizedCorrectAnswer) {
            setShowCorrect({ [currentQuestion.correctAnswer]: "correct" });
        }
        
        setNextQuestion(true)
    };    

    const handleNextQuestion = () => {
        setNextQuestion(false)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowCorrect({});
        setAnswerStatus({});
        setDisableClick(false);
        setCountdown(10)
        if(currentQuestion){
            setTimer(30)
            setStartTime(Date.now())
        }
    }
    
    const loadMainMenu = () => {
        setCurrentQuestionIndex(0);
        setShowCorrect({});
        setAnswerStatus({});
        setDisableClick(false);
        setQuizStarted(false);
        setQuestions([])
        setSelectedCategory("")
        setSelectedLanguage("en")
        setQuestionCount(10)
        setShuffledQuestions([])
        setScore(0)
        setTimer(30)
        setCountdown(10)
    }

    if (loading) return (
        <div className="loading-wave">
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
        </div>
    );

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    if (!quizStarted) {
        return (
            <BackgroundVideo category={"default"}>
                <div className="quiz-config">
                    <div className="quiz-header">
                        <button onClick={showInfo} id="info-button"><img src="./images/information.png" alt="Info icon" width="25px" /></button>
                        <h1>{t('quiz.title')}</h1>
                    </div>

                    <h2>{t('quiz.setup')}</h2>

                    <label htmlFor="language-select">{t('quiz.selectLanguage')}</label><br />
                    <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => {
                            setSelectedLanguage(e.target.value);
                            i18n.changeLanguage(e.target.value);
                        }}>
                        <option value="es">Spanish</option>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>

                    <br /><br />

                    <label htmlFor="category-select">{t('quiz.selectCategory')}</label><br />
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">{t('quiz.anyCategory')}</option>
                        {
                            categories.map((category) => {
                                return <option
                                    key={category.id}
                                    value={category.id}>{category.name}</option>
                            })
                        }
                    </select>

                    <br /><br />

                    <label htmlFor="question-count">{t('quiz.numberOfQuestions')}</label><br />
                    <input
                        type="number"
                        id="question-count"
                        min="1"
                        max="50"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(e.target.value)} />

                    <br /><br />

                    <button onClick={startQuiz}>{t('quiz.startQuiz')}</button>
                    <div className="github-link">
                        <a href="https://github.com/dgp04/Quiz-Game" target="_blank" id="link">
                            <GitHubLink/>
                        </a>
                    </div>
                </div>
            </BackgroundVideo>
        );
    }else {
        if (!currentQuestion) {  
            if(countdown > 0){
                setTimeout(() => {
                    setCountdown(countdown - 1)
                }, 1000)
            }else {
                loadMainMenu()
            }
            
            return (
                <BackgroundVideo category={"default"}>
                    <div className="end">
                        {t('quiz.endOfQuiz')} {score} / {questionCount}
                        <p>{t('quiz.returningToMenuIn')} {countdown} {t('quiz.seconds')}</p>
                        <button onClick={loadMainMenu}>{t('quiz.mainMenu')}</button>
                    </div>
                </BackgroundVideo>
            );
        }
        
        const categoryColors = {
            science: "green", // Color amarillo para ciencia
            history: "yellow",  // Color rojo para historia
            geography: "blue", // Color azul para geografía
            sports: "orange",  // Color verde para deportes
            entertainment: "pink",
            art: "red", 
            politics: "yellow",
            knowledge: "black",
            celebrities: "pink",
            mythology: "yellow",
            animals: "green",
            vehicles: "black"
        };

        const getCategoryColor = (category) => {
            const currentCategory = category.toLowerCase()

            if (currentCategory.includes('entertainment')) {
                return categoryColors['entertainment']; // Asigna un color común a todas las categorías de entretenimiento
            }

            if(currentCategory.includes("science")){
                return categoryColors["science"]
            }
            return categoryColors[currentCategory] || 'grey'; // Si no es entretenimiento, usa el color de la categoría o blanco por defecto
        }

        return (
            <BackgroundVideo category={currentQuestion.questionCategory}>
                <div className="quiz-game-container">
                    <div className="quiz-game">
                        {
                            questions.length > 0 ? (
                                <div>
                                    <div className="question-info" style={{backgroundColor: getCategoryColor(currentQuestion.questionCategory)}}>
                                        <h2 className="question-category">{sanitizeText(currentQuestion.questionCategory)}</h2>
                                        <h2>{currentQuestionIndex + 1} / {questions.length}</h2>
                                    </div>
                                    <div className="question-container">
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" 
                                                style={{
                                                    width: `${progress}%`
                                                }}>
                                            </div>
                                        </div>
                                        <h2>{currentQuestion.questionText}</h2>
                                    </div>
                                    <div className="answers">
                                    {currentQuestion.shuffledOptions.map((option, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleSelectedAnswer(option)} 
                                            style={{
                                                backgroundColor: 
                                                    answerStatus[option] === "correct" ? "green" : 
                                                    answerStatus[option] === "incorrect" ? "red" : 
                                                    showCorrect[option] === "correct" ? "green" : "white",
                                                color:
                                                    answerStatus[option] === "correct" || 
                                                    answerStatus[option] === "incorrect" ? "white" : 
                                                    showCorrect[option] === "correct" ? "white"
                                                    : "black"
                                            }} 
                                            className={showCorrect[option] === "correct" ? "correct" : ""}>
                                            {option}
                                        </button>
                                    ))}
                                    </div>  
                                    <div className="question-buttons">
                                        <button onClick={loadMainMenu}>{t("quiz.backToMenu")}</button>
                                        {
                                            nextQuestion ? (<button onClick={handleNextQuestion}>{currentQuestionIndex+1 === questions.length ? t("quiz.endQuiz") : t("quiz.nextQuestion")}</button>) : (<input type="hidden"/>)
                                        }
                                    </div>
                                </div>
                            ) : (
                                <p>{t('quiz.noQuestionsFound')}</p>
                            )
                        }
                    </div>
                </div>
            </BackgroundVideo>
        );
    }
}