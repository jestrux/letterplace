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

export const compareValues = function(key, order='asc') {
	return function(a, b) {
	  if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
		// property doesn't exist on either object
		return 0;
	  }
  
	  const varA = (typeof a[key] === 'string') ?
		a[key].toUpperCase() : a[key];
	  const varB = (typeof b[key] === 'string') ?
		b[key].toUpperCase() : b[key];
  
	  let comparison = 0;
	  if (varA > varB) {
		comparison = 1;
	  } else if (varA < varB) {
		comparison = -1;
	  }
	  return (
		(order === 'desc') ? (comparison * -1) : comparison
	  );
	};
  }