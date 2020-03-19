class ScenesManager {
	constructor() {
		this.homeDiv = document.getElementById("Home");
		this.inGameDiv = document.getElementById("InGame");
		this.loaderDiv = document.getElementById("Loader");
		this.toneBufferTxt = document.getElementById("ToneBuffer");
		this.footer = document.getElementById("Footer");
		// Boutons
		this.startBtn = document.getElementById("startBtn");
		this.backBtn = document.getElementById("backBtn");

		// Event listeners
		this.startBtn.addEventListener("mouseup", () => {
			this.launchGame();
		});
		this.backBtn.addEventListener("mouseup", () => {
			this.stopGame();
			this.launchHome();
		});
	}
	hide(element) {
		element.classList.remove("active");
	}
	show(element) {
		element.classList.add("active");
	}

	launchHome() {
		APP.state = "home";
		this.show(this.homeDiv);
		this.show(this.footer);
		this.hide(this.loaderDiv);
		this.hide(this.inGameDiv);
	}
	launchGame() {
		APP.state = "inGame";
		this.hide(this.homeDiv);
		this.hide(this.footer);
		this.show(this.inGameDiv);
		// Body
		APP.layers.bodyLayer.opacity = 1;
		APP.layers.FFTLine.opacity = 1;
		APP.layers.blops.opacity = 1;
		APP.layers.audioShapes.opacity = 1;
		APP.AudioCtrl.start();
	}
	stopGame() {
		// Body
		APP.layers.bodyLayer.opacity = 0;
		APP.layers.FFTLine.opacity = 0;
		APP.layers.blops.opacity = 0;
		APP.layers.audioShapes.opacity = 0;
		APP.AudioCtrl.stop();
	}
}
