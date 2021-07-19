const $ = (id) => document.getElementById(id);
const questions = $('questions');
let jokeIds = 0;
const ques = [];
const letters = [
    'A',
    'B',
    'C',
    'D'
];

class JokeCard {
    constructor() {
        this.id = jokeIds++;
        this.clicked = false;
        this.start(true);
        this.run();
    }
    start(first) {
        const add = (text) => first ? questions.innerHTML += text : document.getElementById(`q${this.id}`).innerHTML = text;
        add(`
            <div id="q${this.id}">
                <div id="questionCard${this.id}" class="card" style="height: 0%;">
                    <div id="question${this.id}" style="margin-left: 50%; transform: translateX(-50%);"><img style="width: 50%; margin-top: 20px;" src="/static/img/loading.gif"/></div>
                    <div class="buttonContainer" id="options${this.id}"></div>
                    <small style="color: lightgrey;" id="sub${this.id}"></small>
                </div>
            </div>
        `);
        document.getElementById(`questionCard${this.id}`).style.height = '100%';
        this.question = $(`question${this.id}`);
        this.options = $(`options${this.id}`);
        this.subText = $(`sub${this.id}`);
    }
    async run() {
        const fetchedQuestion = await fetchQuestion()
        .catch((err) => {
    
        });
    
        let optionsArray = [];
        if (fetchedQuestion.type == 'multiple') {
            this.ranQ = Math.round(Math.random() * 3);
            let currentAnswer = 0;
            optionsArray[this.ranQ] = answerButton(`${letters[this.ranQ]} - ${fetchedQuestion.correct_answer}`, `${this.id}${this.ranQ}Button`, this.id, this.ranQ);
            if (!optionsArray[0]) optionsArray[0] = answerButton(`${letters[0]} - ${fetchedQuestion.incorrect_answers[currentAnswer++]}`, `${this.id}0Button`, this.id, 0);
            if (!optionsArray[1]) optionsArray[1] = answerButton(`${letters[1]} - ${fetchedQuestion.incorrect_answers[currentAnswer++]}`, `${this.id}1Button`, this.id, 1);
            if (!optionsArray[2]) optionsArray[2] = answerButton(`${letters[2]} - ${fetchedQuestion.incorrect_answers[currentAnswer++]}`, `${this.id}2Button`, this.id, 2);
            if (!optionsArray[3]) optionsArray[3] = answerButton(`${letters[3]} - ${fetchedQuestion.incorrect_answers[currentAnswer++]}`, `${this.id}3Button`, this.id, 3);
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
        if (id !== this.ranQ) {
            $(`${this.id}${id}Button`).style.background = 'red';
        };
        $(`${this.id}${this.ranQ}Button`).style.background = 'green';
        ques.push(new JokeCard());
    }
    reRun() {
        this.start();
        this.run();
    }
}

let url = 'https://opentdb.com/api.php?amount=1&encode=base64';
async function fetchQuestion() {
    let json;
    try {
        json = await (await fetch(url)).json();
    } catch(err) {
        throw new Error('Error on fetch');
    };
    if (json.response_code != 0) throw new Error('Error after fetch');

    json.results[0].category = atob(json.results[0].category);
    json.results[0].type = atob(json.results[0].type);
    json.results[0].difficulty = atob(json.results[0].difficulty);
    json.results[0].question = atob(json.results[0].question);
    json.results[0].correct_answer = atob(json.results[0].correct_answer);
    json.results[0].incorrect_answers.forEach((answer, index) => {
        json.results[0].incorrect_answers[index] = atob(answer);
    });

    return json.results[0];
};

function answerButton(text, id, questionID, answerID) {
    return `<button id="${id}" onclick="ques[${questionID}].checkAnswer(${answerID})">${text}</button>`;
};
ques.push(new JokeCard());

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
        url = 'https://opentdb.com/api.php?amount=1&encode=base64';
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
