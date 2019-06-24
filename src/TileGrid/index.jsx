import React from 'react';
import { getTileBg } from '../LetterPlaceHelpers';
import Tile from './Tile';
import './styles.css';

const TileGrid = ({ tiles, gameColors, playedIndexes, onTileClicked }) => {
    return ( 
        <div id="TileGrid">
            { 
                tiles.map((tile, index) => {
                    const hidden = playedIndexes && playedIndexes.indexOf(index) !== -1;

                    return (
                        <Tile 
                            key={ index } 
                            tile={tile} 
                            onClicked={ () => onTileClicked ? onTileClicked(index, tile) : null }
                            hidden={hidden}
                            background={ tile.owner === - 1 || !gameColors ? null : getTileBg(gameColors[tile.owner], tile.locked) } />
                    );
                })
            }
        </div>
    );
}
 
export default TileGrid;