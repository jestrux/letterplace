import React, { useState } from 'react';
import './GameList.css';
import logo from '../logo.png';


import GameToolbar from '../GameToolbar';
import GameListItem from './GameListItem';
import NewGame from '../NewGame';

const GameList = ( props ) => { 
    const { games, user, loading } = props;
    const [ startingGame, setStartingGame ] = useState(false);

    const header = (
        <div id="listHeader">
            <img src={logo} alt="" id="appLogo"/>

			Letterplace

			{/* <div id="user">
				<div id="theDp" style={{ backgroundImage: `url(${user.dp})` }}></div>
			</div> */}

        { <button id="logoutBtn" onClick={props.onLogout}>Logout</button> }
		</div>
    );

    function handleGameClicked(index){
        const list = document.querySelector('#GameList')
        const items = list.querySelectorAll('.GameListItem')
        const image = items[index + 1].querySelector('#preview');

        props.onViewGame(index, image);
    }

    function handleStartGame(game) {
        setStartingGame(false);
        props.onStartGame(game);
    }

    return (
        <React.Fragment>
            <div id="GameList">
                { !startingGame &&  <GameToolbar>{ header }</GameToolbar> }

                <div className="GameListItem" onClick={() => setStartingGame(true)}>
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
                        <GameListItem selected={props.currentGame === index} onClicked={ ( image ) => handleGameClicked(index, image) } key={ game.id } game={game} user={user} />
                    ))
                }
            </div>

            { startingGame && <NewGame onClose={() => setStartingGame(false) } onStartGame={ handleStartGame } /> }
        </React.Fragment>
    );
}
 
export default GameList;