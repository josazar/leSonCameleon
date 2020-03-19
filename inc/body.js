class BodyJoint {
	constructor(radius, color) {
		this.radius = radius;
		this.path = new Path.Circle([-90, -90], this.radius);
		this.path.onMouseDrag = event => this.MouseDrag(event);
		this.path.fillColor = color;
		APP.layers.bodyLayer.addChild(this.path);
	}
	getPosX() {
		return this.path.position.x;
	}
	getPosY() {
		return this.path.position.y;
	}
	MouseDrag(event) {
		this.path.position += event.delta;
	}
}

/**
 * Partie du corps entre 2 Joint (Cercle)
 * On utilise les tangentes aux deux cercles pour tracer cette partie
 */
class BodyPart {
	constructor(name, joints, color) {
		this.name = name;
		this.joints = joints;
		this.path = new Path();
		this.segments = [];
		this.path.fillColor = color;
		this.debug = false;
		this.tangents = [];
	}

	init() {
		APP.layers.bodyLayer.addChild(this.path);

		var p = this.path;
		let strokeW = 0;
		if (this.debug) strokeW = 1;
		// Tangents Circles
		let nbSegments = 4;
		for (let i = 0; i < nbSegments; i++) {
			this.segments.push(
				new Path.Circle({
					center: [-90, -90],
					radius: 3,
					strokeColor: "red",
					strokeWidth: strokeW
				})
			);
		}
		// PATH
		for (var i = 0; i < this.segments.length; i++) {
			p.add(new Point(this.segments[i].position));
		}
	}
	update() {
		var tangents = this.getJointCircleTangents(this.joints[0], this.joints[1]);
		if (tangents != null) {
			this.segments[0].position = [tangents[0][0], tangents[0][1]];
			this.segments[1].position = [tangents[1][0], tangents[1][1]];
			this.segments[2].position = [tangents[1][2], tangents[1][3]];
			this.segments[3].position = [tangents[0][2], tangents[0][3]];
			var p = this.path;
			for (var i = 0; i < this.segments.length; i++) {
				p.segments[i].point = new Point(this.segments[i].position);
			}
		}
	}

	getJointCircleTangents(jt1, jt2) {
		return getCircleTangents(
			jt1.getPosX(),
			jt1.getPosY(),
			jt1.radius,
			jt2.getPosX(),
			jt2.getPosY(),
			jt2.radius
		);
	}
}

class BodyPartTorso extends BodyPart {
	init() {
		APP.layers.bodyLayer.addChild(this.path);
		var p = this.path;
		let strokeW = 0;
		if (this.debug) strokeW = 1;

		// Tangents Circles
		let nbSegments = 14;
		for (let i = 0; i < nbSegments; i++) {
			this.segments.push(
				new Path.Circle({
					center: [0, 10],
					radius: 3,
					strokeColor: "red",
					strokeWidth: strokeW
				})
			);
		}
		// PATH
		for (var i = 0; i < this.segments.length; i++) {
			p.add(new Point(this.segments[i].position));
		}
	}

	update() {
		let nbTangents = 7;
		for (let i = 0; i < nbTangents; i++) {
			if (i == nbTangents - 1) {
				this.tangents[i] = this.getJointCircleTangents(
					this.joints[i],
					this.joints[0]
				);
			} else {
				this.tangents[i] = this.getJointCircleTangents(
					this.joints[i],
					this.joints[i + 1]
				);
			}
			if (this.tangents[i] == null) return;
		}
		let segItem = 0;
		for (let j = 0; j < nbTangents; j++) {
			this.segments[segItem].position = [
				this.tangents[j][0][0],
				this.tangents[j][0][1]
			];
			segItem++;
			this.segments[segItem].position = [
				this.tangents[j][0][2],
				this.tangents[j][0][3]
			];
			segItem++;
		}

		var p = this.path;
		for (var i = 0; i < this.segments.length; i++) {
			p.segments[i].point = new Point(this.segments[i].position);
		}
		p.closed = true;
	}
}

