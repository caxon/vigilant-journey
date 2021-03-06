import * as CANNON from '../include/cannon-es/cannon.js';
import * as THREE from '../include/three/build/three.module.js';

export class GroundPlane{
	constructor( y){
		this.y = y;

    let geo = new THREE.PlaneGeometry(100,100, 32,32);
    geo.rotateX(-Math.PI/2);
    geo.translate(0,y,0);
    geo.y = y;
		let mat = new THREE.MeshStandardMaterial(
			{color: 0x3355cc});
    this.mesh = new THREE.Mesh(geo, mat);	
    this.mesh.receiveShadow= true;	
    
    var groundMat = new CANNON.Material();
    var groundBody = new CANNON.Body({
      mass:0,
      material: groundMat,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);

    this.body = groundBody;
    this.body.userData = {global_id:-1, type:"ground", ref:this}
  }
}

export class StaticBox{
  constructor( x, y, z, width, height, depth, color="blue"){
    let colorcode  = 0x606060
    if (color =="blue"){
      colorcode = 0x3355cc;
    }
    else if (color=="red"){
      colorcode = 0x991222;
    }
    else if (color=="green"){
      colorcode = 0x2eb832;
    }
    else if (color=="yellow"){
      colorcode = 0xdede1b;
    }
    else if (color=="orange"){
      colorcode = 0xa87332;
    }
    else if (color=="purple"){
      colorcode = 0x481da3;
    }


    /* three js */
    let geo = new THREE.BoxGeometry(width, height, depth);
		let mat = new THREE.MeshStandardMaterial(
			{color: colorcode});
    geo.translate(x, y, z);

    this.mesh = new THREE.Mesh(geo, mat);	
    this.mesh.receiveShadow= true;	

    // let contact_mat = new CANNON.Material();
		// this.body = new CANNON.Body({
		// 	mass: 5,
    //   shape: new CANNON.Sphere(1),
    //   material: contact_mat,
		// })
    // this.body.position.set(x,y,z);
    // this.body.userData = {global_id: -1, type:"player", ref:this}

    let body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)),
      position: new CANNON.Vec3(x,y,z)
    })

    // body.position.set(new CANNON.Vec3(x,y,z))
    body.userData = {global_id:-1, type:"ground", ref:this}
    this.body =body;

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
    this.mesh = THREE.Mesh(geo, mat);
    
    let body = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Box(
        new CANNON.Vec3(1,1,1)
        ),
      position: new CANNON.Vec3(x,y,z)
    })

    this.body = body;
  }

  update(){
    this.syncThreeCannon();
  }

  syncThreeCannon(){
    this.mesh.position.x = this.body.position.x;
    this.mesh.position.y = this.body.position.y;
    this.mesh.position.z = this.body.position.z;
  
    this.mesh.quaternion.x = this.body.quaternion.x;
    this.mesh.quaternion.y = this.body.quaternion.y;
    this.mesh.quaternion.z = this.body.quaternion.z;
    this.mesh.quaternion.w = this.body.quaternion.w;
  }

}