// Larger screen https://www.youtube.com/watch?v=sluYUxhOEA0
// Mobile screen https://www.youtube.com/watch?v=eCe_LdqAVTM
// Animations: https://www.youtube.com/watch?v=a_Ew0FDSLzs

import React, { Component } from 'react';
import EventEmitter from 'EventEmitter';

import Login from './Login';
import GameList from './GameList';
import GameDetail from './GameDetail';

import { db, auth, messaging } from './data/firebase';
import { compareValues } from './LetterPlaceHelpers';
import { getGameById, getGameOverMessage } from './data/methods';
import NewGame from './NewGame';
import Notifications, { NotificationsContext } from './Notifications';

import './App.css';

export const AuthUser = React.createContext(null);

export const EM = new EventEmitter();

class App extends Component {
  state = {  
    user: null, 
    games: [],
    fetchingGames: false, 
    cur_page: 'game-list', 
    cur_game: null, 
    curGameImage: null,
    closingCurGame: false,
    sessionUserFetched: false,
    sessionUser: null,
    newGameId: null,
    temporarilyClosed: false
  };

  componentWillMount(){
    this.unsubscribeAuthListener = auth.onAuthStateChanged((sessionUser) => {
      this.setState({sessionUserFetched: true, sessionUser});
    });

    window.addEventListener("focus", () => { 
      console.log("Regained focus!");
      if(this.state.temporarilyClosed){
        this.setState({temporarilyClosed: false}, () => {
          this.fetchUserGames();
        });
      }
    }, false);
    
    window.addEventListener("focus", () => { 
        console.log("Lost focus!");
        this.setState({temporarilyClosed: true});
    }, false);
  }

  connectToUrlAndNotifications = () =>{
    console.log("Connect to url and notifications!");
    this.connectToUrl();
    this.listenForFcmNotifications();
  }

  connectToUrl = () => {
    this.setPageFromUrl();

    window.onpopstate = () => {
      console.log();
      EM.emit('back-pressed');
      this.setPageFromUrl();
    }
  }

  setPageFromUrl = () => {
    const { state } = window.history;
    const { hash } = window.location;
    if(state){
      const { page, gameId } = state;
      console.log("State found", page, gameId);
      if(gameId && gameId.length){
        const cur_game = gameId;

        this.setState({cur_page: page, cur_game}, () => {
          const { cur_game, cur_page } = this.state;
          console.log("Game set from url: ", cur_game, cur_page);
        });
      }
      else
        this.setState({cur_page: page});
    }
    else if(hash && hash.indexOf('view') !== -1){
      const gameId = hash.replace("#view/", "");
      const cur_game = gameId;
      console.log("Hash found: ", gameId);
        
      this.setState({cur_page: "game-detail", cur_game}, () => {
        const { cur_game, cur_page } = this.state;
        console.log("Game set from url: ", cur_game, cur_page);
      });
    }
    else{
      if(this.state.cur_page === 'game-detail'){
        this.closeDetailPage();
      }
      else
        this.setState({cur_page: 'game-list'});
    }
  }
  
  listenForFcmNotifications = () => {
    messaging.onMessage(async (message) => {
      console.log("Message received from FCM", message);
      const hasData = message.data && message.data.action;
      if(hasData && message.data.action === "game-changed"){
        const gameId = message.data.gameId;
        try {
          const game = await getGameById(gameId);
          let games = this.state.games.map(g => {
            if(g.id === gameId)
              return game;
            
            return g;
          });
          games.sort(compareValues('updated_at', 'desc'));
          this.setState({ games }, () => {
            if(game.over){
              const { Alert, Toast } = this.context;
              const content = getGameOverMessage(game, this.props.user.id, true);
              const actions = { 
                  "Request Rematch": () => Toast("Sure you want a rematch...")
              };
              Alert("Game Over", content, actions);
              getGameOverMessage(game, this.state.user.id);
            }
          });
        } catch (error) {
          console.log("Failed to fetch game", error);
        }
      }

      if(hasData && message.data.action === "new-game"){
        const gameId = message.data.gameId;
        try {
          const newGame = await getGameById(gameId);
          let games = this.state.games;
          games.push(newGame);
          games.sort(compareValues('updated_at', 'desc'));
          
          const newGameId = gameId;
          this.setState({ games, newGameId}, () => {
            setTimeout(() => {
              this.setState({newGameId: null})
            }, 1000);
          });
        } 
        catch (error) {
          console.log("Failed to fetch game", error);
        }
      }
    });
  }

