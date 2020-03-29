import * as THREE from '../include/three/build/three.module.js';
import {GLTFLoader} from '../include/three/examples/jsm/loaders/GLTFLoader.js'


var loader = new GLTFLoader();

loader.load(
	// resource URL
	'./models/question_mark.gltf',
	// called when the resource is loaded
	function ( gltf ) {
        console.log("Loading compelete!")
		scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {
        console.log('This is an erorr', error)

	}
);