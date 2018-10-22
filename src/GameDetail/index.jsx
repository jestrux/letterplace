import React from 'react';
import './GameDetail.css';
import GameTile from './GameTile';

const GameDetail = ( { game, user } ) => { 
    const { tiles } = game;

    return (<div id="GameDetail">
            <div id="gamePlayers">
                <div className="game-player" style={{ color: game.colors[0] }}>
                    <img src={game.players[0].dp} alt=""/>
                    { game.players[0].points }
                </div>
                <div className="game-player" style={{ color: game.colors[1] }}>
                    <img src={game.players[1].dp} alt=""/>
                    { game.players[1].points }
                </div>
            </div>
            <div id="gameTiles">
                { tiles.map( (tile, index) => (
                        <GameTile key={ index } tile={tile} background={ tile.owner === - 1 ? null : game.colors[tile.owner] } />
                    ))
                }
            </div>
        </div>
    );
}
 
export default GameDetail;