// @prepros-prepend  inc/head.js

// @prepros-append  inc/utils.js
// @prepros-append  inc/body.js

var colors = {
	purple: "#624c63",
	skin: "#b9adb9",
	bg: "#2e2b36"
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
	// customPath(n) (utils.js) renvoie un path avec n segments
	customPath: {
		body: customPath(18),
		neckSkeleton: customPath(2)
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
			strokeColor: "white"
		});
		SK.skeleton_keyPoints.push(circ);
	}

	SK.customPath.body.closed = true;
	SK.customPath.body.fillColor = colors.skin;
	// drawHead
	drawHead();
}
/**
 * Boucle Principale
 * @param {*} event
 */
function onFrame(event) {
	if (pose) {
		update(event);
		updateHead(event);
		bodyOnFrame();
	}
}

function update() {
	// KeyPoints
	for (var i = 0; i < pose.keypoints.length; i++) {
		var x = pose.keypoints[i].position.x;
		var y = pose.keypoints[i].position.y;
		SK.skeleton_keyPoints[i].position = { x, y };
	}

	// Custom Path
	// Bas du cou
	// Custom Path
	var x0 = lerp(0.5, pose.leftShoulder.x, pose.rightShoulder.x);
	var y0 = lerp(0.5, pose.leftShoulder.y, pose.rightShoulder.y);
	SK.customPath.neckSkeleton.firstSegment.point.x = x0;
	SK.customPath.neckSkeleton.firstSegment.point.y = y0;
	var x1 = lerp(0.5, x0, pose.nose.x);
	var y1 = lerp(0.5, y0, pose.nose.y);
	SK.customPath.neckSkeleton.lastSegment.point.x = x1;
	SK.customPath.neckSkeleton.lastSegment.point.y = y1;
	/********************
	/ 		Cou
	/********************/
	/*
	SK.customPath.body.firstSegment.point.x = x1 + 10;
	SK.customPath.body.firstSegment.point.y = y1;
	SK.customPath.body.segments[1].point.x = x0 + 20;
	SK.customPath.body.segments[1].point.y = y0 - 20;
	SK.customPath.body.segments[2].point.x = pose.leftShoulder.x;
	SK.customPath.body.segments[2].point.y = pose.leftShoulder.y;
	SK.customPath.body.segments[3].point.x = pose.leftElbow.x + 20;
	SK.customPath.body.segments[3].point.y = pose.leftElbow.y;
	SK.customPath.body.segments[4].point.x = pose.leftWrist.x + 10;
	SK.customPath.body.segments[4].point.y = pose.leftWrist.y;
	SK.customPath.body.segments[5].point.x = pose.leftWrist.x - 10;
	SK.customPath.body.segments[5].point.y = pose.leftWrist.y;
	SK.customPath.body.segments[6].point.x = pose.leftElbow.x - 20;
	SK.customPath.body.segments[6].point.y = pose.leftElbow.y + 10;
	SK.customPath.body.segments[7].point.x = pose.leftShoulder.x - 20;
	SK.customPath.body.segments[7].point.y = pose.leftShoulder.y + 30;

	SK.customPath.body.segments[15].point.x = pose.rightShoulder.x;
	SK.customPath.body.segments[15].point.y = pose.rightShoulder.y;
	SK.customPath.body.segments[16].point.x = x0 - 20;
	SK.customPath.body.segments[16].point.y = y0 - 20;
	SK.customPath.body.lastSegment.point.x = x1 - 10;
	SK.customPath.body.lastSegment.point.y = y1;*/
}

function gotPoses(poses) {
	if (poses.length > 0) {
		pose = poses[0].pose;
	}
}

/**  UTILS **/
function modelLoaded() {
	console.log("PoseNet is ready");
}

/***************************
 *
 *		INIT APP
 *
 ****************************/
setup();
