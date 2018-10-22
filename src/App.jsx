// Larger screen https://www.youtube.com/watch?v=sluYUxhOEA0
// Mobile screen https://www.youtube.com/watch?v=eCe_LdqAVTM
// Animations: https://www.youtube.com/watch?v=a_Ew0FDSLzs

import React, { Component } from 'react';
import './App.css';

import GameToolbar from './GameToolbar';
import GameList from './GameList';
import GameDetail from './GameDetail';

// import { db_games } from './data/games';
// import { auth_user, db_users } from './data/users';
import { auth_user, db_users } from './data/users';
import { db } from './data/firebase';

class App extends Component {
  state = {  user: auth_user, fetchingGames: false, cur_page: 'game-list', cur_game: 0, tiles_played:false };
  componentWillMount(){
    this.gamesRef = db.collection("games");
    this.usersRef = db.collection("users");

    this.fetchUserGames();
    // db_users.forEach( user => {
    //   if(user.games && user.games.length){
    //     const path = "users/" + user.id + "/games/";
        
    //     user.games.forEach( game => {
    //       db.doc(path + game.id).set( game )
    //     })
    //   }
    // });
  }

  fetchUserGames = () => {
    // var getOptions = {
    //   source: 'cache'
    // };

    this.setState({ fetchingGames: true, user: {...this.state.user, games: [] } });
    db.collection("users/" + this.state.user.id + "/games").get()
      .then(querySnapshot => {
          let games = [];
          querySnapshot.forEach(doc => {
            // console.log(doc.id, " => ", doc.data());
            games.push(doc.data());
          });

          this.setState({ fetchingGames: false, user: {...this.state.user, games } });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });
  }

  handleGoHome = () => {
    this.setState( { cur_page: 'game-list', cur_game: null } );
  }
  
  handleViewGame = ( idx ) => {
    this.setState( { cur_page: 'game-detail', cur_game: idx } );
  }

  render() {
    const { user, fetchingGames, cur_page, cur_game, tiles_played } = this.state;

    return (
      <div className="App">
        <GameToolbar 
          page={cur_page} 
          user={user} tilesPlayed={tiles_played}
          onGoHome={ this.handleGoHome } />
          
        { cur_page ==='game-list' && 
          <GameList 
            user={user} 
            games={user.games} loading={fetchingGames}
            onViewGame={ ( idx ) => this.handleViewGame(idx) } />
        }
        
        { cur_page ==='game-detail' && 
          <GameDetail
            user={user} 
            game={user.games[cur_game]} />}
      </div>
    );
  }
}

export default App;
