// @prepros-append  inc/utils.js
// Create a circle shaped path with its center at the center
// of the view and a radius of 30:
var CONFIG = {
	colors: {
		clair: "#cacde0",
		sombre: "#2e2b36"
	}
};
var video;
var poseNet;
var pose;

var SK = {
	sk_bones_ref: [
		["leftShoulder", "rightShoulder"],
		["leftShoulder", "leftElbow"],
		["rightShoulder", "rightElbow"],
		["rightElbow", "rightWrist"],
		["leftElbow", "leftWrist"],
		["leftShoulder", "leftHip"],
		["rightShoulder", "rightHip"],
		["rightHip", "rightKnee"],
		["leftHip", "leftKnee"],
		["leftHip", "rightHip"],
		["leftKnee", "leftAnkle"],
		["rightKnee", "rightAnkle"]
	],
	skeleton_bones: [],
	skeleton_keyPoints: [],
	keyPoints: {
		neckBottom: {},
		neckUp: {}
	}
};

function setup() {
	console.log("setup");
	video = document.querySelector("#videoElement");
	var constraints = {
		video: true,
		audio: false
	};
	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(function(stream) {
			video.srcObject = stream;
			poseNet = ml5.poseNet(video, modelLoaded);
			poseNet.on("pose", gotPoses);
		})
		.catch(function(err) {
			/* handle the error */
			console.error("Erreur");
		});

	// init les points du skeleton_keyPoints
	// 17 from PoseNet
	for (var i = 0; i < 17; i++) {
		var circ = new Path.Circle({
			center: [0, 0],
			radius: 4,
			strokeColor: CONFIG.colors.clair
		});
		SK.skeleton_keyPoints.push(circ);
	}

	//Custom keyPoints
	SK.keyPoints.neckBottom.circle = new Path.Circle({
		center: [0, 0],
		radius: 4,
		strokeColor: CONFIG.colors.clair
	});
	SK.keyPoints.neckUp.circle = new Path.Circle({
		center: [0, 0],
		radius: 4,
		strokeColor: CONFIG.colors.clair
	});

	// Skeleton bones
	/*for (var j = 0; j < 20; j++) {
		SK.skeleton_bones.push(
			new Path.Line({
				from: [-10, -10],
				to: [0, 0],
				strokeColor: CONFIG.colors.clair
			})
		);
	}*/

	// drawHead
	drawHead();
}
/**
 * Boucle Principale
 * @param {*} event
 */
function onFrame(event) {
	if (pose) {
		update(event.delta);
		updateHead(event);
	}
}

function update(delta) {
	// KeyPoints
	for (var i = 0; i < pose.keypoints.length; i++) {
		var x = pose.keypoints[i].position.x;
		var y = pose.keypoints[i].position.y;
		SK.skeleton_keyPoints[i].position = { x, y };
	}

	// Skeleton bones
	/*
	for (var j = 0; j < SK.sk_bones_ref.length; j++) {
		SK.skeleton_bones[j].segments[0].point.x = pose[SK.sk_bones_ref[j][0]].x;
		SK.skeleton_bones[j].segments[0].point.y = pose[SK.sk_bones_ref[j][0]].y;
		SK.skeleton_bones[j].segments[1].point.x = pose[SK.sk_bones_ref[j][1]].x;
		SK.skeleton_bones[j].segments[1].point.y = pose[SK.sk_bones_ref[j][1]].y;
	}*/
	// Custom
	// Bas du cou
	SK.keyPoints.neckBottom.circle.position.x = lerp(
		0.5,
		pose.leftShoulder.x,
		pose.rightShoulder.x
	);
	SK.keyPoints.neckBottom.circle.position.y = lerp(
		0.5,
		pose.leftShoulder.y,
		pose.rightShoulder.y
	);
	// haut du cou
	SK.keyPoints.neckUp.circle.position.x = lerp(
		0.5,
		SK.keyPoints.neckBottom.circle.position.x,
		pose.nose.x
	);
	SK.keyPoints.neckUp.circle.position.y = lerp(
		0.5,
		SK.keyPoints.neckBottom.circle.position.y,
		pose.nose.y
	);
	// bones cou > on prend le bones qui suit(à la fin de la boucle un peu plus haut) soit la valeur de j
	/*SK.skeleton_bones[j].segments[0].point.x =
		SK.keyPoints.neckBottom.circle.position.x;
	SK.skeleton_bones[j].segments[0].point.y =
		SK.keyPoints.neckBottom.circle.position.y;
	SK.skeleton_bones[j].segments[1].point.x =
		SK.keyPoints.neckUp.circle.position.x;
	SK.skeleton_bones[j].segments[1].point.y =
		SK.keyPoints.neckUp.circle.position.y;*/
}

