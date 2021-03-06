import * as THREE from '../include/three/build/three.module.js';
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
	StaticBox,
} from './objects.js';

import {Player} from './player.js';

/* store global map data */
let map ={
	blocks: null,
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
let groundMat = new CANNON.Material();

/* Animation frame id for stopping later */
let animation_frame_request;

/* STATS.js GLOBAL OBJECTS */
let stats;

/* Objects which need to be updated every tick e.g. floating coins */
let coinObjects = [];

let keyStates;

/* Local timer to tell the player how long they have left. 
* Server global timer will eventually end the game, not this one */
let local_timer = 120;

/* track the player with this light to draw shadows near the player  */
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

game_socket.onmessage = handleMessage; 

/**
 * React to gamestate update messages sent from the server
 * 
 * @param {ServerEvent} e -- message from server
 */
function handleMessage(e) {
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
				new CANNON.ContactMaterial(opponent.body.material, groundMat,
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
				new CANNON.ContactMaterial(opponent.body.material, groundMat,
				{friction: 0.8, restitution: 0.5})
				)
				window.opponent = opponent;
			}
		}
		else {
			opponent.body.position.set(Number(message['x']), Number(message['y']), Number(message['z']));
			opponent.update(message);

			if('coin' in message && !(typeof coinObjects === 'undefined')){
				let coin_msg = JSON.parse(message['coin']);

				for (var i = coinObjects.length - 1; i >= 0; i--) {

					if(coin_msg[i]){
						coinObjects[i].is_dead = coin_msg[i];
					}
				}
			}
		}
	}
}


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

	start_local_timer();
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

/**
 * Initialize the local timer 
 */
function start_local_timer(){
	document.getElementById("timer").innerHTML = local_timer;
	setTimeout(countdown, 1000);
}

/**
 * Decremenet the local timer
 */
function countdown(){
	local_timer -= 1;
	document.getElementById("timer").innerHTML = local_timer;
	if (local_timer > 0){
		setTimeout(countdown, 1000)
	}
	else(
		timeup()
	)
}

/**
 * Function called when either the local or global clock runs out.
 * Locks the game and declares a winner*/
function timeup(){
	console.log("TIME IS UP!")
	endGame(player_id);
}

/** 
 * Initialze the keyboard states and add listeners to key downs and key ups.
 */
function initKeyboard(){
	keyStates = {
		'Left': false,
		'Right': false,
		'Up': false,
		'Down': false,
		'Shift': false,
		'Control': false,
		'Space': false,
		'E': false,
	}

	console.log("Now listening for keyboard presses...");
	document.addEventListener('keydown', function(event) {
		let keyPressed = event.code;
		if (event.repeat){
			// ignore repeat (held down) key presses
			return;
		}
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

		// note space is queued up and only unset by the player and not keyup event
		else if (keyPressed === "Space" ){
			keyStates['Space'] = true;
		}

		else if (keyPressed === "KeyE"){
			keyStates['E'] = true;
			endGame()
		}

	})
	/* when a key is realeased, remove it from the keystates list */
	document.addEventListener('keyup', function(event) {
		let keyReleased = event.code;

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
	})
}

