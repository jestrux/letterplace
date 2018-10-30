import React from 'react';
import './GameDetail.css';

import GameToolbar from '../GameToolbar';
import GameTile from './GameTile';

class GameDetail extends React.Component {
    state = { playedTiles: [], playedWord: '' }

    playTile = (index, tile) => {
        const clonedTile = JSON.parse(JSON.stringify(tile));
        const gameTiles = document.querySelectorAll('#gameTiles .GameTile');
        const fromTile = gameTiles[index];

        clonedTile.original_index = index;
        this.setState({playedTiles: [...this.state.playedTiles, clonedTile]}, () => {
            this.setWord();

            const playedTiles = document.querySelectorAll('#playedTiles .GameTile');
            const toTile = playedTiles[this.state.playedTiles.length - 1];

            this.flipTile(fromTile, toTile);
        });
    }

    unPlayTile = (index) => {
        this.setState({playedTiles: this.state.playedTiles.filter( (tile, i) => i !== index)}, () => {
            this.setWord();
        });
    }
    
    setWord = () => {
        this.setState({playedWord: this.state.playedTiles.map( t => t.letter ).join('')});
    }
    
    clearPlayedTiles = () => {
        this.setState({playedTiles: []});
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
    
    render() { 
        const { game, user } = this.props;
        const { tiles } = game;
        const { playedTiles, playedWord } = this.state;
        const playing = playedTiles.length > 0;
        const played_indexes = playedTiles.map( t => t.original_index );
        const invalidWord = !playedWord.length || window.letterpressDictionary.indexOf(playedWord.toLowerCase()) === -1;

        const header = (
            <div id="detailHeader">
                { !playing && <button onClick={ this.props.onGoHome }>back</button> }
    
                { playing && 
                    <React.Fragment>
                        <button onClick={ this.clearPlayedTiles }>clear</button>
                        <button id="submitBtn"
                            onClick={ this.submitPlayedWord }
                            className={ invalidWord ? 'disabled' : '' }>submit</button>
                    </React.Fragment>
                }
            </div>
        );

        return ( 
            <React.Fragment>
                <div id="GameDetail">
                    <GameToolbar>{ header }</GameToolbar>
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
                </div>
            </React.Fragment>
        );
    }
}
 
export default GameDetail;