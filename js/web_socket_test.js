import * as THREE from '../include/three/build/three.module.js';
import {PointerLockControls} from '../include/three/examples/jsm/controls/PointerLockControls.js';
import {OrbitControls} from '../include/three/examples/jsm/controls/OrbitControls.js';
import Stats from '../include/stats/stats.module.js'
import * as CANNON from '../include/cannon-es/cannon.js';
import {
	GoldCoin,
	SilverCoin,
	PurpleCoin,
	QuestionMark
} from './resource_objects.js';

import {
	Box,
	GroundPlane,
	StaticBox,
} from './objects.js';

import {Player} from './player.js'

let map ={
	spawn_pos : [0,10,0]
}

/* Shortcut because i'm lazy */
let log = (x) => console.log(x);

/* THREE.js GLOBAL OBJECTS */
let renderer;
let scene;
let camera;
let controls;

/* CANNON.js GLOBAL OBJECTS */
/**@type {CANNON.World} */
let world;

/* STATS.js GLOBAL OBJECTS */
let stats;

/* Objects which need to be updated every tick e.g. floating coins */
let updateObjects = [];

let keyStates;

/* track the player with this light to provide player shadows */
let directional_light;

let player;
let opponent;
let player_id;
/**
 * Websocket
 */
var game_socket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/game/' + room_id + '/');

var message = {
	'Left': false,
	'Right': false,
	'Up': false,
	'Down': false,
	'Shift': false,
	'Control': false,
	'Space': false
};

game_socket.onmessage = function(e) {
	var data = JSON.parse(e.data);
	message = data['message'];


	// process the msg only if the sender isn't itself
	if(player_id !== data['player']){
		if('type' in message){
			if(message['type'] === "join"){
				console.log("player joined!")
				opponent = new Player(...map.spawn_pos);
				scene.add(opponent.mesh);
				world.add(opponent.body);
				world.addContactMaterial(
				new CANNON.ContactMaterial(opponent.body.material, ground.body.material,
				{friction: 0.8, restitution: 0.5})
				)
				window.opponent = opponent;

				game_socket.send(JSON.stringify({
					'message': {
						'type': "add_player",
						'x': player.x,
						'y': player.y,
						'z': player.z
					},
					'player': player_id,
				}))
			}
			else if(message['type'] === 'add_player'){
				console.log(message)
				opponent = new Player(Number(message['x']), Number(message['y']), Number(message['z']));
				scene.add(opponent.mesh);
				world.add(opponent.body);
				world.addContactMaterial(
				new CANNON.ContactMaterial(opponent.body.material, ground.body.material,
				{friction: 0.8, restitution: 0.5})
				)
				window.opponent = opponent;
			}
		}
		else {
			opponent.body.position.set(Number(message['x']), Number(message['y']), Number(message['z']));
			opponent.update(message);
		}

	}

	// console.log(message + '\n');
};




// var update_tick = setInterval(send_update, 1);
//
// function send_update(){
// 	if(typeof player_id == "undefined"){
// 		return;
// 	}
// 	game_socket.send(JSON.stringify({
// 		'player': player_id,
// 		'message': keyStates
// 	}));
// }

/**
 * Run all initialization code in the correct order.
 *
 * This is an async function in order to let resources load before
 * 	continuing.
 */
async function init(){
	log("INIT THREE")
	initThree();
	log("INIT CANNON")
	initCannon();
	log("INIT STATS")
	initStats();
	log("INIT CONTROLS")
	initKeyboard();

	log("LOAD MODELS")
	await loadModels([
		QuestionMark,
		GoldCoin,
		SilverCoin,
		PurpleCoin
	]);

	log("LOAD MAP")
	loadMap();

	log("START GAME")

	player_id = Math.random();
	let join_msg = {'message': {'type': "join"}, 'player': player_id};
	game_socket.send(JSON.stringify(join_msg));
	tick();
}
init();

/**
 * Initialize stats.js to keep track of FPS and memory usage
 */
function initStats(){
	stats = new Stats();
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );
}

function initKeyboard(){

	keyStates = {
		'Left': false,
		'Right': false,
		'Up': false,
		'Down': false,
		'Shift': false,
		'Control': false,
		'Space': false,
	}

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

		// note space is queued up and only unset by the inputUpdate not keyup event
		else if (keyPressed === "Space" ){
			keyStates['Space'] = true;
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
		// else if (keyReleased === 'ControlLeft' || keyReleased === 'ControlRight'){
		// 	keyStates['Control'] = false;
		// }
	})
}


