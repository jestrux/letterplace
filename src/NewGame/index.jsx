import React, { useState, useEffect, useContext} from 'react';

import { db } from '../data/firebase'
import GameToolbar from '../GameToolbar';
import TileGrid from '../TileGrid';
import PickOpponent from './PickOpponent';
import './styles.css';

import { themes, sampleGame, getTilesImage } from '../LetterPlaceHelpers'
import { AuthUser } from '../App';
import generateRandomLeters from '../RandomLetters';

const NewGame = ( props ) => {
    const authUser = useContext(AuthUser);
    const [ persistingGame, setPersistingGame ] = useState(false);
    const [ opponent, setOpponent ] = useState(null);
    const [ pickingOpponent, setPickingOpponent ] = useState(false);
    const [ themeIndex, setThemeIndex ] = useState(0);
    const [ points, setPoints ] = useState(5);
    const [ tiles, setTiles ] = useState([]);

    useEffect(() => {
        rollTiles();
    }, []);
    
    function rollTiles(){
        const letters = generateRandomLeters();
        const tiles = letters.map(letter => ({owner: -1, letter}));
        setTiles(tiles);
    }
    
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
            players: [ id, opponent.id ],
            player1: { id, name: username, dp, points: 0 },
            player2: { ...opponent, points: 0 },
            tiles,
            colors: themes[themeIndex],
            stakes: points,
            summary_image: getTilesImage(tiles, themes[themeIndex])
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
                            { !opponent && <span style={{ color: "#999" }}>Click to pick opponent</span> }

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
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
                    
                    <div className="new-game-item new-game-tiles" style={{height: "auto !important"}}>
                        <label>Tiles</label>
                        <div>
                            Click button to shuffle tiles

                            <div style={{ marginTop: "1em" }}>
                                <TileGrid tiles={tiles} />
                            </div>
                        </div>

                        <button onClick={rollTiles}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                        </button>
                    </div>

                    <button id="startButton" onClick={handleStartGame}
                        className={opponent === null ? 'disabled ' : '' + ( persistingGame ? 'loading' : '')}>
                        { !persistingGame && 
                            <span> 
                                Start Game 
                                <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                            </span> 
                        }
                        { persistingGame && <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg> }
                    </button>
                </div>

                { pickingOpponent && <PickOpponent onClose={() => setPickingOpponent(false) } onOpponentSelected={ handleOpponentSelected } /> }
            </div>
        </div>
    );
}
 
export default NewGame;