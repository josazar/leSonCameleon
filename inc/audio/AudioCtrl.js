class AudioCtrl {
	constructor() {
		this.FFT_Size = 16;
		this.nbFFTLines = 10;
		this.FFTLines = [];
		// Audio
		this.drum = new Tone.Player("/audio/drum_bass.wav").toMaster();
		this.drum_02 = new Tone.Player("/audio/drum_bass_02.wav").toMaster();
		this.hammer = new Tone.Player("/audio/hammer.wav").toMaster();
		this.piano_aigue = new Tone.Player("/audio/piano_aigue.wav").toMaster();
		this.piano_basse = new Tone.Player("/audio/piano_basse.wav").toMaster();

		this.tracks = [
			this.drum,
			this.piano_basse,
			this.piano_aigue,
			this.hammer,
			this.drum_02
		];

		// Timeline
		this.timer = 0;
		this.playing = false;
	}
	init() {
		console.log("init AudioCtrl");
		// New FFT Lines
		for (let i = 0; i < this.nbFFTLines; i++) {
			let FFTL = new FFTLine(this.FFT_Size, 20 * i);
			let path = FFTL.createPath();
			path.opacity = 1 - i * 0.1;
			this.FFTLines.push(FFTL);
		}

		this.FFT = new Tone.FFT(this.FFT_Size);
		// Chain to FFT analyzer
		this.drum.chain(this.FFT);
		this.drum.loop = true;
		this.drum_02.loop = true;
		this.drum_02.chain(this.FFT);
		this.hammer.loop = true;
		this.hammer.chain(this.FFT);
		this.piano_aigue.loop = true;
		this.piano_aigue.chain(this.FFT);
		this.piano_basse.loop = true;
		this.piano_basse.chain(this.FFT);
	}

	initAudioShapes() {
		APP.layers.audioShapes.activate();
		let nb_shapes = 5;
		if (APP.audioShapes.length === 0) {
			let shapes_colors = [
				colors.green,
				colors.rose,
				colors.blue,
				colors.skin,
				colors.yellow
			];
			// time where a sample must start (nb of frames at 60fps)
			let timeline = [10, 270, 1100, 1920, 3600];
			for (let i = 0; i < nb_shapes; i++) {
				let args = {
					track: APP.AudioCtrl.tracks[i],
					color: shapes_colors[i],
					starter: timeline[i],
					svg: "images/note_blue.svg"
				};
				let as = new AudioShape(args);
				APP.audioShapes.push(as);
			}
		} else {
			for (let i = 0; i < nb_shapes; i++) {
				let x = getRandomArbitrary(100, 500);
				APP.audioShapes[i].init([x, -50]);
			}
		}
	}
	update() {
		if (this.playing) {
			// boucle
			if (this.timer == 5000) {
				this.timer = 0;
				this.stop();
				this.start();
				return;
			}
			this.timer++;
			let fftValue = this.FFT.getValue();
			// FFTLine update
			for (let l = 0; l < this.FFTLines.length; l++) {
				this.FFTLines[l].update(fftValue);
			}

			// mouvement des Audio Shapes
			for (let item of APP.audioShapes) {
				item.update(APP.AudioCtrl.timer);
			}
		}
	}

	start() {
		this.timer = 0;
		this.initAudioShapes();
		this.playing = true;
		// Players
		this.drum.mute = true;
		this.piano_basse.mute = true;
		this.piano_aigue.mute = true;
		this.hammer.mute = true;
		this.drum_02.mute = true;
		this.drum.start();
		this.piano_basse.start();
		this.piano_aigue.start();
		this.hammer.start();
		this.drum_02.start();
	}
	stop() {
		this.timer = 0;
		this.playing = false;
		for (let i = 0; i < this.tracks.length; i++) {
			this.tracks[i].mute = true;
		}
	}

	toggle(player) {
		if (player.mute == false) {
			player.mute = true;
		} else {
			player.mute = false;
		}
		if (player == this.drum_02) this.drum.mute = true;
	}
}
