// Larger screen https://www.youtube.com/watch?v=sluYUxhOEA0
// Mobile screen https://www.youtube.com/watch?v=eCe_LdqAVTM
// Animations: https://www.youtube.com/watch?v=a_Ew0FDSLzs

import React, { Component } from 'react';
import _findIndex from 'lodash/findIndex';
import './App.css';

import Login from './Login';
import GameList from './GameList';
import GameDetail from './GameDetail';

// import { auth_user, db_users } from './data/users';
import { db, auth, messaging } from './data/firebase';
import { compareValues } from './LetterPlaceHelpers';
import { getGameById } from './data/methods';

export const AuthUser = React.createContext(null);

class App extends Component {
  state = {  
    user: null, 
    games: [],
    fetchingGames: false, 
    cur_page: 'game-list', 
    cur_game: 0, 
    tiles_played:false,
    sessionUserFetched: false,
    sessionUser: null,
    newGameIndex: -1
  };

  componentWillMount(){
    this.unsubscribeAuthListener = auth.onAuthStateChanged((sessionUser) => {
      this.setState({sessionUserFetched: true, sessionUser});
    });
  }

  componentDidMount(){
    messaging.onMessage(async (message) => {
      console.log("Message received from FCM", message);
      const hasData = message.data && message.data.action;
      if(hasData && message.data.action === "game-changed"){
        const gameId = message.data.gameId;
        try {
          const games = this.state.games;
          const game = await getGameById(gameId);
          const changedGameIdx = _findIndex(games, ['id', game.id]);

          if(changedGameIdx !== -1){
            games.splice(changedGameIdx, 1, game);
            games.sort(compareValues('updated_at', 'desc'));
            this.setState({ games });
          }else{
            console.log("No game with that id mate!!");
          }
        } catch (error) {
          console.log("Failed to fetch game", error);
        }

        // console.log("Game changed")
        // const game = JSON.parse(message.data.game);
        // const games = this.state.games;
        // const changedGameIdx = _findIndex(games, ['id', game.id]);

        // if(changedGameIdx !== -1){
        //   let changedGame = {...games[changedGameIdx], ...game};
        //   changedGame.words.push(message.data.newWord);
        //   games.splice(changedGameIdx, 1, changedGame);
        //   games.sort(compareValues('updated_at', 'desc'));
        //   this.setState({ games });
        // }else{
        //   console.log("No game with that id mate!!");
        // }
      }

      if(hasData && message.data.action === "new-game"){
        const gameId = message.data.gameId;
        try {
          const games = this.state.games;
          const newGame = await getGameById(gameId);
          games.push(newGame);
          games.sort(compareValues('updated_at', 'desc'));

          const newGameIndex = _findIndex(games, ['id', gameId]);
          this.setState({games, newGameIndex}, () => {
            setTimeout(() => {
              this.setState({newGameIndex: -1})
            }, 1000);
          });
        } catch (error) {
          console.log("Failed to fetch game", error);
        }
      }
    })
  }

  fetchUserGames = async () => {
    const userId = this.state.user.id;
    this.setState({ fetchingGames: true, games: [] });

    const gamesRef = db.collection("games");
    const playerGames = gamesRef
      .where("players", "array-contains", userId)
      .orderBy("updated_at", "desc").get();

    playerGames.then(snapshot => {
      let games = snapshot.docs.map(doc => doc.data());
      games.sort(compareValues('updated_at', 'desc'));
      this.setState({ fetchingGames: false, games });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  }

  handleLogin = (user) => {
    this.setState({ user }, () => {
      this.fetchUserGames();
      this.unsubscribeAuthListener();

      const fcmToken = user.fcm_token;
      if(fcmToken && fcmToken.length){
        setTimeout(() => {
          this.sendWelcomeMessage(fcmToken);
        }, 300);
      }
    });
  }
  
  handleLogout = async () => {
    if(this.state.user){
      await db.doc("users/" + this.state.user.uid)
        .set({ ...this.state.user, fcm_token: null })
    }
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
    let games = this.state.games;
    games[this.state.cur_game] = game;

    this.setState({ games });
  }
  
  handleViewGame = async ( idx, image ) => {
    console.log(image);
    this.setState( { cur_page: 'game-detail', cur_game: idx } );
  }

  handleStartGame = (game) => {
    // console.log("Starting new game: ", game);
    this.setState({ 
      games: [ game, ...this.state.games ], 
      cur_game: 0,
      cur_page: 'game-detail'
    });
  }

  sendWelcomeMessage(token){
    // console.log(token);
    // var message = {
    //   data: {
    //     score: '850',
    //     time: '2:45'
    //   },
    //   token
    // };

    // messaging.send(message).then((response) => {
    //   console.log('Successfully sent welcome notification:', response);
    // })
    // .catch((error) => {
    //   console.log('Error sending welcome notification:', error);
    // });
  }

  render() {
    const { sessionUserFetched, sessionUser, user, games, fetchingGames, cur_page, cur_game, tiles_played, newGameIndex } = this.state;
    const loadingLocalUser = sessionUserFetched && sessionUser && !user;
    
    return (
      <AuthUser.Provider value={this.state.user}>
        <React.Fragment>
          { (!sessionUserFetched || loadingLocalUser) && 
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
                newGameIndex={newGameIndex}
                onStartGame={ this.handleStartGame }
                onViewGame={(idx, image) => this.handleViewGame(idx, image) }
                onRefreshGames={ this.fetchUserGames }
                onLogout={this.handleLogout}/>
              
              { (cur_page === 'game-detail' || window.innerWidth > 800) && games.length > 0 && 
                <GameDetail
                  user={user} 
                  game={games[cur_game]}
                  onGoHome={ this.handleGoHome }
                  onGameChanged={ this.handleGameChanged } />}
            </div>
          }
        </React.Fragment>
      </AuthUser.Provider>
    );
  }
}

export default App;
