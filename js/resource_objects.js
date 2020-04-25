import {GLTFLoader} from '../include/three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from '../include/cannon-es/cannon.js';
import * as THREE from '../include/three/build/three.module.js';

let loader = new GLTFLoader();

console.log("Module {objects.js} Loaded");

/** Generic resource object for loading from gltf/glb files */
class ResourceObject{
	constructor(x,y,z){
		this.update = this.update.bind(this);
		if (this.prototypeMesh === null){
			console.error("Must load the mesh via loadResources before using ResourceObject's")
		}
		this.mesh = this.constructor.prototypeMesh.clone();
		this.mesh.position.set(x,y,z);
		this.global_id = this.constructor.object_id_count;
		this.constructor.object_id_count ++;
	}

	/** @type {string} Specify the path for eachc subclass */
	static path = null;
	/** @type {THREE.Mesh} The static mesh*/
	static prototypeMesh = null;
	static debug_name = "DEBUG NAME NOT DEFINED"

	static object_id_count  = 0;

	/**
	 * Load resorces specified in Class.path static variable.
	 * 
	 * @param {function} resolve - function called on loading success (no args)
	 * @param {function} reject - function called on loading failure (one arg: error)
	 */
	static loadResources( resolve, reject ){
		if (this.path === null){
			reject(new Error("ResourceObject path not properly defined."))
			return;
		}
		console.log("Loading resource at path: ", this.path)
		// let thisvar = this;
		/* 'this' value must refer to child class  */
		loader.load(
			this.path,
			function (gltf) {
				this.prototypeMesh = gltf.scene;
				this.processResource();
				this.did_load = true;
				// console.log(`Resource for ${this.debug_name} was loaded!`)
				resolve();
			}.bind(this),
			function (xhr){
				// loading updates. not used.
			},
			function (error){
				console.error(error)
				reject(new Error(`Error loading resource for ${this.debug_name}.`));
			}.bind(this)
		);
	}

	/** optional method to process resources before setting prototypemesh. */
	static processResource(){
		return null;
	}
}

/** 
 * Floating and spinning gold coin
 */
export class GoldCoin extends ResourceObject{

	static path = static_url + 'models/gold_coin_3.glb';
	static debug_name = "Gold Coin";
	static name = "gold"

	static value =5;
	constructor(x,y,z, coin_id){
		super(x,y,z);
		this.coin_id = coin_id;
		this.rotation = 0;
		this.collider = new CANNON.Body({mass:0});
		this.collider.addShape(new CANNON.Sphere(1.5));
		this.collider.position.set(x,y,z);
		this.collider.userData= {global_id: this.global_id, type:"coin", ref:this}

		this.mesh.children[2].castShadow= true;
		this.value = this.constructor.value;
		this.name = this.constructor.name;

		// console.log(this.global_id)
	}
	update(){
		this.rotation += 0.02;
		if (this.rotation > 2*Math.PI){
			this.rotation %= 2*Math.PI;
		}
		this.mesh.rotation.y = this.rotation;
	}
}

export class SilverCoin extends GoldCoin{

	static path = static_url + 'models/silver_coin_2.glb';
	static debug_name = "Silver Coin"
	static name = "silver"

	static value = 2;

	constructor(x,y,z, coin_id){
		super(x,y,z, coin_id);
	}
}

export class PurpleCoin extends GoldCoin{

	static path = static_url + 'models/purple_coin_2.glb';
	static debug_name = "Purple Coin"
	static name = "purple"

	static value = 10;

	constructor(x,y,z, coin_id){
		super(x,y,z, coin_id);
	}
}

/**
 * Floating question mark
 */
export class QuestionMark extends ResourceObject{

	static path = static_url + "models/question_mark_2.glb";
	static debug_name = "Question Mark"

	/**
	 * 
	 * @param {number} x - world x coordinate
	 * @param {number} y - world y coordinate
	 * @param {number} z - world z coordinate
	 */
	constructor (x, y, z){
		super(x,y,z);
		this.rotation = 0;
	}
	
	static processResource(){
		this.prototypeMesh = this.prototypeMesh.children[0]
		this.prototypeMesh.scale.set(10,10,10);
	}

	update(){
		this.rotation += 0.02;
		if (this.rotation > 2*Math.PI){
			this.rotation %= 2*Math.PI;
		}
		this.mesh.rotation.z = this.rotation;

	}
}
