import * as CANNON from '../include/cannon-es/cannon.js';
import * as THREE from '../include/three/build/three.module.js';

export class GroundPlane{
	constructor( y){
		this.y = y;

    let geo = new THREE.PlaneGeometry(100,100, 32,32);
    geo.rotateX(Math.PI/2);
    geo.translate(0,y,0);
    geo.y = y;
		let mat = new THREE.MeshBasicMaterial(
			{color: 0x3355cc,
			side: THREE.DoubleSide});
		this.mesh = new THREE.Mesh(geo, mat);		
    
    var groundMat = new CANNON.Material();
    var groundBody = new CANNON.Body({
      mass:0,
      material: groundMat,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);


    this.body = groundBody;
  }
}

export class Box{
  constructor (x, y, z, width, height, depth){
    this.x = x;
    this.y = y;
    this.z = z;
    this.width= width;
    this.height = height;
    this.depth= depth;

    let geo = new THREE.BoxGeometry(wdith, height, depth);
    let mat = new THREE.MeshNormalMaterial();
    geo.translate(x, y, z);
    this.mesh = THREE.mesh(geo, mat);
    
    let body = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Box(new CANNON.Vec3(width, height, depth)),
      position: new CANNON.Vec3(x,y,z)
    })

    this.body = body;
  }

}