class AudioShape {
	constructor(args) {
		let l = getRandomArbitrary(20, 120);
		let h = getRandomArbitrary(25, 85);
		let rectangle = new Rectangle(new Point(0, 0), new Size(l, h));
		let cornerSize = new Size(10, 10);

		this.starter = args.starter || 0;
		this.path = new Path.Circle({
			center: [0, 0],
			radius: getRandomArbitrary(15, 30),
			fillColor: args.color
		});
		let zis = this;
		/*paper.project.importSVG(args.svg, function(item) {
			zis.path = item; //console.log(item);
			zis.path.fillColor = args.color;
			let x = getRandomArbitrary(300, 600);
			zis.path.position.x = x;
			zis.path.position.y = -200;
		});*/
		let x = getRandomArbitrary(300, 600);
		this.path.position.x = x;
		this.path.position.y = -200;
		this.acceleration = new Point(0, -0.1);
		this.velocity = new Point(0, 0.01);
		this.track = args.track;
		this.moving = false;
	}
	init(pos) {
		this.path.opacity = 1;
		this.path.position = pos;
		this.acceleration = new Point(0, -0.1);
	}

	update(timer) {
		if (this.starter < timer) {
			this.moving = true;
			this.acceleration += this.velocity;
			this.path.position += this.acceleration;
		}
	}
}
