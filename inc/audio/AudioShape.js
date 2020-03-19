class AudioShape {
	/**
	 *
	 * @param {*} args
	 *  track
	 *  path
	 *  color
	 */
	constructor(args) {
		let l = getRandomArbitrary(20, 120);
		let h = getRandomArbitrary(25, 85);
		let rectangle = new Rectangle(new Point(0, 0), new Size(l, h));
		let cornerSize = new Size(10, 10);
		this.path = new Path.Rectangle(rectangle, cornerSize);
		this.starter = args.starter || 0;
		this.path.fillColor = args.color;
		this.track = args.track;
		this.acceleration = new Point(0, -0.1);
		this.velocity = new Point(0, 0.05);
		this.moving = false;
	}
	init(pos) {
		this.path.position = pos;
		this.acceleration = new Point(0, -0.1);
		this.velocity = new Point(0, 0.05);
	}

	update(timer) {
		if (this.starter < timer) {
			this.moving = true;
			this.acceleration += this.velocity;
			this.path.position += this.acceleration;
		}
	}
}
