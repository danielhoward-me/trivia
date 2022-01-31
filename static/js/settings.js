class Settings {
	constructor() {
		this.data = {
			category: localStorage.category || 0,
			difficulty: localStorage.difficulty || 0,
			colourScheme: localStorage.colourScheme || defaultColorScheme,
			darkMode: localStorage.darkMode || 0,
		};
		localStorage.category = this.data.category;
		localStorage.difficulty = this.data.difficulty;
		localStorage.colourScheme = this.data.colourScheme;
		localStorage.darkMode = this.data.darkMode;
	}

	set category(category) {
		this.data.category = category;
		localStorage.category = category;
		if (this.selects) this.selects.categories.value = category;
		this.updateUrl();
	}
	set difficulty(difficulty) {
        if (difficulty < 0 || difficulty > 3) difficulty = 0;
		this.data.difficulty = difficulty;
		localStorage.difficulty = difficulty;
		if (this.selects) this.selects.difficulties.value = difficulty;
		this.updateUrl();
	}
	set colourScheme(colourScheme) {
		if (!(colourScheme in colorSchemes)) colourScheme = defaultColorScheme;
		this.data.colourScheme = colourScheme;
		localStorage.colourScheme = colourScheme;
	}
	set darkMode(darkModeSetting) {
		document.documentElement.classList.toggle('dark-mode');
		this.data.darkMode = darkModeSetting;
		localStorage.darkMode = darkModeSetting;
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
	get darkMode() {
		return this.data.darkMode;
	}

	get triviaUrl() {
		return `https://opentdb.com/api.php?amount=1&category=${this.category == 0 ? '0' : this.category}&difficulty=${this.difficulty == 0 ? '0' : difficultiesMap[this.difficulty]}`;
	}

	updateUrl() {
		window.history.replaceState(null, null, `${window.location.pathname}#c=${this.category}&d=${this.difficulty}`);
	}

	reset() {
		this.category = 0;
		this.difficulty = 0;
	}
}

const settings = new Settings();
