class LineCut {
	constructor(ptA, ptB) {
		this.debug = true;
		let layer = new Layer();
		layer.name = "linecut";
		layer.activate();
		this.path = new Path.Line({
			from: [ptA.x, ptA.y],
			to: [ptB.x, ptB.y],
			strokeColor: "white",
			strokeWidth: 0
		});
		if (this.debug) {
			this.path.strokeWidth = 4;
		}
		this.path.selected = false;
	}
	hide() {
		this.path.opacity = 0;
	}
	show() {
		this.path.opacity = 1;
	}
}
