import React from 'react';
import './GameList.css';
import GameListItem from './GameListItem';

const GameList = ( props ) => { 
    const { games, user, loading } = props;

    return (<div id="GameList">
        <div className="GameListItem">
            <div id="preview" className="tiles-preview">
                <svg fill="#888" width="30px" height="30px" viewBox="0 0 42 42" style={{enableBackground:'new 0 0 42 42'}}><path d="M37.059,16H26V4.941C26,2.224,23.718,0,21,0s-5,2.224-5,4.941V16H4.941C2.224,16,0,18.282,0,21s2.224,5,4.941,5H16v11.059 C16,39.776,18.282,42,21,42s5-2.224,5-4.941V26h11.059C39.776,26,42,23.718,42,21S39.776,16,37.059,16z"/></svg>
            </div>
            <div className="item-text">
                <h3>
                    New Game
                </h3>
            </div>
        </div>
        {
            loading && <p className="text-center">Fetching your games....</p>
        }
        { games.map( (game, index) => (
                <GameListItem onClicked={ () => props.onViewGame(index) } key={ game.id } game={game} user={user} />
            ))
        }
        </div>
    );
}
 
export default GameList;