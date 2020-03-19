/**
 * HandMover
 *
 * Main qui va 'aimanter" les objets Blop
 */

class HandMover {
	constructor(root) {
		this.root = root;
		this.position = root.path.position || new Point(0, 0);
		this.radius = 50;
		this.pathMagnetized = {};
	}
	onFrame(event) {
		// update pos
		this.position = this.root.path.position;

		// on boucle sur tous les paths Blop
		for (let i = 0; i < APP.blobs.length; i++) {
			if (this.isCloseFrom(APP.blobs[i].path)) {
				// on magnetise le blobs
				APP.blobs[i].path.position = this.position;
			}
		}
	}
	isCloseFrom(path) {
		return this.position.isClose(path.position, this.radius);
	}
}
