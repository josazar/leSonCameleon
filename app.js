// @prepros-prepend  inc/config.js
// @prepros-prepend  inc/utils.js
// @prepros-prepend  inc/Loader.js
// @prepros-prepend  inc/scenes/ScenesManager.js
// @prepros-prepend  inc/Blop.js
// @prepros-prepend  inc/body.js
// @prepros-prepend  inc/LineCut.js
// @prepros-prepend  inc/TriggerZone.js
// @prepros-prepend  inc/handMover.js
// @prepros-prepend  inc/Truchet.js
// @prepros-prepend  inc/audio/AudioCtrl.js
// @prepros-prepend  inc/audio/AudioShape.js

/************************************************************************
 *
 *
 * SETUP
 *
 *
 ************************************************************************/
function setup() {
	console.log("setup");
	APP.scenes = new ScenesManager();
	APP.loader = new Loader();
	APP.state = "loading";

	video = document.querySelector("#videoElement");
	// créer le Body

	var constraints = {
		video: true,
		audio: false
	};
	let options = {
		flipHorizontal: true
	};
	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(function(stream) {
			video.srcObject = stream;
			poseNet = ml5.poseNet(video, options, modelLoaded);
			poseNet.on("pose", gotPoses);
		})
		.catch(function(err) {
			/* handle the error */
			console.error("Erreur");
		});

	/**
	 * Aspect du personnage
	 */
	APP.BODY = new Body();
	APP.BODY.initBody();

	//APP.triggerZone = new TriggerZone();
	// on n'afficha pas le layer pour le moment (on attent de lancer le jeu)
	APP.layers.bodyLayer.opacity = 0;

	// AUDIO
	// >> NEW LAYER
	// FFTLINE
	APP.layers.FFTLine = new Layer();
	APP.layers.FFTLine.name = "audio-visualizer";
	APP.layers.FFTLine.sendToBack();
	APP.layers.FFTLine.activate();
	APP.layers.FFTLine.opacity = 0;

	APP.AudioCtrl = new AudioCtrl();
	APP.loader.startLoaderAudio();
	// on ajoute le path de la ligne FFT dans init()
	APP.AudioCtrl.init();

	// >> NEW LAYER
	// pour les objets Audios
	APP.layers.blops = new Layer();
	APP.layers.blops.name = "blops";
	APP.layers.blops.activate();
	APP.layers.blops.opacity = 0;

	let circle = new Path.Circle({
		center: [250, 300],
		radius: 45,
		fillColor: colors.blue
	});

	APP.blobs.push(new Blop(circle));
	let circle2 = new Path.Circle({
		center: [450, 200],
		radius: 50,
		fillColor: colors.yellow
	});

	APP.blobs.push(new Blop(circle2));
	APP.blobs.push(new Blop(circle));

	// >> NEW LAYER
	// pour les objets Audios
	APP.layers.audioShapes = new Layer();
	APP.layers.audioShapes.name = "audioShapes";
	APP.layers.audioShapes.activate();
	// Hands magnetize
	APP.handRightMover = new HandMover(APP.BODY.bodyJoints.rightWrist);
	APP.handLeftMover = new HandMover(APP.BODY.bodyJoints.leftWrist);
}

/************************************************************************
 *
 *
 * Boucle Principale
 *
 *
 ************************************************************************/
function onFrame(event) {
	// Loader
	APP.loader.update();

	// AUDIO
	APP.AudioCtrl.update();

	if (pose) {
		// Coupe avec le bras
		//APP.triggerZone.udpateG();
		// HEAD.onFrame(event);
		APP.BODY.onFrame(event);
		// Position des main qui controle le trait de coupe
		mousePosVirtual = [pose.leftWrist.x, pose.leftWrist.y];
		APP.handRightMover.onFrame(event);
		APP.handLeftMover.onFrame(event);

		// Check les intersections avec les formes Caméléon
		let audioShapes = APP.layers.audioShapes.children;
		let item = -1;
		for (let i = 0; i < audioShapes.length; i++) {
			if (APP.BODY.isTouchingShape(audioShapes[i])) {
				// une partie du corps alors touche une forme
				// on modifie le style du calque ca va modifier le style de tous ses enfants
				APP.layers.bodyLayer.style = audioShapes[i].style; // Fx bodyScaleOut
				item = i;
			}
		}
		if (item != -1 && APP.BODY.intersecting != item) {
			// Fx Scale Layer Body
			bodyScaleOut();
			APP.BODY.intersecting = item;
			APP.AudioCtrl.toggle(APP.AudioCtrl.tracks[item]);
		}
	}
}

/**********************************************************************
 *
 * EVENTS LISTENER
 *
 **********************************************************************/
function onKeyDown(event) {
	// Selected
	if (event.key === "space") {
		if (APP.layers.bodyLayer.selected === true)
			APP.layers.bodyLayer.selected = false;
		else APP.layers.bodyLayer.selected = true;
	}
	// Colors
	if (event.key === "c") {
		let red = getRandomArbitrary(0, 1);
		let green = getRandomArbitrary(0, 1);
		let blue = getRandomArbitrary(0, 1);
		for (let i = 0; i < APP.layers.bodyLayer.children.length; i++) {
			APP.layers.bodyLayer.children[i].fillColor = new Color(red, green, blue);
		}
	}
	if (event.key === "a") {
		// Motifs sur le body
		truchetOnBody();
		// Fx Scale Layer Body
		bodyScaleOut();
	}

	if (event.key === "0") {
		APP.scenes.launchHome();
	}

	if (event.key === "1") {
		APP.AudioCtrl.stop();
	}
}

/********************************************************************
 *
 * FX
 *
 **********************************************************************/
function bodyScaleOut() {
	if (project.layers["fx"]) {
		project.layers["fx"].remove();
	}
	let layerFx = project.layers["body"].clone();
	layerFx.name = "fx";
	layerFx.lastChild.remove();
	layerFx.sendToBack();
	layerFx.scaling = 1;
	layerFx.applyMatrix = false;
	layerFx.tweenTo(
		{
			scaling: 2,
			opacity: 0
		},
		{
			easing: "easeOutCubic",
			duration: 350
		}
	);
}

function truchetOnBody() {
	// Truchet Layer (Motifs)
	let layer = new Layer();
	layer.name = "motifs";
	layer.activate();

	displayRuchet(); // dans Truchet.js

	if (project.layers["body"].lastChild.name === "motifs") {
		project.layers["body"].lastChild.replaceWith(layer);
	} else {
		project.layers["body"].addChild(layer);
	}
	project.layers["body"].lastChild.clipMask = true;
}

/********************************************************************
 *
 * POSENET
 *
 **********************************************************************/

function gotPoses(poses) {
	if (poses.length > 0 && APP.state === "inGame") {
		pose = poses[0].pose;
		// les coordonnées récupéré sont ajusté à la taille de la source vidéo (640*380)
		// Je vais l'adapté à la hauteur de l'écran
		pose = poseAdaptToResolution(pose);
	}
}
function poseAdaptToResolution(p) {
	//let videoW = video.width;
	let videoH = video.height;
	APP.ratio = (h - 100) / videoH;

	let pScaled = p;
	for (const property in pScaled) {
		if (property !== "keypoints" && property !== "score") {
			pScaled[property].x *= APP.ratio;
			pScaled[property].y *= APP.ratio;
		}
	}
	return pScaled;
}
function modelLoaded() {
	console.log("PoseNet is ready");
	APP.loader.poseNetLoaded = true;
}

/***************************
 *
 *		INIT APP
 *
 ****************************/
setup();
