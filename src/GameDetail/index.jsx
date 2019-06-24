import React from 'react';
import _find from 'lodash/find';
import _cloneDeep from 'lodash/cloneDeep';
import './GameDetail.css';

import GameToolbar from '../GameToolbar';
import GameTile from './GameTile';
import { getLoaderImage, getTilesImage, getTileBg, isSurrounded } from '../LetterPlaceHelpers';
import { db } from '../data/firebase';
import { sendTurnNotification, sendNewGameNotification, showGameOverMessage } from '../data/methods';
import Toast from '../Toast';

class GameDetail extends React.Component {
    state = { 
        showLastPlayedTiles: false, 
        game: null, 
        savingGame: false, 
        playedTiles: [], 
        playedWord: '',
        addedPoints: 5,
        capturedPoints: 7
    }

    componentWillReceiveProps(newProps){
        if(newProps.closingCurGame){
            this.flipTileGrid(true);
            return;
        }
        if(!newProps.game)
            return;

        this.setupGame(newProps);
    }
    
    componentWillMount(){
        this.setupGame(this.props);
    }

    setupGame = (props) => {
        let { game } = props;
        if(game && game.players){
            this.setState({game, playedTiles: []}, () => {
                this.setWord();
                this.setScore();
                this.flipTileGrid();
                if(!game.over)
                    this.showLastPlayedIfTurn(game);
            });
        }
    }

    showLastPlayedIfTurn(game){
        const curUserIdx = game.players.indexOf(this.props.user.id);
        const isCurUserTurn = game.turn === curUserIdx;
        console.log("Game changed: ", isCurUserTurn);

        if(isCurUserTurn){
            setTimeout(() => {
                this.showTurnMessage();
            }, 100);
        }
    }

    playerFaceClicked(index){
        const game = this.props.game;

        if(index === game.next){
            this.showTurnMessage();
        }
    }

    showTurnMessage(){
        if(this.state.showLastPlayedTiles){
            this.setState({showLastPlayedTiles: false}, () => {
                this.setState({showLastPlayedTiles: true}, () => {
                    setTimeout(() => {
                        this.setState({showLastPlayedTiles: false});
                    }, 1000);
                });
            });
        }else{
            this.setState({showLastPlayedTiles: true}, () => {
                setTimeout(() => {
                    this.setState({showLastPlayedTiles: false});
                }, 1000);
            });
        }
    }

    playTile = (index, tile) => {
        const clonedTile = _cloneDeep(tile);
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
        game = game ? _cloneDeep(game) : _cloneDeep(this.props.game);
        const gamePlayers = game.players;

        if(!gamePlayers){
            return;
        }

        const curUserIdx = gamePlayers.indexOf(user.id);
        const otherUserIdx = curUserIdx === 0 ? 1 : 0;
        const otherUserTiles = this.state.playedTiles.filter(p => p.owner === otherUserIdx && !p.locked);
        const newTiles = this.state.playedTiles.filter(p => p.owner === -1);
        const addedPoints = otherUserTiles.length + newTiles.length;
        const capturedPoints = otherUserTiles.length;

        let players = _cloneDeep([game.player1, game.player2]);
        players[curUserIdx].points += addedPoints;
        players[otherUserIdx].points -= otherUserTiles.length;
        game.player1 = players[0];
        game.player2 = players[1];
        this.setState({game, addedPoints, capturedPoints});
    }
    
    setWord = () => {
        this.setState({playedWord: this.state.playedTiles.map( t => t.letter ).join('')});
    }
    