class Body {
	constructor() {
		this.parts = [];
		this.partsDef = {
			leftUpperArm: ["leftShoulder", "leftElbow"],
			leftLowerArm: ["leftElbow", "leftWrist"],
			rightUpperArm: ["rightShoulder", "rightElbow"],
			rightLowerArm: ["rightElbow", "rightWrist"],
			torso: [
				"leftShoulder",
				"neckLeft",
				"neck",
				"neckRight",
				"rightShoulder",
				"rightHip",
				"leftHip"
			],
			leftUpperLeg: ["leftHip", "leftKnee"],
			rightUpperLeg: ["rightHip", "rightKnee"]
		};
		this.bodyJoints = {
			leftShoulder: {},
			leftElbow: {},
			leftWrist: {},
			rightShoulder: {},
			neck: {},
			neckLeft: {},
			neckRight: {},
			rightElbow: {},
			rightWrist: {},
			rightHip: {},
			leftHip: {},
			leftKnee: {},
			rightKnee: {}
		};

		this.shoulderRadius = 12 * APP.ratio;
		this.ElbowRadius = 7 * APP.ratio;
		this.wristRadius = 5 * APP.ratio;
		this.hipRadius = 5 * APP.ratio;
		this.kneeRadius = 5 * APP.ratio;
		this.neckRadius = 25 * APP.ratio;
		this.neckSideRadius = 5 * APP.ratio;

		this.intersecting = -1;
	}
	initBody() {
		console.log("init Body");
		// Calquesc
		APP.layers.baseLayer = new Layer();
		APP.layers.baseLayer.name = "base";
		APP.layers.bodyLayer = new Layer();
		APP.layers.bodyLayer.name = "body";
		APP.layers.baseLayer.activate();
		// Init des Joints (Cercles)
		// bras gauche
		this.bodyJoints.leftShoulder = new BodyJoint(
			this.shoulderRadius,
			colors.skin
		);
		this.bodyJoints.leftElbow = new BodyJoint(this.ElbowRadius, colors.skin);
		this.bodyJoints.leftWrist = new BodyJoint(this.wristRadius, colors.skin);
		// Neck cou
		this.bodyJoints.neck = new BodyJoint(this.neckRadius, colors.skin);
		// Neck Left cou
		this.bodyJoints.neckLeft = new BodyJoint(this.neckSideRadius, colors.skin);
		// Neck Right cou
		this.bodyJoints.neckRight = new BodyJoint(this.neckSideRadius, colors.skin);
		// bras droit
		this.bodyJoints.rightShoulder = new BodyJoint(
			this.shoulderRadius,
			colors.skin
		);
		this.bodyJoints.rightElbow = new BodyJoint(this.ElbowRadius, colors.skin);
		this.bodyJoints.rightWrist = new BodyJoint(this.wristRadius, colors.skin);
		// Hip = hanches
		this.bodyJoints.rightHip = new BodyJoint(this.hipRadius, colors.skin);
		this.bodyJoints.leftHip = new BodyJoint(this.hipRadius, colors.skin);
		// Knee = genou
		this.bodyJoints.leftKnee = new BodyJoint(this.kneeRadius, colors.skin);
		this.bodyJoints.rightKnee = new BodyJoint(this.kneeRadius, colors.skin);
		// Draw Body Parts
		this.drawArms();
		this.drawTorso();
		this.drawLegs();
	}