let map_json = {
	blocks:[
		{ x:0,y:-5,z:0, width:50,height:10,depth:50,color:"red"},
		{
			x:60,y:-5,z:30, width:20,height:10,depth:50,color:"red",
		},
		{
			x:120,y:-5,z:20, width:80,height:10,depth:20,color:"red",
		},
		{
			x:160,y:-5,z:100, width:30,height:10,depth:100,color:"red",
		},
		{
			x:80,y:-5,z:160, width:40,height:10,depth:40,color:"red",
		}

	],
	coins:[
		{x: -10, y:10, z:10, type:"gold"},
		{x: 10, y:10, z:10, type:"gold"},
		{x: 10, y:10, z:10, type:"gold"},
		{x: 10, y:10, z:10, type:"gold"},

	],
	spawn_location : [0,10,0]
}


/**
 * Load map
 */
function loadMap(){
	var groundMat = new CANNON.Material();

	// scene.add(ground.mesh);
	// console.log(ground)
	// world.add(ground.body)

	player = new Player(...map.spawn_pos);

	for (let i = 0 ; i < map_json.blocks.length; i++){
		let info = map_json.blocks[i];
		let block = new StaticBox(
			info.x, info.y, info.z, info.width, info.height, info.depth, info.color)
		scene.add(block.mesh);
		world.add(block.body); 
		block.body.material= groundMat;
	}

	/* collision events between the player and an object */
	player.body.addEventListener("collide", handleClientPlayerCollision)
	// opponent = new Player(0, 10, 0);
	scene.add(player.mesh);
	world.add(player.body);
	// scene.add(opponent.mesh);
	// world.add(opponent.body);

	world.addContactMaterial(
		new CANNON.ContactMaterial(player.body.material, groundMat,
			{friction: 0.8, restitution: 0.5})
	)
	// world.addContactMaterial(
	// 	new CANNON.ContactMaterial(opponent.body.material, ground.body.material,
	// 		{friction: 0.8, restitution: 0.5})
	// )

	let obj;
	obj = new GoldCoin(-10,10,10);
	scene.add(obj.mesh);
	world.add(obj.collider);
	updateObjects.push(obj);
	// scene.add(obj.mesh);
	// updateObjects.add(obj);

	obj = new StaticBox(10,10,10,10,10,10,"blue");
	scene.add(obj.mesh)
	world.add(obj.body)

	// window.ground = ground;
	window.player = player;
	// window.opponent = opponent;
}

/**
 * Initialize three.js rendering variables.
 * Must run before any sort of rendering.
 */
