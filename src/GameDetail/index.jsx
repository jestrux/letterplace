import React from 'react';
import './GameDetail.css';

import GameToolbar from '../GameToolbar';
import GameTile from './GameTile';
import { getTilesImage } from '../LetterPlaceHelpers';
import { db } from '../data/firebase';

class GameDetail extends React.Component {
    state = { game: {}, savingGame: false, playedTiles: [], playedWord: '' }

    componentWillReceiveProps(newProps){
        if(!newProps.game)
            return;

        let { game } = newProps;
        if(game && game.players){
            this.setState({game, playedTiles: []}, () => {
                this.setWord();
                this.setScore();
            });
        }
    }
    
    componentWillMount(){
        let { game } = this.props;
        if(game && game.players){
            this.setState({game, playedTiles: []}, () => {
                this.setWord();
                this.setScore();
            });
        }
    }

    playTile = (index, tile) => {
        const clonedTile = JSON.parse(JSON.stringify(tile));
        const gameTiles = document.querySelectorAll('#gameTiles .GameTile');
        const fromTile = gameTiles[index];

        clonedTile.original_index = index;
        this.setState({playedTiles: [...this.state.playedTiles, clonedTile]}, () => {
            this.setWord();
            this.setScore();

            const playedTiles = document.querySelectorAll('#playedTiles .GameTile');
            const toTile = playedTiles[this.state.playedTiles.length - 1];

            this.flipTile(fromTile, toTile);
        });
    }

    unPlayTile = (index) => {
        this.setState({playedTiles: this.state.playedTiles.filter( (tile, i) => i !== index)}, () => {
            this.setWord();
            this.setScore();
        });
    }
    
    setScore = () => {
        let { user, game } = this.props;
        game = JSON.parse(JSON.stringify(game));
        const gamePlayers = game.players;

        if(!gamePlayers){
            return;
        }

        const curUserIdx = gamePlayers.findIndex(p => p.id === user.id);
        const otherUserIdx = curUserIdx === 0 ? 1 : 0;
        const otherUserTiles = this.state.playedTiles.filter(p => p.owner === otherUserIdx && !p.locked);
        const newTiles = this.state.playedTiles.filter(p => p.owner === -1);
        const addedPoints = otherUserTiles.length + newTiles.length;

        let players = JSON.parse(JSON.stringify(gamePlayers));
        players[curUserIdx].points += addedPoints;
        players[otherUserIdx].points -= otherUserTiles.length;
        game.players = players;
        this.setState({game});
    }
    
    setWord = () => {
        this.setState({playedWord: this.state.playedTiles.map( t => t.letter ).join('')});
    }
    
    clearPlayedTiles = (justTiles = false) => {
        this.setState({playedTiles: []}, () => {
            this.setWord();

            if(!justTiles)
                this.setScore();
        });
    }

    flipTile = (from, to, back) => {
        const fromBox = from.getBoundingClientRect();
        const toBox = to.getBoundingClientRect();

        let translateX = fromBox.left - toBox.left;
        let translateY = fromBox.top - toBox.top;

        if(back){
            // translateX *= -1;
            translateY *= -1;
        }

        const translate = 'translate('+translateX + 'px, ' + translateY +'px)';

        const scaleX = fromBox.width / toBox.width;
        const scaleY = fromBox.height / toBox.height;
        const scale = 'scale('+scaleX + ', ' + scaleY + ')';
        
        const transform = translate + ' ' + scale;
        to.style.transform = transform;

        setTimeout(() => {
            to.classList.add('animated-tile');
            to.style.transform = 'none';

            to.addEventListener('transitionend', () => {
                to.classList.remove('animated-tile');
            })
        }, 10);
    }

