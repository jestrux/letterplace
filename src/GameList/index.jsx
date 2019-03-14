import React, { useState, useContext } from 'react';
import './GameList.css';
import logo from '../logo.png';


import GameToolbar from '../GameToolbar';
import GameListItem from './GameListItem';
import NewGame from '../NewGame';
import { messaging, db } from '../data/firebase';
import { AuthUser } from '../App';
import Toast from '../Toast';

const GameList = ( props ) => { 
    const authUser = useContext(AuthUser);
    const { games, user, loading, newGameIndex } = props;
    const [ startingGame, setStartingGame ] = useState(false);
    const [ notificationsAllowed, setNotificationsAllowed ] = useState("Notification" in window && Notification.permission === 'granted' && authUser.fcm_token);

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

    function allowNotifications(){
        messaging.requestPermission().then(() => {
            console.log('Notification permission granted.');
            setNotificationsAllowed(true);
            saveUserFCMToken();
        }).catch(function(err) {
            console.log('Unable to get permission to notify.', err);
        });
    }

    function saveUserFCMToken(){
        messaging.getToken().then(function(currentToken) {
            if (currentToken) {
                authUser.fcm_token = currentToken;

                db.doc("users/" + authUser.id)
                    .set(user).then(() => console.log("Auth token persisted"));
            } 
            else {
                console.log('No Instance ID token available. Request permission to generate one.');
            }
        })
        .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
        });
    }

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

    let newGameMessage = null;
    if(games && games.length && newGameIndex !== -1)
      newGameMessage = `New game received from <strong>${games[newGameIndex].players[0].name}</strong>`;

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

                { newGameMessage &&
                    <Toast style={{ top: '4em', left: '50%', transform: 'translateX(-50%)' }}>
                        <div dangerouslySetInnerHTML={{__html: newGameMessage}}></div>
                    </Toast>
                }

                { "Notification" in window && !notificationsAllowed &&
                    <div className="notification-alert">
                        <div>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z"/></svg>

                            <div>
                                {/* <h3>Turn On Notifications</h3> */}
                                <p>
                                    Turn notifications to get notified when it's your turn to play.
                                </p>
                            </div>
                        </div>

                        <div>
                            <button onClick={allowNotifications}>Turn On</button>
                        </div>
                    </div>
                }

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