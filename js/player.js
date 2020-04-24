
import * as CANNON from '../include/cannon-es/cannon.js';
import * as THREE from '../include/three/build/three.module.js';

export class Player{
	constructor (x,y,z, keyStates){
		this.x = x;
		this.y = y;
    this.z = z;
    
    this.speed = 0.5;
    this.max_speed = 13;
    
    this.score = 0;


    this.max_jumps = 2;
    this.jumps_remaining = this.max_jumps;
		
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
    this.body.userData = {global_id: -1, type:"player", ref:this}
    
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
      if (this.jumps_remaining > 0){
        this.body.velocity.y = 16;
        this.jumps_remaining -= 1;
      }
      keyStates['Space'] =false;
    }
    if (keyStates['Control'] ){
      console.log("Go downn!")
      // player.mesh.position.y -=50;
      keyStates['Control'] =false;
    }
  
    /* slowly reduce velocity and rotation. also cap at max speed*/
    this.body.velocity.x *= 0.995;
    this.body.velocity.x = Math.min(this.body.velocity.x, this.max_speed);
    // this.body.velocity.y *= 0.99;
    this.body.velocity.z *= 0.995;
    this.body.velocity.z = Math.min(this.body.velocity.z, this.max_speed);
    this.body.quaternion.x *= 0.99;
    this.body.quaternion.x *= 0.99;
    this.body.quaternion.x *= 0.99;
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


