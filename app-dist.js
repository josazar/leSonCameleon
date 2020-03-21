"use strict";

var colors = {
  purple: "#624c63",
  skin: "#b9adb9",
  green: "#2ea496",
  rose: "#d579a0",
  bg: "#2e2b36",
  blue: "#5dbfe6",
  yellow: "#f9eb71"
};
const APP = {
  lineCut: {},
  blobs: [],
  audioShapes: [],
  handRightMover: {},
  layers: {},
  scenes: {},
  ratio: 1,
  loader: {},
  truchetPattenIsActive: false,
  state: "" // "inGame" "home" "loading"

};
let w = document.body.clientWidth;
let h = document.body.clientHeight;
let mousePosVirtual = new Point(0, 0);
var video;
var poseNet;
var pose;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
} // Méthodes utiles (merci barradeau)


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
  var res = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
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

class Loader {
  constructor() {
    this.poseNetLoaded = false;
    this.audioLoaded = false;
    this.complete = false;
  }

  startLoaderAudio() {
    // Quand le buffer global est completement chargé
    Tone.Buffer.on("load", () => {
      console.log("Sample is loaded");
      APP.scenes.toneBufferTxt.innerHTML = "Audio loaded ✔";
      this.audioLoaded = true;
    });
    Tone.Buffer.on("progress", () => {
      var totalProgress = 0;

      for (var i = 0; i < Tone.Buffer._downloadQueue.length; i++) {
        totalProgress += Tone.Buffer._downloadQueue[i].progress;
      }

      APP.scenes.toneBufferTxt.innerHTML = totalProgress / Tone.Buffer._downloadQueue.length * 100 + "%";
    });
  }

  update() {
    if (this.poseNetLoaded && this.audioLoaded && !this.complete) this.onComplete();
  }

  onComplete() {
    this.complete = true;
    console.log("** LOADING COMPLETE **"); // PAge d'accueil

    APP.scenes.launchHome();
  }

}

class ScenesManager {
  constructor() {
    this.homeDiv = document.getElementById("Home");
    this.inGameDiv = document.getElementById("InGame");
    this.loaderDiv = document.getElementById("Loader");
    this.toneBufferTxt = document.getElementById("ToneBuffer");
    this.footer = document.getElementById("Footer"); // Boutons

    this.startBtn = document.getElementById("startBtn");
    this.backBtn = document.getElementById("backBtn"); // Event listeners

    this.startBtn.addEventListener("mouseup", () => {
      this.launchGame();
    });
    this.backBtn.addEventListener("mouseup", () => {
      this.stopGame();
      this.launchHome();
    });
  }

  hide(element) {
    element.classList.remove("active");
  }

  show(element) {
    element.classList.add("active");
  }

  launchHome() {
    APP.state = "home";
    this.show(this.homeDiv);
    this.show(this.footer);
    this.hide(this.loaderDiv);
    this.hide(this.inGameDiv);
  }

  launchGame() {
    APP.state = "inGame";
    this.hide(this.homeDiv);
    this.hide(this.footer);
    this.show(this.inGameDiv); // Body

    APP.layers.bodyLayer.opacity = 1;
    APP.layers.FFTLine.opacity = 1; //APP.layers.blops.opacity = 1;

    APP.layers.audioShapes.opacity = 1;
    APP.AudioCtrl.start();
  }

  stopGame() {
    // Body
    APP.layers.bodyLayer.opacity = 0;
    APP.layers.FFTLine.opacity = 0; //APP.layers.blops.opacity = 0;

    APP.layers.audioShapes.opacity = 0;
    APP.AudioCtrl.stop();
    deleteTruchetPattern();
  }

}

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
    let splitPath = this.path.divide(cutPath, {
      stroke: true
    });
    let vector = cutPath.lastSegment.point - cutPath.firstSegment.point;
    splitPath.children.forEach((item, i) => {
      let vectorDir = this.getVectorDir(cutPath, item.segments[1]); // si je fais pas une 1ere translation, ici d'un pixel, ca bug... ne sais pas pourquoi

      item.translate(vectorDir.x, vectorDir.y);
      item.closed = true;
      let path = new Path({
        segments: item.segments,
        fillColor: "#87c7b6",
        closed: true
      });
      path.tween({
        "position.x": path.position.x + vectorDir.x * this.directionDistance,
        "position.y": path.position.y + vectorDir.y * this.directionDistance
      }, {
        easing: "easeInOutCubic",
        duration: 500
      }); // ajout aux blobs

      APP.blobs.push(new Blop(path));
    }); // Remove

    splitPath.remove();
    this.path.remove();
  } // Le projeté orthogonal du point M sur la droite A-B nous donne D
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
    if (this.debug) strokeW = 1; // Tangents Circles

    let nbSegments = 4;

    for (let i = 0; i < nbSegments; i++) {
      this.segments.push(new Path.Circle({
        center: [-90, -90],
        radius: 3,
        strokeColor: "red",
        strokeWidth: strokeW
      }));
    } // PATH


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
    return getCircleTangents(jt1.getPosX(), jt1.getPosY(), jt1.radius, jt2.getPosX(), jt2.getPosY(), jt2.radius);
  }

}

class BodyPartTorso extends BodyPart {
  init() {
    APP.layers.bodyLayer.addChild(this.path);
    var p = this.path;
    let strokeW = 0;
    if (this.debug) strokeW = 1; // Tangents Circles

    let nbSegments = 14;

    for (let i = 0; i < nbSegments; i++) {
      this.segments.push(new Path.Circle({
        center: [0, 10],
        radius: 3,
        strokeColor: "red",
        strokeWidth: strokeW
      }));
    } // PATH


    for (var i = 0; i < this.segments.length; i++) {
      p.add(new Point(this.segments[i].position));
    }
  }