    clearPlayedTiles = (justTiles = false) => {
        this.setState({playedTiles: []}, () => {
            this.setWord();

            // if(!justTiles)
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
    
    flipTileGrid = (back) => {
        if(!this.props.curGameImage)
            return;

        const from = this.props.curGameImage;
        const to = document.querySelector('#gameTiles');
        const fromBox = from.getBoundingClientRect();
        const toBox = to.getBoundingClientRect();

        let translateX = (fromBox.left + fromBox.width / 2) - (toBox.left + toBox.width / 2);
        let translateY = (fromBox.top + fromBox.height / 2) - (toBox.top + toBox.height / 2);
        let scaleX = fromBox.width / toBox.width;
        let scaleY = fromBox.height / toBox.height;

        const animatingClass = back ? "animating-back" : "animating-screens";
        const translate = 'translate('+translateX + 'px, ' + translateY +'px)';
        const scale = 'scale('+scaleX + ', ' + scaleY + ')';
        const transform = translate + ' ' + scale;

        if(!back)
            to.style.transform = transform;
        else
            to.style.transform = 'none';

        setTimeout(() => {
            document.querySelector(".App").classList.add(animatingClass);
            if(back)
                to.style.transform = transform;
            else
                to.style.transform = 'none';

            to.addEventListener('transitionend', () => {
                document.querySelector(".App").classList.remove(animatingClass);
                // if(back){
                //     this.props.closeAnimationDone()
                // }
            })
        });
    }

    submitPlayedWord = () => {
        let {game, playedTiles, playedWord} = this.state;
        game = _cloneDeep(game);
        const { players, words } = game;
        const curUserIdx = players.indexOf(this.props.user.id);
        const notTurn = game.turn !== curUserIdx;

        if(notTurn){
            return alert("Please wait your turn!!!");
        }

        let parentWord = words && words.length ? _find(words, w => w.word.indexOf(playedWord) !== -1) : null;
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

            var newTiles = game.tiles.map((tile, index) => {
                if(playedTileIndexes.indexOf(index) !== -1){
                    tile.lastplayed = true;
                    if(!tile.locked)
                        tile.owner = game.turn;
                }
                else if(tile.lastplayed)
                    delete tile.lastplayed;

                return tile;
            });
            // set lock state after played tiles have been set
            game.tiles = newTiles.map((tile, index) => {
                var surrounded = isSurrounded(newTiles, index);
                if(surrounded && (!tile.lastplayed || tile.owner === game.turn))
                    tile.locked = true;
                else
                    delete tile.locked;

                return tile;
            });
            game.player1.points = game.tiles.filter(t => t.owner === 0).length;
            game.player2.points = game.tiles.filter(t => t.owner === 1).length;
            // only add game over field if game is over
            if(game.tiles.filter(t => t.owner === -1).length === 0)
                game.over = true;

            const turns = [game.turn, game.next];
            game.next = turns[0];
            game.turn = turns[1];
            game.began = true;
            game.summary_image = getTilesImage(game.tiles, game.colors);
            game.updated_at = new Date().getTime();
            this.persistGame(game);
        }
    }

    setSavingLoader = (state) => {
        if(state)
            document.querySelector("#savingGameLoader").style.opacity = 1;
        else
            setTimeout(() => {
                document.querySelector("#savingGameLoader").style.opacity = 0;
            }, 400);
        this.setState({savingGame: state});
    }

    persistGame(game){
        const capturedPoints = this.state.capturedPoints;
        const addedPoints = this.state.addedPoints;
            
        this.setSavingLoader(true);
        const gameRef = db.doc('games/' + game.id);
        gameRef.set(game)
            .then(async () => {
                console.log("Game saved!");
                if(!game.over)
                    this.showScoreToast(game, capturedPoints, addedPoints);

                this.clearPlayedTiles();
                this.props.onGameChanged(game);
                this.setSavingLoader(false);

                if(game.over)
                    showGameOverMessage(game, this.props.user.id);

                this.notifyOtherPlayer(game);
            })
            .catch(() => {
                this.clearPlayedTiles();
                window.alert("Failed to save game");
            });
    }

    showScoreToast = (game, capturedPoints, addedPoints) => {
        const reducedColor = game.colors[game.next];
        const addedColor = game.colors[game.turn];

        console.log("Points: ", capturedPoints, addedPoints);

        var scoreToast = document.createElement('div');
        scoreToast.setAttribute("id", "scoreToast");
        scoreToast.innerHTML = `<div><span style="color: ${reducedColor}">-${capturedPoints}</span> <span style="color: ${addedColor}">+${addedPoints}</span></div>`;
        document.querySelector("#GameDetail").appendChild(scoreToast);
        scoreToast.classList.add("visible");

        setTimeout(() => {
            scoreToast.classList.remove("visible");
            scoreToast.classList.add("invisible");

            setTimeout(() => {
                scoreToast.remove();
            }, 500);
        }, 2500);
    }

    notifyOtherPlayer = async (game) => {
        const user = this.props.user;
        let player = user.name;
        player = player.charAt(0).toUpperCase() + player.substr(1);
        const otherPlayerId = game.players[0] === user.id ? game.player2.id : game.player1.id;

        let notificationResult;
        if(game.words.length > 1)
            notificationResult = await sendTurnNotification(player, otherPlayerId, game);
        else
            notificationResult = await sendNewGameNotification(player, otherPlayerId, game);

        console.log("Notification sent: ", notificationResult);
        return notificationResult;
    }
    
    render() { 
        const { showLastPlayedTiles, game, savingGame } = this.state;
        const { tiles, words } = game;
        const { playedTiles, playedWord } = this.state;
        const playing = playedTiles.length > 0;
        const played_indexes = playedTiles.map( t => t.original_index );
        const invalidWord = !playedWord.length || window.letterpressDictionary.indexOf(playedWord.toLowerCase()) === -1;
        const subWordAlreadyPlayed = playedWord.length && words && words.length && words.filter(w => w.word.indexOf(playedWord) !== -1).length > 0;

        const curUserIdx = game && game.players ? game.players.indexOf(this.props.user.id) : 0;
        const nextPlayer = game.next === 0 ? game.player1 : game.player2;
        let turnMessage = "You";
        if(nextPlayer && (game.next !== curUserIdx))
            turnMessage = nextPlayer.name;
        turnMessage += " played <strong>"+game.lastword+"</strong>";

        const loaderImage = getLoaderImage();

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
                { game && game.players && 
                    <div id="GameDetail" className={showLastPlayedTiles ? 'show-last-played' : ''}>
                        <div id="gameDetailBg"></div>

                        <GameToolbar>{ header }</GameToolbar>

                        <div id="gamePlayers" className={ !playing ? 'visible' : '' }>
                            <div onClick={() => this.playerFaceClicked(0)} className={ 'game-player ' + ((game.turn === 0) ? 'current' : '') } 
                                style={{ color: game.colors[0] }}>
                                <img src={game.player1.dp} alt=""/>
                                <span>{ game.player1.points }</span>
                            </div>
                            <div onClick={() => this.playerFaceClicked(1)} className={ 'game-player ' + ((game.turn === 1) ? 'current' : '') } 
                                style={{ color: game.colors[1] }}>
                                <img src={game.player2.dp} alt=""/>
                                <span>{ game.player2.points }</span>
                            </div>

                            { showLastPlayedTiles &&
                                <Toast style={{ top: '4em', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div dangerouslySetInnerHTML={{__html: turnMessage}}></div>
                                </Toast>
                            }
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
                                            background={ tile.owner === - 1 ? null : getTileBg(game.colors[tile.owner], tile.locked) } />
                                    );
                                })
                            }
                        </div>

                        <div id="savingGameLoader"
                            className={ savingGame ? 'visible' : 'invisible'}>
                            <div id="loaderIcon">
                                <div style={{ backgroundImage: `url(${loaderImage})` }}></div>
                            </div>
                            {/* <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg> */}
                            <span>Saving Game...</span>
                        </div>
                    </div>
                }
            </React.Fragment>
        );
    }
}
 
export default GameDetail;