// Larger screen https://www.youtube.com/watch?v=sluYUxhOEA0
// Mobile screen https://www.youtube.com/watch?v=eCe_LdqAVTM
// Animations: https://www.youtube.com/watch?v=a_Ew0FDSLzs

import React, { Component } from 'react';
import './App.css';

import Login from './Login';
import GameList from './GameList';
import GameDetail from './GameDetail';

// import { db_games } from './data/games';
// import { auth_user, db_users } from './data/users';
import { auth_user, db_users } from './data/users';
import { db, auth } from './data/firebase';
import { compareValues } from './LetterPlaceHelpers';

class App extends Component {
  state = {  
    user: null, 
    games: [],
    fetchingGames: false, 
    cur_page: 'game-list', 
    cur_game: 0, 
    tiles_played:false,
    sessionUserFetched: false,
    sessionUser: null
  };

  componentWillMount(){
    this.unsubscribeAuthListener = auth.onAuthStateChanged((sessionUser) => {
      this.setState({sessionUserFetched: true, sessionUser});
    });
  }

  fetchUserGames = () => {
    // var getOptions = {
    //   source: 'cache'
    // };
    const userId = this.state.user.id;
    this.setState({ fetchingGames: true, user: {...this.state.user, games: [] } });

    const gamesRef = db.collection("games");
    const createdGames = gamesRef
      .where("player1", "==", userId)
      .orderBy("updated_at", "desc").get();
    const invitedGames = gamesRef
      .where("player2", "==", userId)
      .orderBy("updated_at", "desc").get();

    Promise.all([createdGames, invitedGames])
      .then(res => {
        let games = [];
        const [ createdGamesSnapshot, invitedGamesSnapshot ] = res;
        createdGamesSnapshot.forEach(doc => games.push(doc.data()));
        invitedGamesSnapshot.forEach(doc => games.push(doc.data()));

        games.sort(compareValues('updated_at', 'desc'));


        // createdGamesSnapshot.forEach(doc => {
        //   const game = doc.data();
        //   console.log("Game: ", game);
        //   const newGame = {
        //     ...game,
        //     updated_at: game.updated_at.seconds
        //   }
        //   const gamesRef = db.doc("games/" + game.id);
        //   gamesRef.set(newGame).then(() => console.log("Game saved: "));
        // });

        this.setState({ fetchingGames: false, games });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });
  }

  handleLogin = (user) => {
    console.log("Login complete, fetching games for: ", user);
    
    this.setState({ user }, () => {
      this.fetchUserGames();
      this.unsubscribeAuthListener();
    });
  }
  
  handleLogout = () => {
    auth.signOut().then(() => {
      this.setState({user: null, sessionUser: null, games: []});
    }, (error) => {
      alert("Sign out failed");
      console.log("Sign out failed", error);
    });
  }
  
  handleGoHome = () => {
    this.setState( { cur_page: 'game-list', cur_game: null } );
  }
  
  handleGameChanged = (game) => {
    const next = game.next; 
    const turn = game.turn; 
    game.turn = next;
    game.next = turn;
    game.began = true;

    let games = this.games;
    games[this.state.cur_game] = game;

    this.setState({ games });
  }
  
  handleViewGame = ( idx, image ) => {
    console.log(image);
    this.setState( { cur_page: 'game-detail', cur_game: idx } );
  }

  render() {
    const { sessionUserFetched, sessionUser, user, games, fetchingGames, cur_page, cur_game, tiles_played } = this.state;

    return (
      <React.Fragment>
        { !sessionUserFetched && 
          <div className="loader"> 
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>
          </div>
        }
        { sessionUserFetched && user === null && <Login sessionUser={sessionUser} onLogin={this.handleLogin} /> }

        { user !== null && 
          <div className="App">          
            <GameList 
              user={user} 
              currentGame={cur_game}
              games={games} 
              loading={fetchingGames}
              onViewGame={(idx, image) => this.handleViewGame(idx, image) }
              onLogout={this.handleLogout} />
            
            { (cur_page === 'game-detail' || window.innerWidth > 800) && 
              <GameDetail
                user={user} 
                game={games[cur_game]}
                onGoHome={ this.handleGoHome }
                onGameChanged={ this.handleGameChanged } />}
          </div>
        }
      </React.Fragment>
    );
  }
}

export default App;
