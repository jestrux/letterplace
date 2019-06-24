import React, { useState, useEffect, useContext } from 'react';

import { db } from '../data/firebase'
import GameToolbar from '../GameToolbar';
import { AuthUser } from '../App'

const PickOpponent = ( props ) => {
    const authUser = useContext(AuthUser);
    const [ loading, setLoading ] = useState(false);
    const [ opponentChoices, setOpponentChoices ] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchOpponents();
    }, []);

    function fetchOpponents(){
        const playersRef = db.collection("users");
        playersRef.orderBy("username", "asc").get()
            .then(playerSnapshot => {
                const opponentChoices = [];
                playerSnapshot.forEach(doc => {
                    const { id, username, dp} = doc.data();
                    if(id !== authUser.id)
                        opponentChoices.push({ id, name: username, dp});
                });
                setOpponentChoices(opponentChoices);
                setLoading(false);
            })
    }

    const header = (
        <div id="listHeader">
			<button className="action-button" onClick={props.onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
            </button>

			Pick Opponent
		</div>
    );

    return (
        <div className="newGameWrapper">
            <div className="newGame">
                <GameToolbar>{ header }</GameToolbar>

                <div className="newGameContent">
                    {   loading && 
                        <div className="opponents-loader">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>
                            Fetching Opponents...
                        </div>
                    }
                    
                    {   !loading && opponentChoices &&
                        opponentChoices.map(opponent => (
                            <button className="opponent-choice" key={opponent.id}
                                onClick={() => props.onOpponentSelected(opponent)}>
                                <img src={opponent.dp} alt=""/>
                                
                                {opponent.name}
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
 
export default PickOpponent;