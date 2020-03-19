var colors = {
	purple: "#624c63",
	skin: "#b9adb9",
	green: "#2ea496",
	rose: "#d579a0",
	bg: "#2e2b36",
	blue: "#5dbfe6",
	yellow: "#f9eb71"
};
const APP = {
	lineCut: {},
	blobs: [],
	audioShapes: [],
	handRightMover: {},
	layers: {},
	scenes: {},
	ratio: 1,
	loader: {},
	state: "" // "inGame" "home" "loading"
};
let w = document.body.clientWidth;
let h = document.body.clientHeight;
let mousePosVirtual = new Point(0, 0);
var video;
var poseNet;
var pose;
