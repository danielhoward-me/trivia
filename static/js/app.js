const $ = (id) => document.getElementById(id);

const difficultiesMap = ['any', 'easy', 'medium' ,'hard'];

function runHashUpdate() {
	const hash = new URLSearchParams(window.location.hash.replace('#', ''));
	settings.difficulty = hash.get('d') === null ? settings.difficulty : hash.get('d');
	settings.category = hash.get('c') === null ? settings.category : hash.get('c');
	settings.updateUrl();
}

runHashUpdate();
window.addEventListener('hashchange', () => {
	runHashUpdate();
	refreshQuestion();
});

const questions = $('questions');
const scoreEl = $('scoreNumber');
const streakEl = $('streakNumber');
const highScoreEl = $('highScoreNumber');
const confetti = new Confetti('confetti');
localStorage.highScore = highScoreEl.innerHTML = localStorage.highScore || 0;
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
                    <small class="subtext" id="sub${this.id}"></small>
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
            confetti.fall(3000);
        }
        if (score > localStorage.highScore) {
            localStorage.highScore = score;
            highScoreEl.innerHTML = score;
        }
        $(`${this.id}${this.ranQ}Button`).classList.add('correct');
        scoreEl.innerHTML = score;
        streakEl.innerHTML = streak;
        newQuestion();
    }
    reRun() {
        this.start();
        this.run();
    }
}

let errorThrown = false;
let questionQueue = [];
async function fetchQuestion() {
    if (questionQueue[0]) {
        const question = questionQueue[0];
        questionQueue.shift();
        return question;
    }
    let json;
    try {
        json = await (await fetch(settings.triviaUrl)).json();
        if (json.response_code != 0 || !json.results?.length) {
            if (errorThrown) {
                errorThrown = false
                throw new Error('Error after fetch');
            }
            errorThrown = true;
            settings.difficulty = 0;
            settings.category = 0;
            return fetchQuestion();
        }
    
        const question = json.results[0];
        json.results.shift();
        questionQueue = json.results;
        return question;
    } catch(err) {
        console.error(err);
        throw new Error(err);
    };
};

function answerButton(text, id, questionID, answerID) {
    return `<button id="${id}" onclick="ques[${questionID}].checkAnswer(${answerID})"><span>${text}</span></button>`;
};

function newQuestion(element) {
    if (element) element.setAttribute('disabled', 'true');
    ques.push(new JokeCard());
}

function refreshQuestion() {
    questionQueue = [];
	ques[ques.length - 1].reRun();
}

newQuestion();

const colourSchemesElement = $('colourSchemes');
Object.keys(colorSchemes).forEach((key) => {
	colourSchemesElement.innerHTML += `<option ${key === settings.colourScheme ? 'selected' : ''} value="${key}">${key}</option>`;
});

const darkModeElement = $('darkMode');
darkModeElement.checked = settings.darkMode == 1 ? true : false;
if (settings.darkMode == 1) document.documentElement.classList.toggle('dark-mode');
darkModeElement.addEventListener('change', () => {
	settings.darkMode = darkModeElement.checked ? 1 : 0;
});

const resetButton = $('resetButton');
resetButton.addEventListener('click', () => {
	settings.reset();
	resetButton.classList.add('active');
	refreshQuestion();
});
resetButton.addEventListener('animationend', () => {
	resetButton.classList.remove('active');
});

(async () => {
    const categories = $('categories')
    const difficulties = $('difficulties');
    const form = $('settingsForm');
    const json = await (await fetch('https://opentdb.com/api_category.php')).json();
    categories.innerHTML += `<option value="0">Any</option>`;
    json.trivia_categories.forEach((category) => {
        categories.innerHTML += `<option ${category.id == settings.category ? 'selected' : ''} value="${category.id}">${category.name}</option>`;
    });
    (['Any', 'Easy', 'Medium', 'Hard']).forEach((difficulty, index) => {
        difficulties.innerHTML += `<option ${index == settings.difficulty ? 'selected' : ''} value="${index}">${difficulty}</option>`;
    });
    categories.addEventListener('change', () => {
		settings.category = categories.options[categories.selectedIndex].value;
        refreshQuestion()
    });
    difficulties.addEventListener('change', () => {
		settings.difficulty = difficulties.options[difficulties.selectedIndex].value;
		refreshQuestion()
    });
	colourSchemesElement.addEventListener('change', () => {
		confetti.setColourScheme(colourSchemesElement.options[colourSchemesElement.selectedIndex].value);
	});
    $('optionsLoadImg').style.display = 'none';
    form.style.width = 'auto';
    form.style.height = 'auto';
    $('options').style.display = 'block';

	settings.selects = {};
	settings.selects.categories = customSelect('#categories')[0];
	settings.selects.difficulties = customSelect('#difficulties')[0];
	customSelect('#colourSchemes');
})();

function resetSettings() {
	settings.reset();
	ques[ques.length - 1].reRun();
	confetti.setColourScheme(settings.colourScheme);

	$('categories').selectedIndex = 0;
    $('difficulties').selectedIndex = 0;
	$('colourSchemes').selectedIndex = 0;
}
function copySettingsUrl() {
	const url = `${window.location.href}?difficulty=${settings.difficulty}&category=${settings.category}&colourScheme=${settings.colourScheme}`;
	copy(url);
}
function copy(text) {
	navigator.permissions.query({name: "clipboard-write"}).then((result) => {
		if (result.state == "granted" || result.state == "prompt") {
			navigator.clipboard.writeText(text);
		}
	});
};

const mobileOptionsView = $('mobileOptionsView');
const eventListener = $('eventListener');
mobileOptionsView.addEventListener('click', () => {
	mobileOptionsView.classList.toggle('open');
	eventListener.classList.toggle('active');
});
eventListener.addEventListener('click', () => {
	if (mobileOptionsView.classList.contains('open')) {
		mobileOptionsView.classList.toggle('open');
		eventListener.classList.toggle('active');
	}
});
