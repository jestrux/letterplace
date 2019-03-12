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

			<span style={ { marginTop: '-4px' } }>Letterplace</span>

			{/* <div id="user">
				<div id="theDp" style={{ backgroundImage: `url(${user.dp})` }}></div>
            </div> */}
            
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <button style={ { marginRight: '1.1em' } } 
                    className="action-button" onClick={props.onRefreshGames}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                </button>

                <button id="logoutBtn" onClick={props.onLogout}>Logout</button>
            </div>
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