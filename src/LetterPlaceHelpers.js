import * as tinycolor from 'tinycolor2';

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
		var fillColor = getTileBg(colors, tile.owner, tile.locked, defaultColor);
		
		ctx.fillStyle = fillColor;
		ctx.fillRect(x, y, (10 - space), (10 - space));
	}

	colors.splice(2, 1);

	return canvas.toDataURL();
}

function getTileBg(colors, owner, locked, defaultColor){
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