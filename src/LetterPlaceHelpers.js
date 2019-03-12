import * as tinycolor from 'tinycolor2';

export const themes = {
	0 : ['#8bc34a', '#5d4037'],
	1 : ['#00bcd4', '#e91e63'],
	2 : ['#009688', '#ff9800']
};

export const getTilesImage = function(tiles, colors){
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = 50;
    canvas.height = 50;
    var defaultColor = "#eee";

	// var space = 0.5;
	var space = 0.5;
	// ctx.fillStyle = "#000";
	// ctx.fillRect(0, 0, (50 + space), (50 + space));
	ctx.fillStyle = "#f0f0f0";
	colors.push(defaultColor);

	for(var i = 0; i < 25; i++){
		var x = (i % 5)*10 + (space * (i%5)) + space;
		var y = Math.floor(i / 5)*10 + space;
		// var defaultColor = i%2 == 0 ? "#f0f0f0" : "#eee";

		var tile = tiles[i];
		var fillColor = _getTileBg(colors, tile.owner, tile.locked, defaultColor);
		
		ctx.fillStyle = fillColor;
		ctx.fillRect(x, y, (10 - space), (10 - space));
	}

	colors.splice(2, 1);

	return canvas.toDataURL();
}

function _getTileBg(colors, owner, locked, defaultColor){
	if(owner !== -1){
		var color = colors[owner];

		if(!locked)
			return color;
		else{
			return tinycolor(color).darken(15).toHexString();
		}
	}else{
		return defaultColor;
	}
}

export const compareValues = function(key, order='asc') {
	return function(a, b) {
		if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key))
			return 0;

		const varA = (typeof a[key] === 'string') ?
			a[key].toUpperCase() : a[key];
		const varB = (typeof b[key] === 'string') ?
			b[key].toUpperCase() : b[key];

		let comparison = 0;
		if (varA > varB)
			comparison = 1;
		else if (varA < varB)
			comparison = -1;
		
		return ((order === 'desc') ? (comparison * -1) : comparison);
	};
}
	
export const sampleGame = function(){
	return {
		id: 'GM'+(Math.floor(Math.random() * 10000) + 7812265), 
		began: false,
		turn : 0,
		next : 1,
		colors: [],
		players: [],
		player1: null,
		player2: null,
		tiles : getRandomTiles(),
		words : [],
		updated_at: new Date().getTime(),
		summary_image: "",
		lastword : "",
	}
}
	
export const getRandomTiles = function(){
	var lettersArray = [];
	for (var i = 0; i < 25; i++) {
			lettersArray[i] = {
				owner  : -1,
				locked : false,
				played : false,
				row : Math.floor(i / 5),
				column : i % 5,
				letter : _getRandomLetter().toUpperCase()
			};
	}

	return lettersArray;
}
	
function _getRandomLetter(){
	var frequencies = {
		'a': 8.167,
		'b': 1.492,
		'c': 2.782,
		'd': 4.253,
		'e': 12.702,
		'f': 2.228,
		'g': 2.015,
		'h': 6.094,
		'i': 6.966,
		'j': 0.153,
		'k': 0.772,
		'l': 4.025,
		'm': 2.406,
		'n': 6.749,
		'o': 7.507,
		'p': 1.929,
		'q': 0.095,
		'r': 5.987,
		's': 6.327,
		't': 9.056,
		'u': 2.758,
		'v': 0.978,
		'w': 2.360,
		'x': 0.150,
		'y': 1.974,
		'z': 0.074
	};
	var total = Object.keys(frequencies).map(function(l) {
			return frequencies[l];
	}).reduce(function(a, b) {
			return a + b;
	}); // This should add up to nearly 100%, but this way we don't have to assume that
	// This map/reduce pattern is common; you can read more about each at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce


	// Conceptually, we're setting up a line where different regions correspond to different letters; the length of the region is proportional to the frequency.  We're then going to grab a random number, look along the 'length' of our line, and find which region our random number lies in.  This means that more frequent letters occupy more of the line and are therefore more likely to be hit by our 'random number' dart.
	var random = Math.random() * total; // Choose a random number

	// And then find the region our random number corresponds to
	var sum = 0;
	for (var letter in frequencies) {
		if (random <= sum)
			return letter;
		else
			sum += frequencies[letter];
	}
}