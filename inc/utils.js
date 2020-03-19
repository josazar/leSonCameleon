function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

// Méthodes utiles (merci barradeau)
function lerp(t, a, b) {
	return a * (1 - t) + t * b;
}
function norm(t, a, b) {
	return (t - a) / (b - a);
}
function map(t, a0, b0, a1, b1) {
	return lerp(norm(t, a0, b0), a1, b1);
}

/**
 *
 * @param {*} n : Segments number
 */
function customPath(n) {
	var path = new Path();
	for (var i = 0; i < n; i++) {
		path.add(new Point(0, 0));
	}

	return path;
}

function getCircleTangents(x1, y1, r1, x2, y2, r2) {
	// http://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Tangents_between_two_circles
	var d_sq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	if (d_sq <= (r1 - r2) * (r1 - r2)) return null;
	var d = Math.sqrt(d_sq);
	var vx = (x2 - x1) / d;
	var vy = (y2 - y1) / d;
	var res = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];
	var i = 0;
	for (var sign1 = 1; sign1 >= -1; sign1 -= 2) {
		var c = (r1 - sign1 * r2) / d;
		if (c * c > 1.0) continue;
		var h = Math.sqrt(Math.max(0.0, 1.0 - c * c));
		for (var sign2 = 1; sign2 >= -1; sign2 -= 2) {
			var nx = vx * c - sign2 * h * vy;
			var ny = vy * c + sign2 * h * vx;
			var a = res[i++];
			a[0] = x1 + r1 * nx;
			a[1] = y1 + r1 * ny;
			a[2] = x2 + sign1 * r2 * nx;
			a[3] = y2 + sign1 * r2 * ny;
		}
	}
	return res;
}
