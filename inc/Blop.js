class Blop {
	constructor(pathItem) {
		this.path = pathItem;
		let p = this.path;
		this.intersections = {};
		this.splitted = false;
		this.directionDistance = 45;
	}
	split(cutPath) {
		this.splitted = true;
		let splitPath = this.path.divide(cutPath, { stroke: true });

		let vector = cutPath.lastSegment.point - cutPath.firstSegment.point;

		splitPath.children.forEach((item, i) => {
			let vectorDir = this.getVectorDir(cutPath, item.segments[1]);
			// si je fais pas une 1ere translation, ici d'un pixel, ca bug... ne sais pas pourquoi
			item.translate(vectorDir.x, vectorDir.y);
			item.closed = true;
			let path = new Path({
				segments: item.segments,
				fillColor: "#87c7b6",
				closed: true
			});

			path.tween(
				{
					"position.x": path.position.x + vectorDir.x * this.directionDistance,
					"position.y": path.position.y + vectorDir.y * this.directionDistance
				},
				{
					easing: "easeInOutCubic",
					duration: 500
				}
			);
			// ajout aux blobs
			APP.blobs.push(new Blop(path));
		});
		// Remove
		splitPath.remove();
		this.path.remove();
	}

	// Le projeté orthogonal du point M sur la droite A-B nous donne D
	// on souhaite le vecteur D>M
	// label : Point / segment des sections splités
	// PtA : FirstSegment
	// PtB : lastSegment
	// PtM : secondSegment
	// PtD : Pied de la hauteur issue du sommet M ou projeté orthogonal du point M sur la droite A-B
	//
	// A--D-----B
	//    |
	//    |
	//    M
	//
	// retourne le vecteur D>M sa direction va définir vers quelle diretion repousser le segment
	// résultant du split de la forme
	//
	// En fait c'est top car Paper.js a une super méthode : getNearestPoint(point) du coup
	// comme le projeté ortho est le point le plus proche sur une ligne !! on a ce qu'il faut.
	getVectorDir(baseVector, ptM) {
		let D = baseVector.getNearestPoint(ptM.point);
		let vectorDir = ptM.point - D;
		vectorDir.length = 1;
		return vectorDir;
	}
	isIntersect(path2) {
		this.intersections = this.path.getIntersections(path2);
		return this.intersections.length > 1;
	}
}
