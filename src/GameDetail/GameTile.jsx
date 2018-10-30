import React from 'react';
import './GameTile.css';

const GameTile = ( props ) => {
    function getDarkerShade(color) {
        const percent = -20;

        if(color[0] === "#")
            color = color.substr(1, color.length - 1);
    
    
        var num = parseInt(color,16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = (num >> 8 & 0x00FF) + amt,
            G = (num & 0x0000FF) + amt;
    
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
    }

    const { tile, background, hidden } = props;

    const tileStyles = {
        backgroundColor: background ? tile.locked ? getDarkerShade(background) : background : '',
        color: background ? 'white' : '',
        opacity: hidden ? 0 : '',
        pointerEvents: hidden ? 'none' : '',
    }

    return (
        <div onClick={ props.onClicked } className="GameTile" style={ tileStyles }>
            { tile.letter }
        </div>
    );
}
 
export default GameTile;