/** all map coins and blocks defined in an js object
 * For future work: allow differnt maps to be loaded by serving json strings over server
 */
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
		}, /* */
		{
			x:20,y:15,z:180, width:30,height:10,depth:30,color:"green",
		},
		{
			x:15,y:25,z:220, width:30,height:10,depth:30,color:"blue",
		},
		{
			x:60,y:35,z:250, width:30,height:10,depth:30,color:"yellow",
		},
		{
			x:100,y:50,z:260, width:30,height:10,depth:30,color:"purple",
		},
		{
			x:140,y:60,z:240, width:30,height:10,depth:30,color:"orange",
		},
		{
			x:140,y:70,z:190, width:30,height:10,depth:30,color:"blue",
		},

	],
	coins:[
		{x: 10, y:10, z:10, type:"gold", coin_id:0, is_dead:true},
		{x: 160.13470230751147, y:61.91393497449822, z:87.01602654835118, type:"silver", coin_id:1, is_dead:false},
		{x: 151.88943567364234, y:78.25687719400048, z:120.7770362143744, type:"purple", coin_id:2, is_dead:false},
		{x: 147.39622790877567, y:81.39784064458196, z:133.0516545584428, type:"gold", coin_id:3, is_dead:false},
		{x: 141.7966330198268, y:83.6632531430812, z:147.75905577854738, type:"purple", coin_id:4, is_dead:false},
		{x: 132.16066526548963, y:79.55174935050954, z:192.3196647181211, type:"purple", coin_id:5, is_dead:false},
		{x: 146.62434806128144, y:78.13937121325216, z:193.10311156633023, type:"gold", coin_id:6, is_dead:false},
		{x: 56.11498759700072, y:48.027357370415764, z:256.1916081020078, type:"gold", coin_id:7, is_dead:false},
		{x: 13.581155421942599, y:31.022426583742106, z:240.49315224114372, type:"gold", coin_id:8, is_dead:false},
		{x: 2.807253073718751, y:24.437833661772057, z:183.5654020819816, type:"gold", coin_id:9, is_dead:false},
		{x: 93.01584590961727, y:15.718549324055617, z:154.50160650327686, type:"silver", coin_id:10, is_dead:false},
		{x: 158.89526742970958, y:12.225885463623282, z:90.52624493768941, type:"gold", coin_id:11, is_dead:false},
		{x: 170.5020979275686, y:1.634992764002668, z:55.24369213383543, type:"gold", coin_id:12, is_dead:false},
		{x: 102.53797801675086, y:8.447503748097288, z:3.0256103915847627, type:"silver", coin_id:13, is_dead:false},
		{x: 64.47950100624877, y:14.537392116870297, z:42.884109708515886, type:"gold", coin_id:14, is_dead:false},
		{x: 51.398237178596915, y:13.149205032699115, z:11.49049049728296, type:"silver", coin_id:15, is_dead:false},
		{x: 19.320107564051586, y:11.830710754340439, z:-20.54534071758647, type:"silver", coin_id:16, is_dead:false},
		{x: -19.286154729731006, y:13.128674101849711, z:9.779188359460875, type:"silver", coin_id:17, is_dead:false},
		{x: -11.442028363601937, y:10.01240937999322, z:-7.644811058553531, type:"silver", coin_id:18, is_dead:false},
	],
	spawn_pos : [0,10,0],
	player_locations : [

	]
}

/**
 * Load map
 */
function loadMap(){
	map.spawn_pos = map_json.spawn_pos;
	map.blocks = map_json.blocks;
	player = new Player(...map.spawn_pos);

	/* load all blocks */
	for (let i = 0 ; i < map_json.blocks.length; i++){
		let info = map_json.blocks[i];
		let block = new StaticBox(
			info.x, info.y, info.z, info.width, info.height, info.depth, info.color)
		scene.add(block.mesh);
		world.add(block.body); 
		block.body.material= groundMat;
	}

	/* load all coins */
	for (let i = 0 ; i < map_json.coins.length; i++){
		let info = map_json.coins[i];
		let coin;
		if (info.type=="gold"){
			coin = new GoldCoin(info.x, info.y, info.z, info.coin_id)
		}
		else if (info.type=="purple"){
			coin = new PurpleCoin(info.x, info.y, info.z, info.coin_id)
		}
		else if (info.type=="silver"){
			coin = new SilverCoin(info.x, info.y, info.z, info.coin_id)
		}
		if (info.is_dead){
			coin.is_dead = true
		}
		else {
			coin.is_dead = false
		}
		scene.add(coin.mesh);
		world.add(coin.collider);
		coinObjects.push(coin);
	}

	/* collision events between the player and an object */
	player.body.addEventListener("collide", handleClientPlayerCollision)
	scene.add(player.mesh);
	world.add(player.body);

	world.addContactMaterial(
		new CANNON.ContactMaterial(player.body.material, groundMat,
			{friction: 0.8, restitution: 0.5})
	)

	window.player = player;
}

/** Save map in current state to a json file for loading later */
function saveMap(){
	let map_builder = {};
	map_builder.spawn_pos = map.spawn_pos;
	map_builder.blocks = map.blocks; /* save static list of blocks */
	map_builder.coins = [];
	for (let i = 0; i < coinObjects.length; i++){
		let coin= coinObjects[i];
		let coin_obj = {
			x: coin.mesh.position.x,
			y: coin.mesh.position.y,
			z: coin.mesh.position.z,
			is_dead: coin.is_dead,
			type: coin.name
		}
		map_builder.coins.push(coin_obj);
	}
	console.log(map_builder)
}

window.saveMap = saveMap

/**
 * Initialize three.js rendering variables.
 * Must run before any sort of rendering.
 */