	drawArms() {
		var leftUpperArm = new BodyPart(
			"leftUpperArm",
			[
				this.bodyJoints[this.partsDef.leftUpperArm[0]],
				this.bodyJoints[this.partsDef.leftUpperArm[1]]
			],
			colors.skin
		);
		leftUpperArm.init();
		this.parts.push(leftUpperArm);
		var leftLowerArm = new BodyPart(
			"leftLowerArm",
			[
				this.bodyJoints[this.partsDef.leftLowerArm[0]],
				this.bodyJoints[this.partsDef.leftLowerArm[1]]
			],
			colors.skin
		);
		leftLowerArm.init();
		this.parts.push(leftLowerArm);

		var rightUpperArm = new BodyPart(
			"rightUpperArm",
			[
				this.bodyJoints[this.partsDef.rightUpperArm[0]],
				this.bodyJoints[this.partsDef.rightUpperArm[1]]
			],
			colors.skin
		);
		rightUpperArm.init();
		this.parts.push(rightUpperArm);

		var rightLowerArm = new BodyPart(
			"rightLowerArm",
			[
				this.bodyJoints[this.partsDef.rightLowerArm[0]],
				this.bodyJoints[this.partsDef.rightLowerArm[1]]
			],
			colors.skin
		);
		rightLowerArm.init();
		this.parts.push(rightLowerArm);
	}

	drawTorso() {
		var torso = new BodyPartTorso(
			"torso",
			[
				this.bodyJoints[this.partsDef.torso[0]],
				this.bodyJoints[this.partsDef.torso[1]],
				this.bodyJoints[this.partsDef.torso[2]],
				this.bodyJoints[this.partsDef.torso[3]],
				this.bodyJoints[this.partsDef.torso[4]],
				this.bodyJoints[this.partsDef.torso[5]],
				this.bodyJoints[this.partsDef.torso[6]]
			],
			colors.skin
		);
		torso.init();
		this.parts.push(torso);
	}
	drawLegs() {
		// rightUpperLeg
		var rightUpperLeg = new BodyPart(
			"rightUpperLeg",
			[
				this.bodyJoints[this.partsDef.rightUpperLeg[0]],
				this.bodyJoints[this.partsDef.rightUpperLeg[1]]
			],
			colors.skin
		);
		rightUpperLeg.init();
		this.parts.push(rightUpperLeg);
		// leftUpperLeg
		var leftUpperLeg = new BodyPart(
			"leftUpperLeg",
			[
				this.bodyJoints[this.partsDef.leftUpperLeg[0]],
				this.bodyJoints[this.partsDef.leftUpperLeg[1]]
			],
			colors.skin
		);
		leftUpperLeg.init();
		this.parts.push(leftUpperLeg);
	}