  update() {
    let nbTangents = 7;

    for (let i = 0; i < nbTangents; i++) {
      if (i == nbTangents - 1) {
        this.tangents[i] = this.getJointCircleTangents(this.joints[i], this.joints[0]);
      } else {
        this.tangents[i] = this.getJointCircleTangents(this.joints[i], this.joints[i + 1]);
      }

      if (this.tangents[i] == null) return;
    }

    let segItem = 0;

    for (let j = 0; j < nbTangents; j++) {
      this.segments[segItem].position = [this.tangents[j][0][0], this.tangents[j][0][1]];
      segItem++;
      this.segments[segItem].position = [this.tangents[j][0][2], this.tangents[j][0][3]];
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
      torso: ["leftShoulder", "neckLeft", "neck", "neckRight", "rightShoulder", "rightHip", "leftHip"],
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
    console.log("init Body"); // Calquesc

    APP.layers.baseLayer = new Layer();
    APP.layers.baseLayer.name = "base";
    APP.layers.bodyLayer = new Layer();
    APP.layers.bodyLayer.name = "body";
    APP.layers.baseLayer.activate(); // Init des Joints (Cercles)
    // bras gauche

    this.bodyJoints.leftShoulder = new BodyJoint(this.shoulderRadius, colors.skin);
    this.bodyJoints.leftElbow = new BodyJoint(this.ElbowRadius, colors.skin);
    this.bodyJoints.leftWrist = new BodyJoint(this.wristRadius, colors.skin); // Neck cou

    this.bodyJoints.neck = new BodyJoint(this.neckRadius, colors.skin); // Neck Left cou

    this.bodyJoints.neckLeft = new BodyJoint(this.neckSideRadius, colors.skin); // Neck Right cou

    this.bodyJoints.neckRight = new BodyJoint(this.neckSideRadius, colors.skin); // bras droit

    this.bodyJoints.rightShoulder = new BodyJoint(this.shoulderRadius, colors.skin);
    this.bodyJoints.rightElbow = new BodyJoint(this.ElbowRadius, colors.skin);
    this.bodyJoints.rightWrist = new BodyJoint(this.wristRadius, colors.skin); // Hip = hanches

    this.bodyJoints.rightHip = new BodyJoint(this.hipRadius, colors.skin);
    this.bodyJoints.leftHip = new BodyJoint(this.hipRadius, colors.skin); // Knee = genou

    this.bodyJoints.leftKnee = new BodyJoint(this.kneeRadius, colors.skin);
    this.bodyJoints.rightKnee = new BodyJoint(this.kneeRadius, colors.skin); // Draw Body Parts

    this.drawArms();
    this.drawTorso();
    this.drawLegs();
  }

  drawArms() {
    var leftUpperArm = new BodyPart("leftUpperArm", [this.bodyJoints[this.partsDef.leftUpperArm[0]], this.bodyJoints[this.partsDef.leftUpperArm[1]]], colors.skin);
    leftUpperArm.init();
    this.parts.push(leftUpperArm);
    var leftLowerArm = new BodyPart("leftLowerArm", [this.bodyJoints[this.partsDef.leftLowerArm[0]], this.bodyJoints[this.partsDef.leftLowerArm[1]]], colors.skin);
    leftLowerArm.init();
    this.parts.push(leftLowerArm);
    var rightUpperArm = new BodyPart("rightUpperArm", [this.bodyJoints[this.partsDef.rightUpperArm[0]], this.bodyJoints[this.partsDef.rightUpperArm[1]]], colors.skin);
    rightUpperArm.init();
    this.parts.push(rightUpperArm);
    var rightLowerArm = new BodyPart("rightLowerArm", [this.bodyJoints[this.partsDef.rightLowerArm[0]], this.bodyJoints[this.partsDef.rightLowerArm[1]]], colors.skin);
    rightLowerArm.init();
    this.parts.push(rightLowerArm);
  }

  drawTorso() {
    var torso = new BodyPartTorso("torso", [this.bodyJoints[this.partsDef.torso[0]], this.bodyJoints[this.partsDef.torso[1]], this.bodyJoints[this.partsDef.torso[2]], this.bodyJoints[this.partsDef.torso[3]], this.bodyJoints[this.partsDef.torso[4]], this.bodyJoints[this.partsDef.torso[5]], this.bodyJoints[this.partsDef.torso[6]]], colors.skin);
    torso.init();
    this.parts.push(torso);
  }

  drawLegs() {
    // rightUpperLeg
    var rightUpperLeg = new BodyPart("rightUpperLeg", [this.bodyJoints[this.partsDef.rightUpperLeg[0]], this.bodyJoints[this.partsDef.rightUpperLeg[1]]], colors.skin);
    rightUpperLeg.init();
    this.parts.push(rightUpperLeg); // leftUpperLeg

    var leftUpperLeg = new BodyPart("leftUpperLeg", [this.bodyJoints[this.partsDef.leftUpperLeg[0]], this.bodyJoints[this.partsDef.leftUpperLeg[1]]], colors.skin);
    leftUpperLeg.init();
    this.parts.push(leftUpperLeg);
  }

  onFrame() {
    // BodyJoints
    this.bodyJoints.leftShoulder.path.position = [lerp(0.5, this.bodyJoints.leftShoulder.path.position.x, pose.leftShoulder.x), lerp(0.5, this.bodyJoints.leftShoulder.path.position.y, pose.leftShoulder.y)];
    this.bodyJoints.rightShoulder.path.position = [lerp(0.5, this.bodyJoints.rightShoulder.path.position.x, pose.rightShoulder.x), lerp(0.5, this.bodyJoints.rightShoulder.path.position.y, pose.rightShoulder.y)]; // De profil les Joints se superpose, et le calcul des tangentes renvoie des valeurs null donc on repousse les joints dans ce cas

    if (this.bodyJoints.leftShoulder.path.position.isClose(this.bodyJoints.rightShoulder.path.position, 60)) {
      this.bodyJoints.leftShoulder.path.position.x = this.bodyJoints.rightShoulder.path.position.x + 70;
    } // le joint du cou
    // vecteur de rightShoulder + leftShoulder


    let v = this.bodyJoints.leftShoulder.path.position - this.bodyJoints.rightShoulder.path.position;
    let posNeckBottom = this.bodyJoints.leftShoulder.path.position - v / 2;
    v.angle -= 90;
    this.bodyJoints.neck.path.position = posNeckBottom + v / 2; // neckLeft & neckRight

    v = this.bodyJoints.neck.path.position - this.bodyJoints.leftShoulder.path.position;
    let posNeckLeft = this.bodyJoints.leftShoulder.path.position + v / 1.6;
    v.angle += 90;
    this.bodyJoints.neckLeft.path.position = posNeckLeft - v / 9;
    v = this.bodyJoints.neck.path.position - this.bodyJoints.rightShoulder.path.position;
    let posNeckRight = this.bodyJoints.rightShoulder.path.position + v / 1.6;
    v.angle += 90;
    this.bodyJoints.neckRight.path.position = posNeckRight + v / 9; // eviter l'intersection des deux cercles vers lke cou

    if (this.bodyJoints.neckRight.path.position.isClose(this.bodyJoints.neckLeft.path.position, 20)) {
      this.bodyJoints.neckRight.path.position.x -= 20;
      this.bodyJoints.neckLeft.path.position.x += 20;
    }

    let interpo = 0.3; //LEft Elbow

    this.bodyJoints.leftElbow.path.position = [lerp(interpo, this.bodyJoints.leftElbow.path.position.x, pose.leftElbow.x), lerp(interpo, this.bodyJoints.leftElbow.path.position.y, pose.leftElbow.y)];
    this.bodyJoints.leftWrist.path.position = [lerp(interpo, this.bodyJoints.leftWrist.path.position.x, pose.leftWrist.x), lerp(interpo, this.bodyJoints.leftWrist.path.position.y, pose.leftWrist.y)];
    this.bodyJoints.rightElbow.path.position = [lerp(interpo, this.bodyJoints.rightElbow.path.position.x, pose.rightElbow.x), lerp(interpo, this.bodyJoints.rightElbow.path.position.y, pose.rightElbow.y)];
    this.bodyJoints.rightWrist.path.position = [lerp(interpo, this.bodyJoints.rightWrist.path.position.x, pose.rightWrist.x), lerp(interpo, this.bodyJoints.rightWrist.path.position.y, pose.rightWrist.y)]; // hanches
    // on ne veut pas que les hanches s'intersecte sinon le calcul des tangentes renvoie un tableau vide

    this.bodyJoints.rightHip.path.position = [lerp(interpo, this.bodyJoints.rightHip.path.position.x, pose.rightHip.x + 20), lerp(interpo, this.bodyJoints.rightHip.path.position.y, pose.rightHip.y - 40)];
    this.bodyJoints.leftHip.path.position = [lerp(interpo, this.bodyJoints.leftHip.path.position.x, pose.leftHip.x - 20), lerp(interpo, this.bodyJoints.leftHip.path.position.y, pose.leftHip.y - 40)];

    if (this.bodyJoints.rightHip.path.position.isClose(this.bodyJoints.leftHip.path.position, 40)) {
      this.bodyJoints.rightHip.path.position.x -= 20;
      this.bodyJoints.leftHip.path.position.x += 20;
    } //Knee


    this.bodyJoints.rightKnee.path.position = [lerp(0.5, this.bodyJoints.rightKnee.path.position.x, pose.rightKnee.x), lerp(0.5, this.bodyJoints.rightKnee.path.position.y, pose.rightKnee.y)];
    this.bodyJoints.leftKnee.path.position = [lerp(0.5, this.bodyJoints.leftKnee.path.position.x, pose.leftKnee.x), lerp(0.5, this.bodyJoints.leftKnee.path.position.y, pose.leftKnee.y)];

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
      if (this.debug) this.path.strokeWidth = 1;else this.path.strokeWidth = 0;
      this.position = mousePosVirtual;
      this.path.position = mousePosVirtual; // la ligne est créé

      if (APP.lineCut.path != undefined) {
        APP.lineCut.path.lastSegment.point = mousePosVirtual; // si le trait de coupe est assez long

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
      this.active = true; // on modifie la couleur de la zone

      if (this.debug) {
        this.path.strokeColor = "red";
        this.path.strokeWidth = 4;
      } // on créé le trait


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
    this.position = this.root.path.position; // on boucle sur tous les paths Blop

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
/**
 *  Truchet Class
 *  Generates Truchet compositions based on the original ones as described in "Description des Metiers" (Sebastien Truchet, 1705)
 *  See [http://jacques-andre.fr/faqtypo/truchet/truchet-planches.pdf]
 */


class Truchet {
  constructor() {
    //The alphabet employed by Truchet in order to generate the name of the different rules
    this.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "V", "U", "X", "Y", "Z"];
  }
  /**
   *  Creates a new set of rules. This was reeaally boring. @_@
   *  If I was smarter I would have discovered some magic mathematics behind all, maybe the origin of the universe.
   *  But I'm not.
   */


  createRules(a, b, c, d) {
    let int = [//Premiere planche
    //A
    [[a, c], [c, a]], //B
    [[c], [a]], //C
    [[c]], //D
    [[a, c, c], [c, a, c], [c, c, a]], //E
    [[c, a, a, c]], //F
    [[a, c], [c, a], [c, a], [a, c]], //G
    [[a, b], [d, c]], //H
    [[a, b, c, d], [b, a, d, c], [c, d, a, b], [d, c, b, a]], //I
    [[c, b], [d, a]], //K
    [[a, d, c, b], [b, c, d, a], [c, b, a, d], [d, a, b, c]], //L
    [[c, d], [b, c, d, a], [c, b, a, d], [b, a]], //M
    [[a, b], [b, a]], //Seconde planche
    //N
    [[a, d], [c, b]], //O
    [[a, b], [c, d]], //P
    [[a, b, c, d], [c, d, a, b]], //Q
    [[c, c, d, d], [a, a, b, b]], //R
    [[a, c, d, b], [a, c, d, b]], //S
    [[c, c, b, b, c, c, d, d, a, a, d, d], [a, a, d, d, a, a, b, b, c, c, b, b]], //T
    [[a, b, c, d]], //V
    [[c, d, c, d, a, b, a, b], [a, b, a, b, c, d, c, d]], //U
    [[c, d]], //X
    [[a, a, b, b, c, c, d, d], [a, a, b, b, c, c, d, d], [b, b, a, a, d, d, c, c], [b, b, a, a, d, d, c, c]], //Y
    [[c, c, d, d], [c, c, d, d], [b, b, a, a], [b, b, a, a]], //Z
    [[a, d, c, b, c, b], [b, c, d, a, d, a], [c, b, a, d, a, d], [d, a, b, c, b, c], [c, b, a, d, a, d], [d, a, b, c, b, c]], // Troiseme planche
    //Aa
    [[a, c, b, d], [c, a, d, b]], //Ba
    [[d, c, a, b, d, c], [b, d, c, d, c, a]], //Ca
    [[a, c, d, b], [c, a, b, d]], //Da
    [[d, c, a, b], [c, a, b, d]], //Ea
    [[a, c, b, d]], //Fa
    [[d, c, a], [b, d, c]], //Ga
    [[c, d, c, d, a, b, a, b], [b, d, c, a, d, d, c, c], [c, a, b, d, a, a, b, b], [b, a, b, a, d, c, d, c], [a, b, a, b, c, d, c, d], [d, d, c, c, b, d, c, a], [a, a, b, b, c, a, b, d], [d, c, d, c, b, a, b, a]], //Ha
    [[a, c, c, a], [c, a, a, c], [c, a, a, c], [a, c, c, a]], //Ia
    [[a, c, d, b], [a, a, b, b], [d, d, c, c], [d, b, a, c]], //Ka
    [[c, d], [b, c]], //La
    [[c, d, c, d, a, b, a, b], [b, c, d, a, d, a, b, c], [c, b, a, d, a, d, c, b], [b, a, b, a, d, c, d, c], [a, b, a, b, c, d, c, d], [d, a, b, c, b, c, d, a], [a, d, c, b, c, b, a, d], [d, c, d, c, b, a, b, a]], //Ma
    [[c, d, a, b], [b, c, d, a]], // Quatrieme planche
    //Na
    [[b, d], [b, a]], //Oa
    [[a, c, d, c], // ...#hiiighway to hell#...
    [d, c, a, b]], //Pa
    [[a, b, c], [c, a, b], [b, c, a]], //Qa
    [[a, b, b, a, a, b], [d, d, c, d, c, c]], //Ra
    [[a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a], [a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a], [c, d, c, d, a, b, a, b], [b, a, b, a, d, c, d, c], [c, d, c, d, a, b, a, b], [b, a, b, a, d, c, d, c]], //Sa
    [[a, b, b, a, a, b], [d, d, c, d, c, c], [a, a, b, a, b, b], [d, c, c, d, d, c]], //Ta
    [[a, c, d], [d, c, a], [c, a, b], [b, a, c]], //Va
    [[a, b, a, b, c, d, c, d], [a, d, c, b, c, b, a, d]], //Ua  --> Slightly different to Truchet's original one, to avoid a bigger chunk than necessary
    [[a, b, c, d], [d, b, b, d], [d, c, b, a]], //Xa
    [[d, c, d, c, b, a, b, a], [a, c, d, b, c, a, b, d], [d, b, a, c, b, d, c, a], [a, b, a, b, c, d, c, d], [b, a, b, a, d, c, d, c], [c, a, b, d, a, c, d, b], [b, d, c, a, d, b, a, c], [c, d, c, d, a, b, a, b]], //Ya
    [[a, c, d, b, c, a, b, d], [a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a], [a, c, d, b, c, a, b, d], [a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a]], //Za
    [[c, c, d, d, a, a, b, b], [b, b, a, a, d, d, c, c], [c, a, b, d, a, c, d, b], [b, d, c, a, d, b, a, c]], //Cinquieme planche
    //Ab
    [[a, c, c, d, c, a], [c, c, a, a, b, a], [c, a, a, c, c, d], [b, a, c, c, a, a], [c, d, c, a, a, c], [a, a, b, a, c, c]], //Bb
    [[c, b, d, b, a, b, d, b], [b, d, b, a, b, d, b, c], [d, b, a, b, d, b, c, b], [b, a, b, d, b, c, b, d], [a, b, d, b, c, b, d, b], [b, d, b, c, b, d, b, a], [d, b, c, b, d, b, a, b], [b, c, b, d, b, a, b, d]], //Cb
    [[a, a, b, a, a, c, d, c], [a, c, c, d, c, c, a, b], [d, c, a, a, b, a, a, c], [a, b, a, c, c, d, c, c], [a, c, d, c, a, a, b, a], [c, c, a, b, a, c, c, d], [b, a, a, c, d, c, a, a], [c, d, c, c, a, b, a, c]], //Db
    [[c, a, d, b, c, a, b, d], [a, d, b, c, a, b, d, c], [d, b, c, a, b, d, c, a], [b, c, a, b, d, c, a, d], [c, a, b, d, c, a, d, b], [a, b, d, c, a, d, b, c], [b, d, c, a, d, b, c, a], [d, c, a, d, b, c, a, b]], //Eb
    [[a, c, d, b], [b, a, c, d], [d, b, a, c], [c, d, b, a]], //Fb
    [[c, a, d], [a, d, c], [d, c, a]], //Gb
    [[a, c, d, b], [b, d, c, a]], //Hb
    [[a, c, d, b], [d, b, a, c]], //Ib
    [[a, c, d, b, c, a, b, d], [d, b, a, c, b, d, c, a], [c, a, b, d, a, c, d, b], [b, d, c, a, d, b, a, c]], //Kb
    [[a, c, b, d], [c, a, d, b], [d, b, c, a], [b, d, a, c]], //Lb
    [[a, c, d, b], [c, a, b, d], [b, d, c, a], [d, b, a, c]], //Mb
    [[a, c, b, d, c, a, d, b], [c, a, d, b, a, c, b, d], [b, d, a, c, d, b, c, a], [d, b, c, a, b, d, a, c], [c, a, d, b, a, c, b, d], [a, c, b, d, c, a, d, b], [d, b, c, a, b, d, a, c], [b, d, a, c, d, b, c, a]], //Sixieme planche
    //Nb
    [[c, c, a, b], [b, b, a, c]], //Ob
    [[a, b, c, d], [c, a, a, c]], //Pb
    [[a, d, b, c], [d, b, c, b]], //Qb
    [[a, a, b, b, c, c, d, d], [c, d, c, d, a, b, a, b], [b, a, b, a, d, c, d, c], [c, c, d, d, a, a, b, b], [a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a]], //Rb
    [[a, c, d, c, d, b], [c, a, c, d, b, d], [b, d, b, a, c, a], [d, b, a, b, a, c]], //Sb
    [[d, c, c, d], [b, a, b, a], [c, d, c, d], [b, a, a, b]], //Tb
    [[a, b, d], [c, a, b], [a, d, c]], //Vb
    [[b, b, c, d], [b, c, a, c]], //Ub
    [[a], [d, a, b, c], [d, d, b, b], [a, a, c, c], [a, d, c, b], [d]], //Xb
    [[a, c, d, b, c, a, b, d], [c, d, c, d, a, b, a, b], [b, a, b, a, d, c, d, c], [d, b, a, c, b, d, c, a], [c, a, b, d, a, c, d, b], [a, b, a, b, c, d, c, d], [d, c, d, c, b, a, b, a], [b, d, c, a, d, b, a, c]], //Yb
    [[d, d, b, a, b, a, c, c], [a, b, c, a, b, d, a, b], [c, a, d, c, d, c, b, d], [c, d, b, b, a, a, c, d], [b, a, c, c, d, d, b, a], [b, d, a, b, a, b, c, a], [d, c, b, d, c, a, d, c], [a, a, c, d, c, d, b, b]], //Zb
    [[a, c, b, a, d, b, c, a, d, c, b, d], [c, a, d, c, b, d, a, c, b, a, d, b], [d, b, a, b, a, c, b, d, c, d, c, a], [a, c, d, c, d, b, c, a, b, a, b, d], [b, d, a, b, c, a, d, b, c, d, a, c], [d, b, c, d, a, c, b, d, a, b, c, a], [c, a, d, c, b, d, a, c, b, a, d, b], [a, c, b, a, d, b, c, a, d, c, b, d], [b, d, c, d, c, a, d, b, a, b, a, c], [c, a, b, a, b, d, a, c, d, c, d, b], [d, b, c, d, a, c, b, d, a, b, c, a], [b, d, a, b, c, a, d, b, c, d, a, c]], //Septieme planche
    //Ac
    [[c, d, c, d, a, a, b, b], [b, b, a, a, d, c, d, c]], //Bc
    [[c, d, c, d, d, c], [b, d, c, a, b, a], [a, b, a, b, d, c], [d, b, a, c, b, a]], //Cc
    [[c, c, b, a, d, c, b, b], [b, a, d, d, a, a, d, c]], //Dc
    [[a, c, d, b, c, a, b, d], [b, a, b, a, d, c, d, c], [c, d, c, d, a, b, a, b], [d, b, a, c, b, d, c, a], [c, a, b, d, a, c, d, b], [d, c, d, c, b, a, b, a], [a, b, a, b, c, d, c, d], [b, d, c, a, d, b, a, c]], //Ec
    [[c, d, c, d, a, b, a, b], [b, d, a, a, d, b, c, c], [c, c, b, d, a, a, d, b], [b, a, b, a, d, c, d, c], [a, b, a, b, c, d, c, d], [d, b, c, c, b, d, a, a], [a, a, d, b, c, c, b, d], [d, c, d, c, b, a, b, a]], //Fc
    [[a, b, a, b, c, d, c, d], [b, d, c, a, d, b, a, c], [c, a, b, d, a, c, d, b], [d, c, d, c, b, a, b, a], [c, d, c, d, a, b, a, b], [d, b, a, c, b, d, c, a], [a, c, d, b, c, a, b, d], [b, a, b, a, d, c, d, c]], //Gc
    [[b, d, b, c, d, b, b, a], [c, d, a, b, a, d, a, d], [b, a, b, d, b, c, d, b], [a, d, c, d, a, b, a, d], [d, b, b, a, b, d, b, c], [a, d, a, d, c, d, a, b], [b, c, d, b, b, a, b, d], [a, b, a, d, a, d, c, d]], //Hc
    [[a, c, b], [d, a, b], [c, b, d], [a, c, d], [c, b, a], [a, b, d], [b, d, c], [c, d, a], [b, a, c], [b, d, a], [d, c, b], [d, a, c]], //Ic
    [[c, c, b, d], [a, a, b, d], [b, d, c, c], [b, d, a, a]], //Kc
    [[c, a, b], [d, c, a]], //Lc
    [[b, a, d, a, b, c], [a, b, b, b, a, a]], //Mc
    [[d, c, b, a], [d, c, b, a], [b, a, d, c], [b, a, d, c]], //Huitieme planche
    //Nc
    [[c, a, d, c, b, d], [a, c, a, b, d, b], [b, a, c, d, b, a], [c, d, b, a, c, d], [d, b, d, c, a, c], [b, d, a, b, c, a]], //Oc
    [[a, b, d, b, d, c, a, c], [d, c, a, c, a, b, d, b], [b, a, c, a, c, d, b, d], [d, c, a, c, a, b, d, b], [b, a, c, a, c, d, b, d], [c, d, b, d, b, a, c, a], [a, b, d, b, d, c, a, c], [c, d, b, d, b, a, c, a]],
    /*Fake oc. Variation of oc discovered by mistake. I like it.
             [[a, b, d, b, d, c],
              [d, c, a, c, a, b],
              [b, a, c, a, c, d],
              [d, c, a, c, a, b],
              [b, a, c, a, c, d],
              [c, d, b, d, b, a]],*/
    //Pc
    [[a, a, a, c, a, b, d, b, b, b], [a, a, c, a, c, d, b, d, b, b], [a, c, a, c, a, b, d, b, d, b], [c, a, c, a, a, b, b, d, b, d], [a, c, a, a, c, d, b, b, d, b], [d, b, d, d, b, a, c, c, a, c], [b, d, b, d, d, c, c, a, c, a], [d, b, d, b, d, c, a, c, a, c], [d, d, b, d, b, a, c, a, c, c], [d, d, d, b, d, c, a, c, c, c]], //Qc
    [[c, a, c, a, b, d, b, d, c, d], [a, c, a, c, d, b, d, b, a, b], [c, a, c, b, a, d, b, d, c, d], [a, c, d, c, d, c, d, b, a, b], [d, b, a, b, a, b, a, c, d, c], [b, d, b, c, d, a, c, a, b, a], [d, b, d, b, a, c, a, c, d, c], [b, d, b, d, c, a, c, a, b, a], [c, a, c, a, b, d, b, d, a, b], [b, d, b, d, c, a, c, a, d, c]], //Rc
    [[c, b, c, a, c, a, c, b], [a, c, a, d, b, d, a, c], [c, a, c, b, d, b, c, a], [b, d, a, c, a, c, a, d]], //Sc
    [[b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c], [a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d], [c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b], [a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d], [c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b], [b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c], [d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a], [b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c], [d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a], [c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b], [a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d], [c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b], [a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d], [d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a], [b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c], [d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a], [c, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c], [a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d]], //Neuvieme planche
    //Tc
    [[a, b, a, b, a, b, c, d, c, d, c, d], [d, c, c, d, d, c, b, a, a, b, b, a], [a, c, a, b, d, b, c, a, c, d, b, d], [d, b, d, c, a, c, b, d, b, a, c, a], [a, b, b, a, a, b, c, d, d, c, c, d], [d, c, d, c, d, c, b, a, b, a, b, a], [c, d, c, d, c, d, a, b, a, b, a, b], [b, a, a, b, b, a, d, c, c, d, d, c], [c, a, c, d, b, d, a, c, a, b, d, b], [b, d, b, a, c, a, d, b, d, c, a, c], [c, d, d, c, c, d, a, b, b, a, a, b], [b, a, b, a, b, a, d, c, d, c, d, c]], //Vc
    [[c, a, b, a, b, d], [a, c, d, c, d, b], [d, b, c, d, a, c], [a, c, b, a, d, b], [d, b, a, b, a, c], [b, d, c, d, c, a]], //Uc
    [[c, d, b, a], [b, a, c, d], [c, d, a, b, d, c, a, b], [a, b, a, c, a, b, d, b], [a, b, c, d], [d, c, b, a], [d, c, d, b, d, c, a, c], [b, a, d, c, a, b, d, c], [c, d, b, a], [b, a, c, d], [c, d, a, b, d, c, a, b], [a, b, a, c, a, b, d, b], [a, b, c, d], [d, c, b, a], [d, c, d, b, d, c, a, c], [b, a, d, c, a, b, d, c]], //Xc
    [[a, b], [d, c], [a, c, a, b, d, b], [c, a, c, d, b, d], [b, a], [c, d], [b, d, b, a, c, a], [d, b, d, c, a, c]], //Yc
    [[c, d, a, b, d, c, a, b], [a, b, a, c, a, b, d, b], [c, d, c, a, c, d, b, d], [a, b, a, c, a, b, d, b], [d, c, d, b, d, c, a, c], [b, a, b, d, b, a, c, a], [d, c, d, b, d, c, a, c], [b, a, d, c, a, b, d, c], [c, d, b, a], [b, a, c, d]], //Zc
    [[a, c, a, c, a, b, d, b], [a, b, d, b, a, c, a, c], [c, d, b, d, c, a, c, a], [c, a, c, a, c, d, b, d]]];
    return int;
  }

}

function displayRuchet() {
  let t;
  t = new Truchet();
  let rules = t.createRules(0, 1, 2, 3);
  let rule = "";
  let current_zoom = 2;
  let zoom_f = 3;
  let largeurItem = w / 12;
  let buckets = largeurItem / zoom_f;
  let bucket = 10 * zoom_f;
  let current_rule = 0;
  current_rule = Math.floor(Math.random() * rules.length);
  let ruls = rules[current_rule]; //TODO: Une fois que toutes les formes sont crées : fusionner en un seul motif (path)
  // compoundPath

  for (y = 0; y < buckets; y++) {
    for (x = 0; x < buckets * 1.5; x++) {
      let x_alpha = x * bucket;
      let y_alpha = y * bucket;
      let x_omega = x_alpha + bucket;
      let y_omega = y_alpha + bucket;
      let pattern_y = y % ruls.length;
      let r = ruls[pattern_y][x % ruls[pattern_y].length];
      let fillColor = colors.rose;

      switch (r) {
        case 0:
          triangle(x_alpha, y_alpha, x_omega, y_alpha, x_alpha, y_omega, fillColor);
          break;

        case 1:
          triangle(x_omega, y_alpha, x_omega, y_omega, x_alpha, y_alpha, fillColor);
          break;

        case 2:
          triangle(x_omega, y_omega, x_alpha, y_omega, x_omega, y_alpha, fillColor);
          break;

        case 3:
          triangle(x_alpha, y_omega, x_alpha, y_alpha, x_omega, y_omega, fillColor);
          break;
      }
    }
  }
}

function triangle(pt1_x, pt1_y, pt2_x, pt2_y, pt3_x, pt3_y, fillColor) {
  let path = new Path();
  path.add(new Point(pt1_x, pt1_y));
  path.add(new Point(pt2_x, pt2_y));
  path.add(new Point(pt3_x, pt3_y));
  path.fillColor = fillColor; //return path;
}

class FFTLine {
  constructor(size, distY = 0) {
    this.size = size;
    this.distY = distY;
  }

  createPath() {
    this.FFT_Path = new Path();
    this.FFT_Path.segments = [];

    for (var i = 0; i < this.size; i++) {
      var point = new Point(w / this.size * i, view.center.y);
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

    this.FFT_Path.smooth({
      type: "continuous"
    });
  }

}

class AudioCtrl {
  constructor() {
    this.FFT_Size = 16;
    this.nbFFTLines = 10;
    this.FFTLines = []; // Audio

    this.drum = new Tone.Player("/audio/drum_bass.wav").toMaster();
    this.drum_02 = new Tone.Player("/audio/drum_bass_02.wav").toMaster();
    this.hammer = new Tone.Player("/audio/hammer.wav").toMaster();
    this.piano_aigue = new Tone.Player("/audio/piano_aigue.wav").toMaster();
    this.piano_basse = new Tone.Player("/audio/piano_basse.wav").toMaster();
    this.tracks = [this.drum, this.piano_basse, this.piano_aigue, this.hammer, this.drum_02]; // Timeline

    this.timer = 0;
    this.playing = false;
  }

  init() {
    console.log("init AudioCtrl"); // New FFT Lines

    for (let i = 0; i < this.nbFFTLines; i++) {
      let FFTL = new FFTLine(this.FFT_Size, 20 * i);
      let path = FFTL.createPath();
      path.opacity = 1 - i * 0.1;
      this.FFTLines.push(FFTL);
    }

    this.FFT = new Tone.FFT(this.FFT_Size); // Chain to FFT analyzer

    this.drum.chain(this.FFT);
    this.drum.loop = true;
    this.drum_02.loop = true;
    this.drum_02.chain(this.FFT);
    this.hammer.loop = true;
    this.hammer.chain(this.FFT);
    this.piano_aigue.loop = true;
    this.piano_aigue.chain(this.FFT);
    this.piano_basse.loop = true;
    this.piano_basse.chain(this.FFT);
  }

  initAudioShapes() {
    APP.layers.audioShapes.activate();
    let nb_shapes = 5;

    if (APP.audioShapes.length === 0) {
      let shapes_colors = [colors.green, colors.rose, colors.blue, colors.skin, colors.yellow]; // time where a sample must start (nb of frames at 60fps)

      let timeline = [10, 270, 1100, 1920, 3600];

      for (let i = 0; i < nb_shapes; i++) {
        let args = {
          track: APP.AudioCtrl.tracks[i],
          color: shapes_colors[i],
          starter: timeline[i],
          svg: "images/note_blue.svg"
        };
        let as = new AudioShape(args);
        APP.audioShapes.push(as);
      }
    } else {
      for (let i = 0; i < nb_shapes; i++) {
        let x = getRandomArbitrary(100, 500);
        APP.audioShapes[i].init([x, -50]);
      }
    }
  }

  update() {
    if (this.playing) {
      // boucle
      if (this.timer == 5000) {
        this.timer = 0;
        this.stop();
        this.start();
        return;
      }

      this.timer++;
      let fftValue = this.FFT.getValue(); // FFTLine update

      for (let l = 0; l < this.FFTLines.length; l++) {
        this.FFTLines[l].update(fftValue);
      } // mouvement des Audio Shapes


      for (let item of APP.audioShapes) {
        item.update(APP.AudioCtrl.timer);
      }
    }
  }

  start() {
    this.timer = 0;
    this.initAudioShapes();
    this.playing = true; // Players

    this.drum.mute = true;
    this.piano_basse.mute = true;
    this.piano_aigue.mute = true;
    this.hammer.mute = true;
    this.drum_02.mute = true;
    this.drum.start();
    this.piano_basse.start();
    this.piano_aigue.start();
    this.hammer.start();
    this.drum_02.start();
  }

  stop() {
    this.timer = 0;
    this.playing = false;

    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].mute = true;
    }
  }

  toggle(player) {
    if (player.mute == false) {
      player.mute = true;
    } else {
      player.mute = false;
    }

    if (player == this.drum_02) this.drum.mute = true;
  }

}

class AudioShape {
  constructor(args) {
    let l = getRandomArbitrary(20, 120);
    let h = getRandomArbitrary(25, 85);
    let rectangle = new Rectangle(new Point(0, 0), new Size(l, h));
    let cornerSize = new Size(10, 10);
    this.starter = args.starter || 0;
    this.path = {};
    let zis = this;
    paper.project.importSVG(args.svg, function (item) {
      zis.path = item; //console.log(item);

      zis.path.fillColor = args.color;
      let x = getRandomArbitrary(300, 600);
      zis.path.position.x = x;
      zis.path.position.y = -200;
    });
    this.color = args.color;
    this.acceleration = new Point(0, -0.1);
    this.velocity = new Point(0, 0.005);
    this.track = args.track;
    this.moving = false;
  }

  init(pos) {
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
/************************************************************************
 *
 *
 * SETUP
 *
 *
 ************************************************************************/


function setup() {
  console.log("setup");
  APP.scenes = new ScenesManager();
  APP.loader = new Loader();
  APP.state = "loading";
  video = document.querySelector("#videoElement"); // créer le Body

  var constraints = {
    video: true,
    audio: false
  };
  let options = {
    flipHorizontal: true
  };
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    poseNet = ml5.poseNet(video, options, modelLoaded);
    poseNet.on("pose", gotPoses);
  }).catch(function (err) {
    /* handle the error */
    console.error("Erreur");
  });
  /**
   * Aspect du personnage
   */

  APP.BODY = new Body();
  APP.BODY.initBody(); //APP.triggerZone = new TriggerZone();
  // on n'afficha pas le layer pour le moment (on attent de lancer le jeu)

  APP.layers.bodyLayer.opacity = 0; // AUDIO
  // >> NEW LAYER
  // FFTLINE

  APP.layers.FFTLine = new Layer();
  APP.layers.FFTLine.name = "audio-visualizer";
  APP.layers.FFTLine.sendToBack();
  APP.layers.FFTLine.activate();
  APP.layers.FFTLine.opacity = 0;
  APP.AudioCtrl = new AudioCtrl();
  APP.loader.startLoaderAudio(); // on ajoute le path de la ligne FFT dans init()

  APP.AudioCtrl.init(); // >> NEW LAYER
  // pour les objets Audios

  /*APP.layers.blops = new Layer();
  APP.layers.blops.name = "blops";
  APP.layers.blops.activate();
  APP.layers.blops.opacity = 0;
  
  let circle = new Path.Circle({
  	center: [250, 300],
  	radius: 45,
  	fillColor: colors.blue
  });
  
  APP.blobs.push(new Blop(circle));
  let circle2 = new Path.Circle({
  	center: [450, 200],
  	radius: 50,
  	fillColor: colors.yellow
  });
  
  APP.blobs.push(new Blop(circle2));
  APP.blobs.push(new Blop(circle));*/
  // >> NEW LAYER
  // pour les objets Audios

  APP.layers.audioShapes = new Layer();
  APP.layers.audioShapes.name = "audioShapes";
  APP.layers.audioShapes.activate(); // Hands magnetize

  APP.handRightMover = new HandMover(APP.BODY.bodyJoints.rightWrist);
  APP.handLeftMover = new HandMover(APP.BODY.bodyJoints.leftWrist);
}
/************************************************************************
 *
 *
 * Boucle Principale
 *
 *
 ************************************************************************/


function onFrame(event) {
  // Loader
  APP.loader.update(); // AUDIO

  APP.AudioCtrl.update();

  if (pose) {
    // Coupe avec le bras
    //APP.triggerZone.udpateG();
    // HEAD.onFrame(event);
    APP.BODY.onFrame(event); // Position des main qui controle le trait de coupe

    mousePosVirtual = [pose.leftWrist.x, pose.leftWrist.y];
    APP.handRightMover.onFrame(event);
    APP.handLeftMover.onFrame(event); // Check les intersections avec les formes Caméléon

    let audioShapes = APP.layers.audioShapes.children;
    let item = -1;

    for (let i = 0; i < audioShapes.length; i++) {
      if (APP.BODY.isTouchingShape(audioShapes[i])) {
        // une partie du corps alors touche une forme
        // on modifie le style du calque ca va modifier le style de tous ses enfants
        APP.layers.bodyLayer.style.fillColor = audioShapes[i].fillColor; // Fx bodyScaleOut

        item = i;
      }
    }

    if (item != -1 && APP.BODY.intersecting != item) {
      // Fx Scale Layer Body
      bodyScaleOut();
      APP.BODY.intersecting = item;
      APP.AudioCtrl.toggle(APP.AudioCtrl.tracks[item]);
    }
  }
}
/**********************************************************************
 *
 * EVENTS LISTENER
 *
 **********************************************************************/


function onKeyDown(event) {
  // Selected
  if (event.key === "space") {
    if (APP.layers.bodyLayer.selected === true) APP.layers.bodyLayer.selected = false;else APP.layers.bodyLayer.selected = true;
  } // Colors


  if (event.key === "c") {
    let red = getRandomArbitrary(0, 1);
    let green = getRandomArbitrary(0, 1);
    let blue = getRandomArbitrary(0, 1);

    for (let i = 0; i < APP.layers.bodyLayer.children.length; i++) {
      APP.layers.bodyLayer.children[i].fillColor = new Color(red, green, blue);
    }
  }

  if (event.key === "a") {
    // Motifs sur le body
    truchetOnBody(); // Fx Scale Layer Body

    bodyScaleOut();
  }

  if (event.key === "z") {
    deleteTruchetPattern();
  }
}
/********************************************************************
 *
 * FX
 *
 **********************************************************************/


function bodyScaleOut() {
  if (project.layers["fx"]) {
    project.layers["fx"].remove();
  }

  let layerFx = project.layers["body"].clone();
  layerFx.name = "fx";
  layerFx.lastChild.remove();
  layerFx.sendToBack();
  layerFx.scaling = 1;
  layerFx.applyMatrix = false;
  layerFx.tweenTo({
    scaling: 2,
    opacity: 0
  }, {
    easing: "easeOutCubic",
    duration: 350
  });
}

function truchetOnBody() {
  APP.truchetPattenIsActive = true; // Truchet Layer (Motifs)

  let layer = new Layer();
  layer.name = "motifs";
  layer.activate();
  displayRuchet(); // dans Truchet.js

  if (project.layers["body"].lastChild.name === "motifs") {
    project.layers["body"].lastChild.replaceWith(layer);
  } else {
    project.layers["body"].addChild(layer);
  }

  project.layers["body"].lastChild.clipMask = true;
}

function deleteTruchetPattern() {
  if (APP.truchetPattenIsActive) {
    project.layers["body"].lastChild.clipMask = false;
    project.layers["body"].lastChild.remove();
    APP.truchetPattenIsActive = false;
  }
}
/********************************************************************
 *
 * POSENET
 *
 **********************************************************************/


function gotPoses(poses) {
  if (poses.length > 0 && APP.state === "inGame") {
    pose = poses[0].pose; // les coordonnées récupéré sont ajusté à la taille de la source vidéo (640*380)
    // Je vais l'adapté à la hauteur de l'écran

    pose = poseAdaptToResolution(pose);
  }
}

function poseAdaptToResolution(p) {
  //let videoW = video.width;
  let videoH = video.height;
  APP.ratio = (h - 100) / videoH;
  let pScaled = p;

  for (const property in pScaled) {
    if (property !== "keypoints" && property !== "score") {
      pScaled[property].x *= APP.ratio;
      pScaled[property].y *= APP.ratio;
    }
  }

  return pScaled;
}

function modelLoaded() {
  console.log("PoseNet is ready");
  APP.loader.poseNetLoaded = true;
}
/***************************
 *
 *		INIT APP
 *
 ****************************/


setup();
//# sourceMappingURL=app-dist.js.map