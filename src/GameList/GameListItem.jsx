import React from 'react';
import './GameListItem.css';

const GameListItem = ( props ) => {
    const { game, user } = props;

    function _getTurnMessage(gameOver, user, turn, players){
        if(gameOver)
            return "Game Over";
        else if(players[turn].id === user.id)
            return "Your turn";
        else
            return players[turn].name + "'s turn";
    }

    function _getLastPlayedMessage(gameOver, user, next, players, lastword){
        const otherPlayerIdx = players.findIndex(id => id !== user.id);
        const otherPlayer = players[otherPlayerIdx].name;
        
        if(gameOver){
            const curPlayerIdx = players.findIndex(id => id !== user.id);
            const curPlayerWon = players[curPlayerIdx].points > players[otherPlayerIdx].points;
            const score = players[0].points + " - " + players[1].points;
            if(curPlayerWon)
                return "You played " + lastword.toUpperCase() + " to win " + score;
            else
                return otherPlayer + " played " + lastword.toUpperCase() + ", you lost " + score;
        }
        else{
            if(players[next].id === user.id)
                return "You played " + lastword.toUpperCase();
            else	
                return otherPlayer + " played " + lastword.toUpperCase();
        }
    }

    function _showTagline(lastWord){
        return (lastWord && lastWord.length > 0) ? "" : "none";
    }

    function handleGameClicked(e){
        const el = e.currentTarget;
        el.style.opacity = 0;
        setTimeout(() => {
            el.style.opacity = 1;
        }, 300);
        props.onClicked();
    }

    return (
        <div id={'GameListItem' + game.id} className={'GameListItem ' + (props.selected ? 'selected' : '')} 
            onClick={ handleGameClicked }>
            <div>
                <div id="preview" className="tiles-preview" style={{ backgroundImage: `url(data:image/png;base64,${game.summary_image})` }}></div>
            </div>
            <div className="item-text">
                <h3>
                    {_getTurnMessage(game.over, user, game.turn, [game.player1, game.player2])}
                </h3>
                <p style={{ display: _showTagline(game.lastword) }}>
                    {_getLastPlayedMessage(game.over, user, game.next, [game.player1, game.player2], game.lastword)}
                </p>
            </div>
            { !game.over &&
                <div className="item-secondary">
                    {game.player1.points} - {game.player2.points}
                </div>
            }
        </div>
    );
}
 
export default GameListItem;