
import * as CANNON from '../include/cannon-es/cannon.js';
import * as THREE from '../include/three/build/three.module.js';

export class Player{
	constructor (x,y,z, keyStates){
		this.x = x;
		this.y = y;
    this.z = z;
    
    this.speed = 0.5;
		
		let geo = new THREE.BoxGeometry(1,1,1 );
		let mat = new THREE.MeshStandardMaterial(0xff00ff);
    this.mesh = new THREE.Mesh( geo, mat);
    this.mesh.castShadow= true;
    
    let contact_mat = new CANNON.Material();
		this.body = new CANNON.Body({
			mass: 5,
      shape: new CANNON.Sphere(1),
      material: contact_mat,
		})
    this.body.position.set(x,y,z);
    
    this.forwardDirection = new THREE.Vector3(1,0,0);
  }

  setPosition(x,y,z){
    this.body.position.set(x,y,z);
    this.syncThreeCannon();
  }

  setForwardDirection(v_dir){
    this.forwardDirection.copy(v_dir)
  }

  /**
   * update the player on every tick
   */
  update(keyStates){
    this.reactToInput(keyStates);
    this.syncThreeCannon();
    // console.log(this.body.velocity)
    /* Enforce a speed limit */
    this.body.velocity = this.body.velocity.scale(0.99);

  }
  
  reactToInput(keyStates){  
    /* compute velocities in forward direction using vec. projection */
    let fwd_angle = Math.atan2(this.forwardDirection.z, this.forwardDirection.x);
    let right_angle = fwd_angle +Math.PI/2;

    if (keyStates['Left'] && !keyStates['Right']){
      this.body.velocity.x -= Math.cos(right_angle)*this.speed;
      this.body.velocity.z -= Math.sin(right_angle)*this.speed;
    }
    if (keyStates['Right'] && !keyStates['Left']){
      this.body.velocity.x += Math.cos(right_angle)*this.speed;
      this.body.velocity.z += Math.sin(right_angle)*this.speed;
    }
    /* forward */
    if (keyStates['Up'] && !keyStates['Down']){
      this.body.velocity.x += Math.cos(fwd_angle)*this.speed;
      this.body.velocity.z += Math.sin(fwd_angle)*this.speed;
    }
    /* backwards */
    if (keyStates['Down'] && !keyStates['Up']){
      this.body.velocity.x -= Math.cos(fwd_angle)*this.speed;
      this.body.velocity.z -= Math.sin(fwd_angle)*this.speed;
    }
  
    if (keyStates['Space'] ){
      console.log("JUMP!")
      this.body.velocity.y = 8;
      keyStates['Space'] =false;
    }
    if (keyStates['Control'] ){
      console.log("Go downn!")
      // player.mesh.position.y -=50;
      keyStates['Control'] =false;
    }
  
    // console.log(keyStates)
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