function gotPoses(poses) {
	if (poses.length > 0) {
		pose = poses[0].pose;
	}
}

/**  UTILS **/
function onResize(event) {}
function modelLoaded() {
	console.log("PoseNet is ready");
}

/***************************
 *
 *		HEAD
 *
 ****************************/

var colors = {
	purple: "#624c63",
	skin: "#b9adb9",
	bg: "#2e2b36"
};
var head = {
	pathDataOval:
		"M203,106.2c2.5,71.7-43.4,91.7-99.5,91.7S0.5,178.9,0,106.2C-0.4,47.5,45.4,0,101.5,0S201,47.6,203,106.2z",
	pathDataNose:
		"M3.6,57.5c0,0.5-0.3,1-0.7,1c-5.5,0.3-1.5-9.8-1.5-18.7c0-9-3-28,4-35c20.5-20.5,20.8,30.8,19.2,43.4c-0.1,0.8-1,1.1-1.6,0.7h0c-0.3-0.2-0.4-0.5-0.4-0.8c0.2-11,2.4-58.7-14.3-39.3c-6,7-2,40-2,42s4,4,6,4c2.7,0,6-2.1,7.6-2.7c7-2.6,8.4,6.7,6.4,6.7c-1,0-2-4-6-4c-2.3,0-4,4-8,4c-5,0-3.9-4.3-6-4C3.4,54.8,3.5,56.3,3.6,57.5z",
	pathDataMouth:
		"M1.3,10c-3-2.5-0.5-7.3,3.2-6.4C11.9,5.3,22.2,7,32.8,6.5C44.1,5.9,56,2.8,64.2,0.2C68-1,71,3.5,68.3,6.5c-5.9,6.6-16.3,14-33.5,14C17.7,20.5,7.4,15.1,1.3,10z",
	pathDataHair:
		"M63.2,20.6c0,0-54.8,32.2-62,39.4c-5.8,5.8,6-60,85-60c81,0,91,53.6,91,50c0-2-21.1-18.5-21.1-18.5s-31.7,13.1-51.6,11.8C84.8,42.1,63.2,20.6,63.2,20.6z",
	pathDataSourcil:
		"M49.6,9.2c0,0-20.3-3.8-33.6,5.8S0.5,30,0.5,30S-4.3,11.3,15.1,4.4C49.5-7.8,49.6,9.2,49.6,9.2z",
	pathDataOreille:
		"M18.9,7.3c0,0-5-11-14-6s-3,15-2,17s7,8,13,7s6-5,6-5S21.9,11.3,18.9,7.3z"
};

