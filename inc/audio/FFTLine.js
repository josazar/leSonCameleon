class FFTLine {
	constructor(size, distY = 0) {
		this.size = size;
		this.distY = distY;
	}
	createPath() {
		this.FFT_Path = new Path();
		this.FFT_Path.segments = [];
		for (var i = 0; i < this.size; i++) {
			var point = new Point((w / this.size) * i, view.center.y);
			this.FFT_Path.add(point);
		}
		this.FFT_Path.strokeColor = colors.yellow;
		return this.FFT_Path;
	}
	getPath() {
		return this.FFT_Path;
	}
	update(fftValue) {
		for (var i = 0; i < this.size; i++) {
			let posY = map(fftValue[i], 0, -120, 0, h + this.distY);
			this.FFT_Path.segments[i].point.y = posY;
		}
		this.FFT_Path.smooth({ type: "continuous" });
	}
}
