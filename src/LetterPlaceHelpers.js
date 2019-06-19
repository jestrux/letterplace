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

	var space = 0.5;
	ctx.fillStyle = "#f0f0f0";
	colors.push(defaultColor);

	for(var i = 0; i < 25; i++){
		var x = (i % 5)*10 + (space * (i%5)) + space;
		var y = Math.floor(i / 5)*10 + space;

		var tile = tiles[i];
		var fillColor = getTileBg(colors, tile.owner, tile.locked, defaultColor);
		
		ctx.fillStyle = fillColor;
		ctx.fillRect(x, y, (10 - space), (10 - space));
	}

	colors.splice(2, 1);

	return canvas.toDataURL().replace("data:image/png;base64,", "");
}

export const getTileBg = (...args) => {
	if(args.length === 2){
		const [color, locked] = args;
		return locked ? tinycolor(color).darken(10).toHexString() : color;
	}
	const [colors, owner, locked, defaultColor] = args;
	if(owner !== -1){
		var color = colors[owner];

		if(!locked)
			return color;
		else
			return tinycolor(color).darken(10).toHexString();
	}
	else
		return defaultColor;
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

function _tileOnMatrix(tiles, row, col){
	var rowOutOfBound = row < 0 || row > 4;
	var colOutOfBound = col < 0 || col > 4;
	if(rowOutOfBound || colOutOfBound)
		return null;

	var index = (row * 5) + col;
	return tiles[index];
}

export const isSurrounded = (tiles, index) => {
	var tile = tiles[index];
	var tileOwner = tile.owner;
	if(tileOwner === -1){
		return false;
	}
	var trow = Math.floor(index / 5);
	var tcol = index - (trow * 5);
	var tileAbove = _tileOnMatrix(tiles, trow - 1, tcol);
	var tileBelow = _tileOnMatrix(tiles, trow + 1, tcol);
	var tileBefore = _tileOnMatrix(tiles, trow, tcol - 1);
	var tileAfter = _tileOnMatrix(tiles, trow, tcol + 1);

	var onLeft = tcol === 0;
	var onRight = tcol === 4;
	var onTop = trow === 0;
	var onBottom = trow === 4;

	var topCovered = onTop || (tileAbove && tileAbove.owner === tileOwner);
	var leftCovered = onLeft || (tileBefore && tileBefore.owner === tileOwner);
	var rightCovered = onRight || (tileAfter && tileAfter.owner === tileOwner);
	var bottomCovered = onBottom || (tileBelow && tileBelow.owner === tileOwner);
	
	return topCovered && bottomCovered && rightCovered && leftCovered;
}