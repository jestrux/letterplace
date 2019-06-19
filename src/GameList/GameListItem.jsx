import React from 'react';
import './GameListItem.css';

const GameListItem = ( props ) => {
    const { game, user } = props;

    function _getTurnMessage(user, turn, players){
        if(players[turn].id === user.id)
            return "Your turn";
        else
            return players[turn].name + "'s turn";
    }

    function _getLastPlayedMessage(user, next, players, lastword){
        if(players[next].id === user.id)
            return "You played " + lastword.toUpperCase();
        else	
            return players[next].name + " played " + lastword.toUpperCase();
    }

    function _showTagline(word){
        return (word && word.length > 0) ? "" : "none";
    }

    return (
        <div className={'GameListItem ' + (props.selected ? 'selected' : '')} 
            onClick={ props.onClicked }>
            <div>
                <div id="preview" className="tiles-preview" style={{ backgroundImage: `url(data:image/png;base64,${game.summary_image})` }}></div>
            </div>
            <div className="item-text">
                <h3>
                    {_getTurnMessage(user, game.turn, [game.player1, game.player2])}
                </h3>
                <p style={{ display: _showTagline(game.lastword) }}>
                    {_getLastPlayedMessage(user, game.next, [game.player1, game.player2], game.lastword)}
                </p>
            </div>
            <div className="item-secondary">
                {game.player1.points} - {game.player2.points}
            </div>
        </div>
    );
}
 
export default GameListItem;