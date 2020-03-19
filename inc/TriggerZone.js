/*
    Author: Joseph AZAR
    Date: 2020 02 20

    L'idée ici de trouver un mécanisme pour que mon app de reconnaissance de mouvement 
    puisse activer une action sans cliquer sur la souris, mais en positionnant 
    sa main sur une zone d'action
    et de faire un grand geste pour tracer un trait
    Le trait sera utilisé pour couper des objets. 
    En gros si pendant une ou deux seconde on remarque que la main est positionnée dans une même 
    zone, et que l'on fait un long mouvement, alors on trace un trait. 
*/

/* Zone de déclenchement du geste */

class TriggerZone {
	constructor() {
		this.active = false;
		this.position = mousePosVirtual;
		this.timer = 0;
		this.timerToTrigger = 1000;
		this.radius = 50;
		this.path = this.draw();
		this.debug = false;
	}
	draw() {
		let circle = new Path.Circle({
			center: this.position,
			radius: this.radius,
			strokeColor: "black"
		});
		if (!this.debug) circle.strokeWidth = 0;
		circle.dashArray = [10, 4];

		return circle;
	}
	udpateG() {
		this.timer++;

		if (this.checkIfOutOfZone()) {
			this.timer = 0;
			this.path.strokeColor = "black";
			this.path.strokeWidth = 1;

			if (this.debug) this.path.strokeWidth = 1;
			else this.path.strokeWidth = 0;
			this.position = mousePosVirtual;
			this.path.position = mousePosVirtual;

			// la ligne est créé
			if (APP.lineCut.path != undefined) {
				APP.lineCut.path.lastSegment.point = mousePosVirtual;

				// si le trait de coupe est assez long
				if (APP.lineCut.path.length > 200 && this.active) {
					for (let i = 0; i < APP.blobs.length; i++) {
						let isIntersections = APP.blobs[i].isIntersect(APP.lineCut.path);
						if (isIntersections && !APP.blobs[i].splitted) {
							APP.blobs[i].split(APP.lineCut.path);
						}
					}

					this.active = false;
				}
			}
		}

		if (this.timer > 5) {
			this.active = true;
			// on modifie la couleur de la zone
			if (this.debug) {
				this.path.strokeColor = "red";
				this.path.strokeWidth = 4;
			}
			// on créé le trait
			if (APP.lineCut.path == undefined) {
				APP.lineCut = new LineCut(mousePosVirtual, mousePosVirtual);
			} else {
				APP.lineCut.path.firstSegment.point = mousePosVirtual;
				APP.lineCut.path.lastSegment.point = mousePosVirtual;
			}
		}
	}
	checkIfOutOfZone() {
		let dist = this.path.position - mousePosVirtual;
		return dist.length > this.radius;
	}
}
