class Confetti {
	constructor(id, count = 100) {
		this.element = document.getElementById(id);
		this.count = count;
		this.finish = false;
		this.amountFinished = 0;
		this.render();
		this.setColourScheme(settings.colourScheme);
	}

	render() {
		this.element.innerHTML = `
			<svg width="${window.screen.width}" height="${window.screen.height}" id="confettiSvg"></svg>
		`;
		this.svg = document.getElementById('confettiSvg');
		this.svg.innerHTML = `
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
					animation: confetti-fall 4s linear infinite paused;
				}
			</style>
			${this.generateConfetti(this.count)}
		`;
		this.confetti = this.getConfetti(this.count);
		
		for (const confetti of this.confetti) {
			confetti.addEventListener('animationiteration', () => {
				if (this.finish) {
					this.amountFinished++;
					confetti.style.animationPlayState = 'paused';
					if (this.amountFinished === this.count) {
						this.end();
					}
				}
			});
		}
	}

	generateConfetti(count) {
		const confetti = [];
		for (let i = 0; i < count; i++) {
			confetti.push(`
				<g transform="translate(${this.getRandomNumber(window.screen.width)} -20)">
					<g id="confetti${i}" class="confetti-element" style="animation-duration: ${this.getRandomNumber(6, 4)}s;">
						<rect x="0" y="0" height="10" width="10" style="transform: scale(${this.getRandomNumber(1.5, 0.5)});"></rect>
					</g>
				</g>
			`);
		}
		return confetti.join('');
	}

	getConfetti(count) {
		const confetti = [];
		for (let i = 0; i < count; i++) {
			confetti.push(document.getElementById(`confetti${i}`));
		}
		return confetti;
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
		this.confetti.forEach((confetti) => {
			confetti.children[0].style.fill = this.getRandomColour();
		});
		document.documentElement.style.setProperty('--background', colorSchemes[colourScheme].background);
	}

	async fall(time = 5000) {
		for (const confetti of this.confetti) {
			confetti.style.animationPlayState = 'running';
			await wait(this.getRandomNumber(100, 5, true));
		}
		await wait(time);
		this.finish = true;
	}

	end() {
		this.finish = false;
		this.amountFinished = 0;
	}
}

function wait(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}
