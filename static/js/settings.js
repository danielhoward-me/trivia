class Settings {
	constructor() {
		this.data = {
			category: localStorage.category || 0,
			difficulty: localStorage.difficulty || 'any',
			colourScheme: localStorage.colourScheme || defaultColorScheme,
		};
		localStorage.category = this.data.category;
		localStorage.difficulty = this.data.difficulty;
		localStorage.colourScheme = this.data.colourScheme;
	}

	set category(category) {
		this.data.category = category;
		localStorage.category = category;
	}
	set difficulty(difficulty) {
		this.data.difficulty = difficulty;
		localStorage.difficulty = difficulty;
	}
	set colourScheme(colourScheme) {
		if (!(colourScheme in colorSchemes)) colourScheme = defaultColorScheme;
		this.data.colourScheme = colourScheme;
		localStorage.colourScheme = colourScheme;
	}

	get category() {
		return this.data.category;
	}
	get difficulty() {
		return this.data.difficulty;
	}
	get colourScheme() {
		return this.data.colourScheme;
	}

	get triviaUrl() {
		return `https://opentdb.com/api.php?amount=1&category=${this.category === 'Any' ? '0' : this.category}&difficulty=${this.difficulty === 'any' ? '0' : this.difficulty}`;
	}

	reset() {
		this.data = {
			category: 0,
			difficulty: 'any',
			colourScheme: defaultColorScheme,
		};
		localStorage.category = this.data.category;
		localStorage.difficulty = this.data.difficulty;
		localStorage.colourScheme = this.data.colourScheme;
	}
}

const settings = new Settings();
