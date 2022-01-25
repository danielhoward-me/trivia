const $ = (id) => document.getElementById(id);
const questions = $('questions');
const scoreEl = $('scoreNumber');
const streakEl = $('streakNumber');
const highScoreEl = $('highScoreNumber');
if (!localStorage.highScore) localStorage.highScore = 0;
highScoreEl.innerHTML = localStorage.highScore;
let jokeIds = 0;
let score = 0;
let streak = 0;
const ques = [];

class JokeCard {
    constructor() {
        this.id = jokeIds++;
        this.clicked = false;
        this.start(true);
        this.run();
    }
    start(first) {
        const add = (text) => first ? questions.innerHTML += text : $(`q${this.id}`).innerHTML = text;
        add(`
            <div id="q${this.id}">
                <div id="questionCard${this.id}" class="card" style="height: 0%;">
                    <div id="question${this.id}" style="margin-left: 50%; transform: translateX(-50%);"><img class="loading-img" src="/static/img/loading.gif"/></div>
                    <div class="options" class="buttonContainer" id="options${this.id}"></div>
                    <small class="subtext" style="color: lightgrey;" id="sub${this.id}"></small>
                </div>
            </div>
        `);
        this.questionCard = $(`questionCard${this.id}`);
        this.questionCard.style.height = '100%';
        this.question = $(`question${this.id}`);
        this.options = $(`options${this.id}`);
        this.subText = $(`sub${this.id}`);
    }
    async run() {
        const fetchedQuestion = await fetchQuestion()
        .catch((err) => {
            this.questionCard.style.color = 'red';
            this.question.innerHTML = `There has been an Error!`;
            this.options.innerHTML = '<button onclick="newQuestion(this)">Try Again</button>';
            this.subText.innerHTML = err.stack;
            this.error = true;
            this.question.scrollIntoView();
        });
        if (this.error) return;
    
        let optionsArray = [];
        if (fetchedQuestion.type == 'multiple') {
            this.ranQ = Math.round(Math.random() * 3);
            let currentAnswer = 0;
            optionsArray[this.ranQ] = answerButton(fetchedQuestion.correct_answer, `${this.id}${this.ranQ}Button`, this.id, this.ranQ);
            for (let i = 0; i <= 3; i++) {
                if (!optionsArray[i]) optionsArray[i] = answerButton(fetchedQuestion.incorrect_answers[currentAnswer++], `${this.id}${i}Button`, this.id, i, true);
            }
        } else {
            this.ranQ = fetchedQuestion.correct_answer == "True" ? 0 : 1;
            optionsArray[0] = answerButton(`True`, `${this.id}0Button`, this.id, 0);
            optionsArray[1] = answerButton(`False`, `${this.id}1Button`, this.id, 1);
        };
    
        this.question.innerHTML = fetchedQuestion.question;
        this.options.innerHTML = optionsArray.join('');
        this.subText.innerHTML = `Category: ${fetchedQuestion.category}, Difficulty: ${fetchedQuestion.difficulty}`;
        this.question.scrollIntoView();
    }
    checkAnswer(id) {
        if (this.clicked) return;
        this.clicked = true;
        score++;
        streak++;
        if (id !== this.ranQ) {
            score--;
            streak = 0;
            $(`${this.id}${id}Button`).classList.add('wrong');
        }
        if (streak !== 0 && streak % 3 === 0) {
            lowerConfetti();
        }
        if (score > localStorage.highScore) {
            localStorage.highScore = score;
            highScoreEl.innerHTML = score;
        }
        $(`${this.id}${this.ranQ}Button`).classList.add('correct');
        scoreEl.innerHTML = score;
        streakEl.innerHTML = streak;
        newQuestion();
        // ['0', '1', '2', '3'].forEach((num) => {
        //     $(`${this.id}${num}Button`)?.setAttribute('disabled', 'true');
        // });
    }
    reRun() {
        this.start();
        this.run();
    }
}

let url = 'https://opentdb.com/api.php?amount=1';
async function fetchQuestion() {
    let json;
    try {
        json = await (await fetch(url)).json();
    } catch(err) {
        console.error(err);
        throw new Error(err);
    };
    if (json.response_code != 0) throw new Error('Error after fetch');

    return json.results[0];
};

function answerButton(text, id, questionID, answerID) {
    return `<button id="${id}" onclick="ques[${questionID}].checkAnswer(${answerID})"><span>${text}</span></button>`;
};

function newQuestion(element) {
    if (element) element.setAttribute('disabled', 'true');
    ques.push(new JokeCard());
}

function lowerConfetti() {
    $('confetti').style.top = '0vh';
}

newQuestion();

(async () => {
    const categories = $('categories')
    const difficulties = $('difficulties');
    const form = $('settingsForm');
    const json = await (await fetch('https://opentdb.com/api_category.php')).json();
    categories.innerHTML += `<option>Any</option>`;
    json.trivia_categories.forEach((category) => {
        categories.innerHTML += `<option value="${category.name}">${category.name}</option>`;
    });
    (['Any', 'Easy', 'Medium', 'Hard']).forEach((difficulty) => {
        difficulties.innerHTML += `<option value="${difficulty.toLocaleLowerCase()}">${difficulty}</option>`;
    });
    form.addEventListener('submit', () => {
        url = 'https://opentdb.com/api.php?amount=1';
        const category = categories.selectedIndex;
        const difficulty = difficulties.selectedIndex;
        if (category === 0 && difficulty === 0) {
            url += '';
        } else if (category === 0 && difficulty !== 0) {
            url += `&difficulty=${difficulties.options[difficulty].value}`;
        } else if (category !== 0 && difficulty === 0) {
            json.trivia_categories.forEach((categoryLoop) => {
                if (categories.options[category].value === categoryLoop.name) {
                    url += `&category=${categoryLoop.id}`;
                };
            });
        } else if (category !== 0 && difficulty !== 0) {
            url += `&difficulty=${difficulties.options[difficulty].value}`;
            json.trivia_categories.forEach((categoryLoop) => {
                if (categories.options[category].value === categoryLoop.name) {
                    url += `&category=${categoryLoop.id}`;
                };
            });
        };
        ques[ques.length - 1].reRun();
    });
    $('catLoadImg').style.display = 'none';
    form.style.width = 'auto';
    form.style.height = 'auto';
    $('options').style.display = 'block';
})();