	onFrame() {
		// BodyJoints
		this.bodyJoints.leftShoulder.path.position = [
			lerp(
				0.5,
				this.bodyJoints.leftShoulder.path.position.x,
				pose.leftShoulder.x
			),
			lerp(
				0.5,
				this.bodyJoints.leftShoulder.path.position.y,
				pose.leftShoulder.y
			)
		];
		this.bodyJoints.rightShoulder.path.position = [
			lerp(
				0.5,
				this.bodyJoints.rightShoulder.path.position.x,
				pose.rightShoulder.x
			),
			lerp(
				0.5,
				this.bodyJoints.rightShoulder.path.position.y,
				pose.rightShoulder.y
			)
		];

		// De profil les Joints se superpose, et le calcul des tangentes renvoie des valeurs null donc on repousse les joints dans ce cas
		if (
			this.bodyJoints.leftShoulder.path.position.isClose(
				this.bodyJoints.rightShoulder.path.position,
				60
			)
		) {
			this.bodyJoints.leftShoulder.path.position.x =
				this.bodyJoints.rightShoulder.path.position.x + 70;
		}

		// le joint du cou
		// vecteur de rightShoulder + leftShoulder
		let v =
			this.bodyJoints.leftShoulder.path.position -
			this.bodyJoints.rightShoulder.path.position;
		let posNeckBottom = this.bodyJoints.leftShoulder.path.position - v / 2;
		v.angle -= 90;
		this.bodyJoints.neck.path.position = posNeckBottom + v / 2;

		// neckLeft & neckRight
		v =
			this.bodyJoints.neck.path.position -
			this.bodyJoints.leftShoulder.path.position;
		let posNeckLeft = this.bodyJoints.leftShoulder.path.position + v / 1.6;
		v.angle += 90;

		this.bodyJoints.neckLeft.path.position = posNeckLeft - v / 9;

		v =
			this.bodyJoints.neck.path.position -
			this.bodyJoints.rightShoulder.path.position;
		let posNeckRight = this.bodyJoints.rightShoulder.path.position + v / 1.6;
		v.angle += 90;

		this.bodyJoints.neckRight.path.position = posNeckRight + v / 9;
		// eviter l'intersection des deux cercles vers lke cou
		if (
			this.bodyJoints.neckRight.path.position.isClose(
				this.bodyJoints.neckLeft.path.position,
				20
			)
		) {
			this.bodyJoints.neckRight.path.position.x -= 20;
			this.bodyJoints.neckLeft.path.position.x += 20;
		}

		let interpo = 0.3;
		//LEft Elbow
		this.bodyJoints.leftElbow.path.position = [
			lerp(
				interpo,
				this.bodyJoints.leftElbow.path.position.x,
				pose.leftElbow.x
			),
			lerp(interpo, this.bodyJoints.leftElbow.path.position.y, pose.leftElbow.y)
		];

		this.bodyJoints.leftWrist.path.position = [
			lerp(
				interpo,
				this.bodyJoints.leftWrist.path.position.x,
				pose.leftWrist.x
			),
			lerp(interpo, this.bodyJoints.leftWrist.path.position.y, pose.leftWrist.y)
		];
		this.bodyJoints.rightElbow.path.position = [
			lerp(
				interpo,
				this.bodyJoints.rightElbow.path.position.x,
				pose.rightElbow.x
			),
			lerp(
				interpo,
				this.bodyJoints.rightElbow.path.position.y,
				pose.rightElbow.y
			)
		];
		this.bodyJoints.rightWrist.path.position = [
			lerp(
				interpo,
				this.bodyJoints.rightWrist.path.position.x,
				pose.rightWrist.x
			),
			lerp(
				interpo,
				this.bodyJoints.rightWrist.path.position.y,
				pose.rightWrist.y
			)
		];
		// hanches
		// on ne veut pas que les hanches s'intersecte sinon le calcul des tangentes renvoie un tableau vide

		this.bodyJoints.rightHip.path.position = [
			lerp(
				interpo,
				this.bodyJoints.rightHip.path.position.x,
				pose.rightHip.x + 20
			),
			lerp(
				interpo,
				this.bodyJoints.rightHip.path.position.y,
				pose.rightHip.y - 40
			)
		];
		this.bodyJoints.leftHip.path.position = [
			lerp(
				interpo,
				this.bodyJoints.leftHip.path.position.x,
				pose.leftHip.x - 20
			),
			lerp(
				interpo,
				this.bodyJoints.leftHip.path.position.y,
				pose.leftHip.y - 40
			)
		];

		if (
			this.bodyJoints.rightHip.path.position.isClose(
				this.bodyJoints.leftHip.path.position,
				40
			)
		) {
			this.bodyJoints.rightHip.path.position.x -= 20;
			this.bodyJoints.leftHip.path.position.x += 20;
		}
		//Knee
		this.bodyJoints.rightKnee.path.position = [
			lerp(0.5, this.bodyJoints.rightKnee.path.position.x, pose.rightKnee.x),
			lerp(0.5, this.bodyJoints.rightKnee.path.position.y, pose.rightKnee.y)
		];
		this.bodyJoints.leftKnee.path.position = [
			lerp(0.5, this.bodyJoints.leftKnee.path.position.x, pose.leftKnee.x),
			lerp(0.5, this.bodyJoints.leftKnee.path.position.y, pose.leftKnee.y)
		];

		for (var i = 0; i < this.parts.length; i++) {
			this.parts[i].update();
		}
	}

	isTouchingShape(path) {
		let children = APP.layers.bodyLayer.children;
		for (let i = 0; i < children.length; i++) {
			if (children[i].intersects(path)) {
				return true;
			}
		}
	}
	changeStyle() {}
}