function initThree(){
	scene = new THREE.Scene();
	scene.add ( new THREE.AxesHelper(5) );

	renderer = new THREE.WebGLRenderer( { antialias:true});
	renderer.setPixelRatio( window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled= true;
	document.body.appendChild( renderer.domElement);

	/* Automatically update window on resize */
	window.addEventListener('resize',
	()=> {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000 );
	camera.position.z = 20;
	camera.position.y = 20;
	scene.add (camera)
	camera.lookAt(scene.position);

	controls = new OrbitControls( camera, renderer.domElement);

	/*
	ADD LIGHTING
	*/

	let ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambient_light)

	// let directional_light2 = new THREE.DirectionalLight(0xaaffbb, 0.3);
	// directional_light2.position.set(0,100,0);
	// directional_light2.target = new THREE.Vector3(100,0,0);

	directional_light = new THREE.DirectionalLight(0xffffff, 0.3);
	directional_light.position.set(0,100,0);
	directional_light.castShadow = true;
	directional_light.shadow.camera.left = -20;
	directional_light.shadow.camera.right = 20;
	directional_light.shadow.camera.bottom =-20;
	directional_light.shadow.camera.top = 20;
	scene.add(directional_light);

	// let light = new THREE.PointLight(0xffbbbb);
	// light.position.set(0, 500, 200);
	// scene.add(light)

	// let light2 = new THREE.PointLight(0xbbffbb);
	// light2.position.set(-300, 0, 0);
	// scene.add(light2);

	// let light_background = new THREE.AmbientLight(0x606060);
	// scene.add(light_background);

	scene.fog = new THREE.Fog( scene.background, 1, 5000 );

	/*
	ADD SKYBOX
	*/
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		"topColor": { value: new THREE.Color( 0x87ceeb ) },
		"bottomColor": { value: new THREE.Color( 0x4169e1 ) },
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
}

/**
 * Initialize cannon world parameters
 */
function initCannon(){
	world = new CANNON.World;
	world.gravity.set(0,-9.81, 0);
	world.solver.iterations = 3;
}

/**
 * Load all GLTF models before using
 */
async function loadModels(resource_classes_array){
	// debugger;
	const promises = resource_classes_array.map(
		(resource_class) => {
			return new Promise( (resolve, reject) => {
				resource_class.loadResources(resolve, reject)
			})
		}
	);
	// // Debug: stall to make sure order of loading is correct
	// promises.push (new Promise( (resolve, reject) =>{
	// 			setTimeout(resolve, 1000);
	// 		}));


	return Promise.all( promises).then( () =>
		console.log("ALL RESOURCES LOADED")
	);
}


function tick(){
	stats.begin();

	let playerLastPosition = {
		x: player.mesh.position.x,
		y: player.mesh.position.y,
		z: player.mesh.position.z
	};


	// log(keyStates);

	/*update physics engine */
	world.step(1.0 / 60.0);

	/* update controls */
	controls.update();
	if (player){
		controls.target.copy(player.mesh.position)
		player.update(keyStates);
	}

	/* set player forward direction */
	let v_fwd = new THREE.Vector3(
		player.mesh.position.x - camera.position.x,
		player.mesh.position.y - camera.position.y,
		player.mesh.position.z - camera.position.z
	);
	v_fwd.projectOnPlane(new THREE.Vector3(0,1,0));
	player.setForwardDirection(v_fwd);

	/* update camera */
	camera.position.x += player.mesh.position.x-playerLastPosition.x;
	camera.position.z += player.mesh.position.z-playerLastPosition.z;
	camera.lookAt(player.mesh.position);


	/* move directional light above player to ensure shadows */
	directional_light.position.set(player.mesh.position.x ,player.mesh.position.y+10, player.mesh.position.z);
	directional_light.target = player.mesh;


	/* loop through backwards to allow for dynamic deletion */
	for (var i = updateObjects.length - 1; i >= 0; i--) {
		updateObjects[i].update();
		// console.log(updateObjects[i].mesh.position)
    if (updateObjects[i].is_dead) { 
				// world.remove(updateObjects[i].body)
				scene.remove(updateObjects[i].mesh)
    }
}

	/* update renderer */
	// updateObjects.forEach( (element) => element.update() )
	renderer.render(scene, camera);

	stats.end();
	keyStates['x'] = playerLastPosition.x;
	keyStates['y'] = playerLastPosition.y;
	keyStates['z'] = playerLastPosition.z;
	
	game_socket.send(JSON.stringify({
		'player': player_id,
		'message': keyStates
	}));

	// Save the values locally
	player1.value = JSON.stringify({
                'x': playerLastPosition.x,
                'y': playerLastPosition.y,
                'z': playerLastPosition.z
            })


	if(typeof opponent !== "undefined") {
		player2.value = JSON.stringify({
			'x': opponent.body.position.x,
			'y': opponent.body.position.y,
			'z': opponent.body.position.z
		})
	}
	/* enqueue next frame */
	requestAnimationFrame(tick);

}


function handleClientPlayerCollision(e){
		if (e.body.userData.type == "ground"){
			player.jumps_remaining = player.max_jumps;
		}
		if (e.body.userData.type == "coin"){
			console.log("hit a coin!")
			let coin = e.body.userData.ref;
			player.score += coin.value;
			coin.is_dead = true;
		}
}

// window.addEventListener("keydown", (/** @type {KeyboardEvent} */event) => {
// 	if (event.code == 'Space'){
// 		obj_cannon.velocity.y = 5
// 	}
// })



window.directional_light = directional_light;

/* reset the player and camera positions in case they get stuck */
function resetFunction(){
	player.setPosition(...map.spawn_pos)
	camera.position.z = 20;
	camera.position.y = 20;
	camera.position.x = 0;
}

function loadMapFromJSON(){

}

// function createCannonTestObjects(){

// 	/* Sphere object */
// 	var radius = 1;
// 	var mat1 = new CANNON.Material();
// 	var sphereBody = new CANNON.Body({
// 		mass: 5,
// 		position: new CANNON.Vec3(0, 10, 0),
// 		shape: new CANNON.Sphere(radius),
// 		material: mat1,
// 	});
// 	cannon_world.addBody(sphereBody);

// 	/* Ground plane */
// 	var groundMat = new CANNON.Material();
// 	var groundBody = new CANNON.Body({
// 		mass:0,
// 		material: groundMat,
// 	});
// 	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);

// 	var groundShape = new CANNON.Plane();
// 	groundBody.addShape(groundShape);
// 	cannon_world.addBody(groundBody);
// 	cannon_world.addContactMaterial(
// 		new CANNON.ContactMaterial(groundMat, mat1,
// 			{friction: 0.0, restitution: 0.5})
// 	)

// 	obj_cannon = sphereBody;
// }


// Debug: expose variable to the window for debugging:
window.scene = scene;
window.world = world;
window.QuestionMark = QuestionMark;
window.GoldCoin = GoldCoin;

world.camera = camera;