function drawHead() {
	var w = 640;
	var h = 480;
	var headRadius = 100;
	// forme ovale de la tête
	head.oval = new Path(head.pathDataOval);
	head.oval.position = [w / 2, h / 2];
	head.oval.fillColor = colors.skin;
	// nez
	head.nose = new Path(head.pathDataNose);
	head.nose.position = [head.oval.position.x, head.oval.position.y + 20];
	head.nose.fillColor = colors.purple;

	// Cheveux
	head.hair = new Path(head.pathDataHair);
	head.hair.position = [head.oval.position.x - 4, head.oval.position.y - 70];
	head.hair.fillColor = colors.purple;

	// Oreilles
	head.oreilleG = new Path(head.pathDataOreille);
	head.oreilleG.position = [
		head.oval.position.x - 105,
		head.oval.position.y + 17
	];
	head.oreilleG.fillColor = colors.skin;
	head.oreilleD = head.oreilleG.clone();
	head.oreilleD.position = [
		head.oval.position.x + 105,
		head.oval.position.y + 17
	];
	head.oreilleD.scale(-1, 1);

	// Bouche
	head.mouth = new Path(head.pathDataMouth);
	head.mouth.fillColor = colors.purple;
	head.mouth.position = [head.oval.position.x, head.oval.position.y + 70];

	// sourcil gauche
	head.sourcilG = new Path(head.pathDataSourcil);
	head.sourcilG.fillColor = colors.purple;
	head.sourcilG.position = [
		head.oval.position.x - 68,
		head.oval.position.y - 35
	];
	// sourcil droit
	head.sourcilD = new Path(head.pathDataSourcil);
	head.sourcilD.fillColor = colors.purple;
	head.sourcilD.position = [
		head.oval.position.x + 68,
		head.oval.position.y - 35
	];
	head.sourcilD.scale(-1, 1);

	// Yeux
	var eye1_x = w / 2 - headRadius / 2 - 10;
	head.eye1 = new Path.Circle([eye1_x, head.oval.position.y], 25);
	head.eyeGroup = new Group(head.eye1, head.eye2);
	head.eyeGroup.style = {
		fillColor: "white",
		strokeColor: colors.purple,
		strokeWidth: 6
	};

	var pupille_1 = new Path.Circle(
		[head.eye1.position.x, head.eye1.position.y],
		8
	);
	pupille_1.fillColor = colors.purple;
	var eyeArea = new Path.Circle(
		[head.eye1.position.x, head.eye1.position.y],
		32
	);
	eyeArea.strokeWidth = 1;
	eyeArea.strokeColor = colors.purple;
	var eyeArea2 = eyeArea.clone();
	eyeArea2.position.x += 2;
	var eyeArea3 = eyeArea.clone();
	eyeArea3.position.y += 4;
	eyeArea3.scale(1.1);
	var eyeArea4 = eyeArea3.clone();
	eyeArea4.position = eyeArea.position - 2;
	eyeArea4.scale(0.7);
	var eyeArea5 = eyeArea3.clone();
	eyeArea5.position.y -= 2;
	eyeArea5.scale(0.95);

	// winking (clin d'oeil)
	var wink = new Path.Circle(
		[pupille_1.position.x, pupille_1.position.y - 2],
		25
	);
	wink.fillColor = colors.skin;
	wink.visible = false;

	head.groupEyeArea = new Group(
		eyeArea,
		eyeArea2,
		eyeArea3,
		eyeArea4,
		eyeArea5,
		head.eye1,
		pupille_1,
		wink
	);
	head.groupEyeArea2 = head.groupEyeArea.clone();
	head.groupEyeArea2.position.x += 120;
	head.groupEyeArea2.scale(-1, 1);

	// on regroupe tout
	head.group = new Group(
		head.oval,
		head.groupEyeArea,
		head.groupEyeArea2,
		head.eyeGroup,
		head.sourcilD,
		head.sourcilG,
		head.mouth,
		head.oreilleD,
		head.oreilleG,
		head.hair,
		head.nose
	);

	// wink - toutes les 3s on le fait cligner des yeux
	setInterval(winking, 4000);
}

function updateHead(event) {
	// animation de la bouche
	var ratio = Math.cos(event.time * 5) / 2;
	head.oval.segments[1].point.y += ratio / 5;
	/*	head.mouth.segments[2].point.y += ratio / 3;
	head.mouth.segments[5].point.y += ratio / 3;*/
	head.group.position = [pose.nose.x, pose.nose.y];

	// rotation de la tête
	// vector rightEye et leftEye
	var eyesVector =
		new Point(pose.leftEye.x, pose.leftEye.y) -
		new Point(pose.rightEye.x, pose.rightEye.y);

	head.group.applyMatrix = false;
	head.group.rotation = eyesVector.angle;

	// scale de la tête suivant la distance
}

function winking() {
	head.groupEyeArea.children[7].visible = true;
	head.groupEyeArea2.children[7].visible = true;
	setTimeout(function() {
		head.groupEyeArea.children[7].visible = false;
		head.groupEyeArea2.children[7].visible = false;
	}, 400);
	setTimeout(function() {
		head.groupEyeArea.children[7].visible = true;
		head.groupEyeArea2.children[7].visible = true;
	}, 800);
	setTimeout(function() {
		head.groupEyeArea.children[7].visible = false;
		head.groupEyeArea2.children[7].visible = false;
	}, 950);
}
/***************************
 *
 *		INIT APP
 *
 ****************************/
setup();
