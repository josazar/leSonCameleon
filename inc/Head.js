/***************************
 *
 *		HEAD
 *
 ****************************/

class Head {
	constructor() {
		this.pathData = {
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
		this.timer = 0;
		this.draw();
	}

	draw() {
		var w = 640;
		var h = 480;
		var HEADRadius = 100;
		// forme ovale de la tête
		this.oval = new Path(this.pathData.pathDataOval);
		this.oval.position = [w / 2, h / 2];
		this.oval.fillColor = colors.skin;
		// nez
		this.nose = new Path(this.pathData.pathDataNose);
		this.nose.position = [this.oval.position.x, this.oval.position.y + 20];
		this.nose.fillColor = colors.purple;

		// Cheveux
		this.hair = new Path(this.pathData.pathDataHair);
		this.hair.position = [this.oval.position.x - 4, this.oval.position.y - 70];
		this.hair.fillColor = colors.purple;

		// Oreilles
		this.oreilleG = new Path(this.pathData.pathDataOreille);
		this.oreilleG.position = [
			this.oval.position.x - 105,
			this.oval.position.y + 17
		];
		this.oreilleG.fillColor = colors.skin;
		this.oreilleD = this.oreilleG.clone();
		this.oreilleD.position = [
			this.oval.position.x + 105,
			this.oval.position.y + 17
		];
		this.oreilleD.scale(-1, 1);

		// Bouche
		this.mouth = new Path(this.pathData.pathDataMouth);
		this.mouth.fillColor = colors.purple;
		this.mouth.position = [this.oval.position.x, this.oval.position.y + 70];

		// sourcil gauche
		this.sourcilG = new Path(this.pathData.pathDataSourcil);
		this.sourcilG.fillColor = colors.purple;
		this.sourcilG.position = [
			this.oval.position.x - 68,
			this.oval.position.y - 35
		];
		// sourcil droit
		this.sourcilD = new Path(this.pathData.pathDataSourcil);
		this.sourcilD.fillColor = colors.purple;
		this.sourcilD.position = [
			this.oval.position.x + 68,
			this.oval.position.y - 35
		];
		this.sourcilD.scale(-1, 1);

		// Yeux
		var eye1_x = w / 2 - HEADRadius / 2 - 10;
		this.eye1 = new Path.Circle([eye1_x, this.oval.position.y], 25);
		this.eyeGroup = new Group(this.eye1, this.eye2);
		this.eyeGroup.style = {
			fillColor: "white",
			strokeColor: colors.purple,
			strokeWidth: 6
		};

		var pupille_1 = new Path.Circle(
			[this.eye1.position.x, this.eye1.position.y],
			8
		);
		pupille_1.fillColor = colors.purple;
		var eyeArea = new Path.Circle(
			[this.eye1.position.x, this.eye1.position.y],
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

		this.groupEyeArea = new Group(
			eyeArea,
			eyeArea2,
			eyeArea3,
			eyeArea4,
			eyeArea5,
			this.eye1,
			pupille_1,
			wink
		);
		this.groupEyeArea2 = this.groupEyeArea.clone();
		this.groupEyeArea2.position.x += 120;
		this.groupEyeArea2.scale(-1, 1);

		// on regroupe tout
		this.headGroup = new Group(
			this.oval,
			this.groupEyeArea,
			this.groupEyeArea2,
			this.eyeGroup,
			this.sourcilD,
			this.sourcilG,
			this.mouth,
			this.oreilleD,
			this.oreilleG,
			this.hair,
			this.nose
		);
	}

	onFrame(event) {
		// animation de la bouche
		//	var ratio = Math.cos(event.time * 5) / 2;
		//	this.oval.segments[1].point.y += ratio / 5;
		this.headGroup.position = [pose.nose.x, pose.nose.y];

		// rotation de la tête
		// vector rightEye et leftEye
		var eyesVector =
			new Point(pose.leftEye.x, pose.leftEye.y) -
			new Point(pose.rightEye.x, pose.rightEye.y);

		this.headGroup.applyMatrix = false;
		this.headGroup.rotation = eyesVector.angle;
		// wink
		this.timer++;
		if (this.timer > 60 * 3) {
			this.timer = 0;
			this.winking();
		}
		// scale de la tête suivant la distance
		/*if (this.getDistEyes() > 30)
			this.headGroup.bounds.size.set(this.getDistEyes() * 4);*/
		this.headGroup.bounds.size.set(150);
	}

	winking() {
		this.groupEyeArea.children[7].visible = true;
		this.groupEyeArea2.children[7].visible = true;
		var _this = this;

		setTimeout(function() {
			_this.groupEyeArea.children[7].visible = false;
			_this.groupEyeArea2.children[7].visible = false;
		}, 400);
		setTimeout(function() {
			_this.groupEyeArea.children[7].visible = true;
			_this.groupEyeArea2.children[7].visible = true;
		}, 800);
		setTimeout(function() {
			_this.groupEyeArea.children[7].visible = false;
			_this.groupEyeArea2.children[7].visible = false;
		}, 950);
	}
	getDistEyes() {
		var pointEye1 = new Point(pose.leftEye.x, pose.leftEye.y);
		var pointEye2 = new Point(pose.rightEye.x, pose.rightEye.y);
		var vector = pointEye2 - pointEye1;

		return vector.length;
	}
}

var HEAD = new Head();
