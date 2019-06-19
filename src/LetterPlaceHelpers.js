import * as tinycolor from 'tinycolor2';
import generateRandomLeters from './RandomLetters';

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

function _getRandomTiles(){
	var letters = generateRandomLeters();
	return letters.map(letter => ({owner: -1, letter}));
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
		tiles : _getRandomTiles(),
		words : [],
		updated_at: new Date().getTime(),
		summary_image: "",
		lastword : "",
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