    submitPlayedWord = () => {
        let {game, playedTiles, playedWord} = this.state;
        game = JSON.parse(JSON.stringify(game));
        const { players, words } = game;
        const curUserIdx = players.findIndex(p => p.id === this.props.user.id);
        const notTurn = game.turn !== curUserIdx;

        if(notTurn){
            return alert("Please wait your turn!!!");
        }

        let parentWord = words && words.length ? words.find(w => w.word.indexOf(playedWord) !== -1) : null;
        if(parentWord){
            parentWord = parentWord.word;
            if(parentWord.length === playedWord.length)
                window.alert(`${playedWord} was already played!`);
            else
                window.alert(`${playedWord} is subword of ${parentWord}`);
        }else{
            const playedTileIndexes = playedTiles.map(t => t.original_index);
            const newWord = {
                player: game.turn,
                word: playedWord,
                letters: playedTileIndexes
            };
            if(!game.words){
                game.words = [];
            }

            game.words.push(newWord);

            game.lastword = playedWord;

            game.tiles = game.tiles.map((tile, index) => {
                if(playedTileIndexes.indexOf(index) !== -1){
                    tile.played = true;
                    tile.lastplayed = true;
                    if(tile.locked){
                        tile.locked = false;
                    }else{
                        tile.owner = game.turn;
                    }
                }else{
                    tile.lastplayed = false;
                }

                return tile;
            });

            const turns = [game.turn, game.next];
            game.next = turns[0];
            game.turn = turns[1];
            game.began = true;
            game.summary_image = getTilesImage(game.tiles, game.colors);
            game.updated_at = new Date().getTime();
            this.persistGame(game);
        }
    }

    persistGame(game){
        this.setState({savingGame: true});
        const gameRef = db.doc('games/' + game.id);
        gameRef.set(game)
            .then(() => {
                console.log("Game saved!");
                this.clearPlayedTiles();
                this.setState({savingGame: false}, () => {
                    this.props.onGameChanged(game);
                });
            })
            .catch(() => {
                this.clearPlayedTiles();
                window.alert("Failed to save game");
            });
    }
    
    render() { 
        const { game, savingGame } = this.state;
        const { tiles, words } = game;
        const { playedTiles, playedWord } = this.state;
        const playing = playedTiles.length > 0;
        const played_indexes = playedTiles.map( t => t.original_index );
        const invalidWord = !playedWord.length || window.letterpressDictionary.indexOf(playedWord.toLowerCase()) === -1;
        const subWordAlreadyPlayed = playedWord.length && words && words.length && words.filter(w => w.word.indexOf(playedWord) !== -1).length > 0;

        const header = (
            <div id="detailHeader">
                { !playing && <button id="backButton" onClick={ this.props.onGoHome }>back</button> }
    
                { playing && 
                    <React.Fragment>
                        <button onClick={ this.clearPlayedTiles }>clear</button>
                        <button id="submitBtn"
                            onClick={ this.submitPlayedWord }
                            className={ (invalidWord ? 'disabled ' : '') + (subWordAlreadyPlayed ? 'error' : '') }>submit</button>
                    </React.Fragment>
                }
            </div>
        );

        return ( 
            <React.Fragment>
                <div id="GameDetail">
                    { !savingGame && <GameToolbar>{ header }</GameToolbar> }

                    <div id="gamePlayers" className={ !playing ? 'visible' : '' }>
                        <div className={ 'game-player ' + ((game.turn === 0) ? 'current' : '') } 
                             style={{ color: game.colors[0] }}>
                            <img src={game.players[0].dp} alt=""/>
                            <span>{ game.players[0].points }</span>
                        </div>
                        <div className={ 'game-player ' + ((game.turn === 1) ? 'current' : '') } 
                             style={{ color: game.colors[1] }}>
                            <img src={game.players[1].dp} alt=""/>
                            <span>{ game.players[1].points }</span>
                        </div>
                    </div>
                    <div id="playedTiles" className={ playing ? 'visible' : '' }>
                        { playedTiles.map( (tile, index) => (
                                <GameTile 
                                    key={ index } 
                                    tile={tile}
                                    onClicked={ () => this.unPlayTile(index) }
                                    background={ tile.owner === - 1 ? null : game.colors[tile.owner] } />
                            ))
                        }
                    </div>
                    <div id="gameTiles">
                        { 
                            tiles.map( (tile, index) => {
                                const hidden = played_indexes.indexOf(index) !== -1;

                                return (
                                    <GameTile 
                                        key={ index } 
                                        tile={tile} 
                                        onClicked={ () => this.playTile(index, tile) }
                                        hidden={hidden}
                                        background={ tile.owner === - 1 ? null : game.colors[tile.owner] } />
                                );
                            })
                        }
                    </div>

                    { savingGame &&  
                        <div id="savingGameLoader">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>

                            Saving Game...
                        </div>
                    }
                </div>
            </React.Fragment>
        );
    }
}
 
export default GameDetail;