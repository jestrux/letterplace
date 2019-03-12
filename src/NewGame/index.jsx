import React, { useState, useContext} from 'react';

import { db } from '../data/firebase'
import GameToolbar from '../GameToolbar';
import PickOpponent from './PickOpponent';
import './styles.css';

import { themes, sampleGame, getTilesImage } from '../LetterPlaceHelpers'
import { AuthUser } from '../App';

const NewGame = ( props ) => {
    const authUser = useContext(AuthUser);
    const [ persistingGame, setPersistingGame ] = useState(false);
    const [ opponent, setOpponent ] = useState(null);
    const [ pickingOpponent, setPickingOpponent ] = useState(false);
    const [ themeIndex, setThemeIndex ] = useState(0);
    const [ points, setPoints ] = useState(5);
    
    function rollTheme(){
        const choices = [...Object.keys(themes)];
        choices.splice(themeIndex, 1);
        const randomChoice = Math.floor(Math.random() * (choices.length - 1 - 0 + 1)) + 0;
        setThemeIndex(choices[randomChoice]);
    }

    function handleOpponentSelected(opponent){
        setOpponent(opponent);
        setPickingOpponent(false);
    }

    function handleStartGame(){
        const ref = db.collection('games').doc();
        let newgame = sampleGame();
        const { id, username, dp } = authUser;
        newgame = { 
            ...newgame,
            id: ref.id,
            players: [
                { id, name: username, dp, points: 0 },
                { ...opponent, points: 0 }
            ],
            player1: id,
            player2: opponent.id,
            colors: themes[themeIndex],
            stakes: points,
            summary_image: getTilesImage(newgame.tiles, themes[themeIndex])
        };

        persistGame(ref, newgame);
    }

    function persistGame(dbref, game){
        setPersistingGame(true);
        dbref.set(game).then(() => {
            console.log("Game persisted!");
            props.onStartGame(game);
        })
    }

    const header = (
        <div id="listHeader">
			<button className="action-button" onClick={props.onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
            </button>

			New Game
		</div>
    );

    const pointChoices = [5, 10, 15, 20, 25];

    return (
        <div className="newGameWrapper">
            <div className="newGame">
                { !pickingOpponent && <GameToolbar>{ header }</GameToolbar> }

                <div className="newGameContent">
                    <div className="new-game-item">
                        <label>Opponent</label>
                        <div onClick={() => setPickingOpponent(true)}>
                            { !opponent && <span>Click to pick opponent</span> }

                            { opponent && 
                                <div className="opponent-choice small">
                                    <img src={opponent.dp} alt=""/>
                                    {opponent.name}
                                </div>
                            }
                        </div>

                    </div>
                    
                    <div className="new-game-item theme-item">
                        <div>
                            <label>Theme</label>
                            <div>
                                {
                                    themes[themeIndex].map(color => (
                                        <span key={color} style={{ background: color }}></span>
                                    ))
                                }
                            </div>
                        </div>

                        <button onClick={rollTheme}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>
                    </div>
                    
                    <div className="new-game-item point-picker">
                        <label>Points</label>
                        <div>
                            { points }
                            {/* <input type="range" min="5" max="25" step="5" onChange={(e) => setPoints(e.target.value)} /> */}

                            <div>
                                {
                                    pointChoices.map(point => (
                                        <button key={point} className={points === point ? 'selected' : ''} 
                                            onClick={() => setPoints(point)}>{point}</button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <button id="startButton" onClick={handleStartGame}
                        className={opponent === null ? 'disabled ' : '' + ( persistingGame ? 'loading' : '')}>
                        { !persistingGame && <span> Start Game </span> }
                        { persistingGame && <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg> }
                    </button>
                </div>

                { pickingOpponent && <PickOpponent onClose={() => setPickingOpponent(false) } onOpponentSelected={ handleOpponentSelected } /> }
            </div>
        </div>
    );
}
 
export default NewGame;