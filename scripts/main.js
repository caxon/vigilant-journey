console.log("goodbye")

import * as THREE from '../resources/three/build/three.module.js';
import {OrbitControls} from '../resources/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '../resources/three/examples/jsm/loaders/GLTFLoader.js';
import {SkeletonUtils} from '../resources/three/examples/jsm/utils/SkeletonUtils.js'

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

var cube;
var renderer;
var scene;
var camera;
var orbitControls;

function init(){
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias:true});
	renderer.setPixelRatio( window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement);


	window.addEventListener('resize', onWindowResize, false);

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 400;
	camera.position.y=200;
	scene.add (camera)
	camera.lookAt(scene.position);

	orbitControls = new OrbitControls( camera, renderer.domElement);


	// let geo = new THREE.BoxGeometry( 200,200, 200);
	// let mat = new THREE.MeshLambertMaterial( {color: 0xffffff});
	// cube = new THREE.Mesh( geo, mat );
	// scene.add (cube);

	scene.fog = new THREE.Fog( scene.background, 1, 5000 );

	let light = new THREE.PointLight(0xffbbbb);
	light.position.set(0, 500, 200);
	scene.add(light)

	let light2 = new THREE.PointLight(0xbbffbb);
	light2.position.set(-300, 0, 0);
	scene.add(light2);

	let light3 = new THREE.PointLight(0xbbbbff);
	light3.position.set(0, -400, 200);
	scene.add(light3)

	let light_background = new THREE.AmbientLight(0x202020);
	scene.add(light_background);


	// let hemi_light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
	// scene.add( hemi_light );
	// createRobotScene();

	/* TODO FIGURE OUT THE FOLLOWING CODE */
	// try to add skybox using shaders
			var vertexShader = document.getElementById( 'vertexShader' ).textContent;
			var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
			var uniforms = {
				"topColor": { value: new THREE.Color( 0x0077ff ) },
				"bottomColor": { value: new THREE.Color( 0x222222 ) },
				"offset": { value: 33 },
				"exponent": { value: 0.6 }
			};
			// uniforms[ "topColor" ].value.copy( hemi_light.color );

			scene.fog.color.copy( uniforms[ "bottomColor" ].value );

			var skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
			var skyMat = new THREE.ShaderMaterial( {
				uniforms: uniforms,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				side: THREE.BackSide
			} );

			var sky = new THREE.Mesh( skyGeo, skyMat );
			scene.add( sky );
	/* End weird code */


}


const keyStates = {
	'Left': false,
	'Right': false,
	'Up': false,
	'Down': false,
	'Shift': false,
	'Control': false
}

function initKeyboard(){
	console.log("Now listening for keyboard presses...");
	document.addEventListener('keydown', function(event) {
		let keyPressed = event.code;
		if (event.repeat){
			// ignore repeat (held down) key presses
			return;
		}
		// console.log("Key pressed event: " + keyPressed)

		if (keyPressed === 'KeyA' || keyPressed === 'ArrowLeft'){
			keyStates['Left'] = true;
		}
		else if (keyPressed === 'KeyW' || keyPressed === 'ArrowUp'){
			keyStates['Up'] = true;
		}
		else if (keyPressed === 'KeyD' || keyPressed === 'ArrowRight'){
			keyStates['Right'] = true;
		}
		else if (keyPressed === 'KeyS' || keyPressed === 'ArrowDown'){
			keyStates['Down'] = true;
		}
		else if (keyPressed === 'ShiftLeft' || keyPressed === 'ShiftRight'){
			keyStates['Shift'] = true;
		}
		else if (keyPressed === 'ControlLeft' || keyPressed === 'ControlRight'){
			keyStates['Control'] = true;
		}
		else if (keyPressed === "KeyR" ){
			resetFunction();
		}
	})
	document.addEventListener('keyup', function(event) {
		let keyReleased = event.code;
		// console.log("Key released event: " + keyReleased)

		if (keyReleased === 'KeyA' || keyReleased === 'ArrowLeft'){
			keyStates['Left'] = false;
		}
		else if (keyReleased === 'KeyW' || keyReleased === 'ArrowUp'){
			keyStates['Up'] = false;
		}
		else if (keyReleased === 'KeyD' || keyReleased === 'ArrowRight'){
			keyStates['Right'] = false;
		}
		else if (keyReleased === 'KeyS' || keyReleased === 'ArrowDown'){
			keyStates['Down'] = false;
		}
		else if (keyReleased === 'ShiftLeft' || keyReleased === 'ShiftRight'){
			keyStates['Shift'] = false;
		}
		else if (keyReleased === 'ControlLeft' || keyReleased === 'ControlRight'){
			keyStates['Control'] = false;
		}
	})
}

function resetFunction(){
	// TODO: Implement this
	console.log("Resetting game state")
}

init();
initKeyboard();


// function createRobotScene(){
// 	let geo1 = new THREE.BoxGeometry(1000,10,1000);
// 	let mat1 = new THREE.MeshLambertMaterial( {color:0xaa4422});
// 	let floor_mesh = new THREE.Mesh( geo1, mat1);
// 	scene.add(floor_mesh);
// }
// createRobotScene();

function tick(){

	requestAnimationFrame( tick );


	physicsUpdate();
	renderUpdate();

	// console.log(keyStates)
}

function renderUpdate(){
	orbitControls.update();
	renderer.render(scene, camera);
}

function physicsUpdate(){
	// sample rotate cube
	player.mesh.rotation.y += 0.01;
	player.mesh.rotation.x += 0.005;

	if (keyStates['Left'] && !keyStates['Right']){
		player.mesh.position.x -= 2;
	}
	if (keyStates['Right'] && !keyStates['Left']){
		player.mesh.position.x += 2;
	}
	if (keyStates['Up'] && !keyStates['Down']){
		player.mesh.position.z -= 2;
	}
	if (keyStates['Down'] && !keyStates['Up']){
		player.mesh.position.z += 2;
	}

	// console.log(keyStates)
}
// create a grid of possible robot locations



// define the player
function Player(){
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;

	let geo = new THREE.BoxGeometry( 200,200, 200);
	let mat = new THREE.MeshLambertMaterial( {color: 0xffffff});
	this.mesh = new THREE.Mesh( geo, mat );

	scene.add (this.mesh);
}

let player = new Player();

// define the platform objects:
function Platform(){
	this.x = 1;
	this.y = 1;
	this.xwidth = 1000;
	this.zwidth = 1000;

	let geo = new THREE.BoxGeometry(this.xwidth,10,this.zwidth);
	let mat = new THREE.MeshLambertMaterial( {color:0xaa4422});
	this.mesh = new THREE.Mesh( geo, mat );

	scene.add(this.mesh);
}
let platforms = [];
platforms.push(new Platform());

// start game timer
requestAnimationFrame( tick );