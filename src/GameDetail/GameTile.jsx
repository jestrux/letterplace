import React from 'react';
import './GameTile.css';

const GameTile = ( props ) => {
    const { tile, background, hidden } = props;

    const tileStyles = {
        backgroundColor: background,
        color: background ? 'white' : '',
        opacity: hidden ? 0 : '',
        pointerEvents: hidden ? 'none' : '',
    }

    let tileClassNames = 'GameTile';
    tileClassNames += tile.lastplayed ? ' last-played' : '';

    return (
        <div onClick={ props.onClicked } className={tileClassNames} style={ tileStyles }>
            { tile.letter }
        </div>
    );
}
 
export default GameTile;