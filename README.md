# Quiz Application

A fully interactive quiz application built with modern web technologies. This project includes dynamic questions, multilingual support, and an engaging user experience.
Link to the page: https://dgp04-quiz.vercel.app

---

## Table of Contents

1. [Features](#features)  
2. [Technologies Used](#technologies-used)  
3. [Setup and Installation](#setup-and-installation)  
4. [How to Use](#how-to-use)  
5. [API References](#api-references)  
6. [Contributing](#contributing)  
7. [License](#license)  

---

## Features

- **Dynamic Questions**: Fetches real-time questions from an external API for varied quizzes.  
- **Multilingual Interface**: Supports multiple languages using `i18n`.  
- **Engaging Modals**: Utilizes `SweetAlert2` for visually appealing modal dialogs.  
- **Real-time Translation**: Integrates with translation APIs for instant question translations.  
- **Responsive Design**: Optimized for mobile and desktop devices.  
- **State Management**: Handles quiz logic with React state and hooks.  

---

## Technologies Used

- **React**: Frontend library for building the user interface.  
- **i18n**: For internationalization and translation of the UI.  
- **SweetAlert2**: For custom modal dialogs.  
- **Translation API**: Real-time question translation support.  
- **Trivia Questions API**: Fetches dynamic quiz questions.  
- **CSS Modules**: Scoped styling for React components.  
- **Vercel**: Hosting platform for live deployment.  

---

## Setup and Installation

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/quiz-application.git
   
2. Navigate to the project directory:
   ```bash
   cd quiz-application
   
4. Install dependencies:
   ```bash
   npm install

6. Run the development server:
   ```bash
   npm run dev

8. Click the link that npm run dev gives to you

## How to Use
1. Start the Quiz: Click on the "Start Quiz" button to fetch new questions.
2. Answer Questions: Select the correct option for each question before the time runs out. Each question gives you 1 point but we will make in a future that the points that questions give to the user depends on the question difficulty.
3. Translations: Switch languages using the dropdown menu (powered by i18n).
4. View Results: After completing the quiz, view your final score.

## API References
**YOU DON'T NEED AN API KEY TO USE THEM**
1. **Trivia Questions API**:
    - Endpoint: https://opentdb.com/api.php?amount=1&category=[category] (you can get the amount of questions you want and filter by categories)
    - Description: Fetches random trivia questions for the quiz.
    - Response Example:
      ```bash
      {
        "response_code": 0,
        "results": [
          {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Entertainment: Television",
            "question": "How many seasons did the Sci-Fi television show &quot;Stargate Atlantis&quot; have?",
            "correct_answer": "5",
            "incorrect_answers": [
              "10",
              "2",
              "7"
            ]
          }
        ]
      }
2. **Translation API**:
   - Provider: https://api.mymemory.translated.net/get?q=(text you want to transalte)}&langpair=en|(language you want to translate the texto to)
   - Usage: Translates questions into the selected language.
