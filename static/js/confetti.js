class Confetti {
	constructor(id) {
		this.element = document.getElementById(id);
		this.setColourScheme(settings.colourScheme);
	}

	render() {
		this.element.innerHTML = `
			<svg width="${window.screen.width}" height="${window.screen.height}" id="confettiSvg"></svg>
		`;
		this.svg = document.getElementById('confettiSvg');
		this.svgText = `
			<style type="text/css">
				@keyframes confetti-fall {
					0% { 
						transform: translate(0,0px) rotate3d(1,1,1,0deg);
					}
					100% { 
						transform: translate(0,${window.screen.height}px) rotate3d(1,1,1,1080deg); 
					}
				}
				.confetti-element {
					animation: confetti-fall 4s linear infinite;
				}
			</style>
			${this.generateConfetti(100)}
		`;
		this.fall();
	}

	generateConfetti(count) {
		const confetti = [];
		for (let i = 0; i < count; i++) {
			confetti.push(`
				<g transform="translate(${this.getRandomNumber(window.screen.width)} 0)">
					<g class="confetti-element" style="animation-delay: ${this.getRandomNumber(0, -5)}s; animation-duration: ${this.getRandomNumber(6, 4)}s;">
						<rect x="0" y="0" height="10" width="10" style="transform: scale(${this.getRandomNumber(1.5, 0.5)});" fill="${this.getRandomColour()}"></rect>
					</g>
				</g>
			`);
		}
		return confetti.join('');
	}

	getRandomNumber(max, min = 0, round) {
		let number = Math.random() * (max - min);
		if (round) number = Math.round(number);
		return number + min;
	}

	getRandomColour() {
		return colorSchemes[settings.colourScheme].colours[this.getRandomNumber(colorSchemes[settings.colourScheme].colours.length - 1, 0, true)];
	}

	setColourScheme(colourScheme) {
		settings.colourScheme = colourScheme;
		this.render();
		document.documentElement.style.setProperty('--background', colorSchemes[colourScheme].background);
	}

	fall() {
		this.svg.innerHTML = this.svgText;
	}
}