function initThree(){
	scene = new THREE.Scene();
	// scene.add ( new THREE.AxesHelper(5) );

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

	directional_light = new THREE.DirectionalLight(0xffffff, 0.3);
	directional_light.position.set(0,100,0);
	directional_light.castShadow = true;
	directional_light.shadow.camera.left = -20;
	directional_light.shadow.camera.right = 20;
	directional_light.shadow.camera.bottom =-50;
	directional_light.shadow.camera.top = 50;
	scene.add(directional_light);

	scene.fog = new THREE.Fog( scene.background, 1, 5000 );

	/*
	ADD SKYBOX! Uses vertex and fragement shaders defined in the room.html file!
	*/
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		"topColor": { value: new THREE.Color( 0x0077ff ) },
		"bottomColor": { value: new THREE.Color( 0x222222 ) },
		"offset": { value: 33 },
		"exponent": { value: 0.6 }
	};

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
 * Load all GLTF models before using. Loads loads model only once.
 * @param {list} resource_classes_array - a list of all resource js classes to initialize
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

	return Promise.all( promises).then( () =>
		console.log("ALL RESOURCES LOADED")
	);
}

/** 
 * When another player gets a coin it removes the coin for all players. 
 * 
 * @param removeCoin 
 * */
function removeCoin(coin_id){
	for (let i = 0 ; i < coinObjects.length ; i++){
		let coin = coinObjects[i]
		if (coin.coin_id == coin_id){
			coin.is_dead = true;
		}
	}
}


/** handle all behavior */
function tick(){
	stats.begin();

	let playerLastPosition = {
		x: player.mesh.position.x,
		y: player.mesh.position.y,
		z: player.mesh.position.z
	};

	/* update player score */
	let score_element = document.getElementById('score');
	score_element.innerHTML = player.score;
	let currentScore = document.getElementById('currentScore')
	currentScore.value = player.score

	/*update physics engine */
	world.step(1.0 / 60.0);

	/* move player back to spawn if they fall off map */
	if (player.mesh.position.y < -20){
		resetFunction()
	}

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
	if(typeof  coinObjects !== 'undefined'){
		for (var i = coinObjects.length - 1; i >= 0; i--) {
		coinObjects[i].update();
		// console.log(coinObjects[i].mesh.position)
    	if (coinObjects[i].is_dead) {
    		world.removeBody(coinObjects[i].collider)
			scene.remove(coinObjects[i].mesh)
    	}
	}


}

	/* update renderer */
	renderer.render(scene, camera);

	stats.end();

	let coin_state = {}
	if(typeof  coinObjects !== 'undefined') {
		for (var i = coinObjects.length - 1; i >= 0; i--) {
			coin_state[i] = coinObjects[i].is_dead
		}
	}

	keyStates['x'] = playerLastPosition.x;
	keyStates['y'] = playerLastPosition.y;
	keyStates['z'] = playerLastPosition.z;
	keyStates['coin'] = JSON.stringify(coin_state);



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

	// Save coins

	// End save coins

	/* enqueue next frame */
	animation_frame_request = requestAnimationFrame(tick);

}

/** 
 * Call this function when the player hits any surcace
 * 
 * @param {collisionEvent} e -- cannon.js collision event
 *  */
function handleClientPlayerCollision(e){
		if (e.body.userData.type == "ground"){
			player.jumps_remaining = player.max_jumps;
		}
		if (e.body.userData.type == "coin"){
			let coin = e.body.userData.ref;
			console.log("hit a coin! #", coin.coin_id, " value:", coin.value)
			player.score += coin.value;
			coin.is_dead = true;
			// TODO: Send a message to consumer maybe?
		}
		if (e.body.userData.type == "player"){
			let player2 = e.body.userData.ref;
			console.log("bouncing off another player")
			let dp = new CANNON.Vec3(
				player.body.position.x - player2.body.position.x,
				player.body.position.y - player2.body.position.y,
				player.body.position.z - player2.body.position.z,
			) 
			let norm = dp.length();
			console.log(norm)
			dp = dp.scale(1/norm)
			dp.y += 2;
			dp = dp.scale(10)
			player.body.velocity.x += dp.x;
			player.body.velocity.y += dp.y;
			player.body.velocity.z += dp.z;

			// player.body.velocity += dv*10;
		}
}



window.directional_light = directional_light;

/**
 *  reset the player and camera positions in case they get stuck 
 * */
function resetFunction(){
	player.setPosition(...map.spawn_pos)
	camera.position.z = 20;
	camera.position.y = 20;
	camera.position.x = 0;
}

/**
 * Stop game ticks (three.js and cannon.js) and announce the winner.
 * 
 * @param {player id} winner_id -- the id of the winning player.
 */
function endGame(winner_id= 0){
	let gameover = document.getElementById("gameover")
	if (player_id == winner_id){
		gameover.innerHTML="Game over! Congratulations, you win! <br>Final score " + player.score;
	}
	else{
		gameover.innerHTML="Game over! Too bad, you lost! <br>Final score: "+ player.score;
	}
	gameover.classList.remove("hidden")
	gameover.classList.add("visible")

	window.cancelAnimationFrame(animation_frame_request)
}