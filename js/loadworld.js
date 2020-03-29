function loadMap(filename){
	fetch(filename)
  .then(response => response.json())
	.then((json) =>{
		map = json;
		for (let ii = 0 ; ii<map.heights.length; ii++){
			for (let jj = 0; jj < map.heights[0].length; jj++){
				platforms.push(new Platform(600*ii, 600*jj, map.heights[ii][jj]*60 + 10));
			}
		}
	});

	console.log(platforms);
}