  fetchUserGames = async () => {
    const userId = this.state.user.id;
    this.setState({ fetchingGames: true, games: [] });

    const gamesRef = db.collection("games");
    const fetchPlayerGames = gamesRef
      .where("players", "array-contains", userId)
      .orderBy("updated_at", "desc").get();

    fetchPlayerGames.then(snapshot => {
      let games = snapshot.docs.map(doc => doc.data());
      games.sort(compareValues('updated_at', 'desc'));
      this.setState({fetchingGames: false, games}, () => {
        this.connectToUrlAndNotifications()
      });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  }

  handleLogin = (user) => {
    this.setState({ user }, () => {
      this.fetchUserGames();
      this.unsubscribeAuthListener();
    });
  }
  
  handleLogout = async () => {
    auth.signOut().then(() => {
      this.setState({user: null, sessionUser: null, games: []});
    }, (error) => {
      alert("Sign out failed");
      console.log("Sign out failed", error);
    });
  }
  
  handleGoHome = () => {
    const { state } = window.history;
    if(state && (state.newGame || (state.gameId && state.gameId.length)))
      window.history.back();
    else if(this.state.curGameImage !== null)
      this.closeDetailPage();
    else
      this.setState({ cur_page: 'game-list', cur_game: null, curGameImage: null});
  }

  closeDetailPage = () => {
    this.setState({closingCurGame: true}, () => {
      setTimeout(() => {
        this.setState({cur_page: 'game-list', curGameImage: null, closingCurGame: false});
        document.querySelector(".App").classList.remove("animating-back", "animating-screens");
      }, 200);
    });
  }
  
  handleGameChanged = (game) => {
    const games = this.state.games.map(g => {
      if(g.id === this.state.cur_game)
        return game;

      return g;
    });

    this.setState({ games });
  }

  handleViewGame = async (game) => {
    const id = game.id;
    const idString = "GameListItem"+id;
    const image = document.querySelector(`#${idString} #preview`);
    window.history.pushState({page: 'game-detail', gameId: id}, 'View Game ' + id, '#view/'+id);
    this.setState({cur_page: 'game-detail', cur_game: id, curGameImage: image, detailMountedFromView: true});
  }

  handleCreateGame = () => {
    window.history.pushState({page: 'new-game', newGame: true}, 'New Game ', '#newGame/');
    this.setState({cur_page: 'new-game'});
  }
  
  handleGameCreated = (game) => {
    this.setState({ 
      games: [ game, ...this.state.games ], 
      cur_game: game.id,
      cur_page: 'game-detail'
    });
  }
  
  render() {
    const { sessionUserFetched, sessionUser, user, games, fetchingGames, cur_page, cur_game, newGameId } = this.state;
    const loadingLocalUser = sessionUserFetched && sessionUser && !user;
    
    return (
      <Notifications>
        <AuthUser.Provider value={this.state.user}>
          <React.Fragment>
            <Notifications />

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
                  newGameId={newGameId}
                  onCreateGame={ this.handleCreateGame }
                  onViewGame={(idx, image) => this.handleViewGame(idx, image) }
                  onRefreshGames={ this.fetchUserGames }
                  onLogout={this.handleLogout}/>
                
                { cur_page === 'game-detail' && games && games.length > 0 && 
                  <GameDetail
                    user={user} 
                    game={games.find(g => g.id === cur_game)}
                    curGameImage={this.state.curGameImage}
                    closingCurGame={this.state.closingCurGame}
                    onGoHome={ this.handleGoHome }
                    onGameChanged={ this.handleGameChanged } />
                  }
                    
                  { cur_page === 'new-game' && 
                    <NewGame 
                      onClose={ this.handleGoHome } 
                      onGameCreated={ this.handleGameCreated } 
                    /> 
                  }
              </div>
            }
          </React.Fragment>
        </AuthUser.Provider>
      </Notifications>
    );
  }
}

App.contextType = NotificationsContext;

export default App;
