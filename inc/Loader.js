class Loader {
	constructor() {
		this.poseNetLoaded = false;
		this.audioLoaded = false;
		this.complete = false;
	}

	startLoaderAudio() {
		// Quand le buffer global est completement chargé
		Tone.Buffer.on("load", () => {
			console.log("Sample is loaded");
			APP.scenes.toneBufferTxt.innerHTML = "Audio loaded ✔";
			this.audioLoaded = true;
		});
		Tone.Buffer.on("progress", () => {
			var totalProgress = 0;
			for (var i = 0; i < Tone.Buffer._downloadQueue.length; i++) {
				totalProgress += Tone.Buffer._downloadQueue[i].progress;
			}
			APP.scenes.toneBufferTxt.innerHTML =
				(totalProgress / Tone.Buffer._downloadQueue.length) * 100 + "%";
		});
	}
	update() {
		if (this.poseNetLoaded && this.audioLoaded && !this.complete)
			this.onComplete();
	}
	onComplete() {
		this.complete = true;
		console.log("** LOADING COMPLETE **");
		// PAge d'accueil
		APP.scenes.launchHome();
	}
}
