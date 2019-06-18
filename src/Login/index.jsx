import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import { db, auth, google_auth_provider, fb_auth_provider } from '../data/firebase'

import './styles.css';
import logo from '../logo.png';
import { setUserFcmToken } from '../data/methods';

const Login = ( props ) => {
    const [ authenticating, setAuthenticating ] = useState(false);
    const [ provider, setProvider ] = useState(null);

    useEffect(() => {
        if(!authenticating && props.sessionUser){
            console.log("First time login triggered");
            setAuthenticating(true);
            onLoggedin(props.sessionUser);
        }
    });

    async function loginWithProvider(provider){
        setAuthenticating(true);
        setProvider(provider);

        const auth_provider = provider === 'facebook' ? 
            fb_auth_provider : google_auth_provider;

        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        auth.signInWithRedirect(auth_provider)
            .then((result) => {
                console.log("Login from popup successful", result);
                onLoggedin(result.user)
            })
            .catch((error) => {
                console.log(`${provider} Login failed!`, error)
                setAuthenticating(false, () => {
                    // alert(`${provider} Login failed!`);
                });
            });
    }

    function onLoggedin(user){
        const userRef = db.doc("users/" + user.uid);
        userRef.get().then(async (doc) => {
            if (doc.exists){
                const dbUser = doc.data();
                const { providerId, uid, photoURL } = user.providerData[0];
                const facebookDp = "https://graph.facebook.com/" + uid + "/picture?height=500";
                const authDp = providerId === "facebook.com" ? facebookDp : photoURL;
                if(dbUser.dp !== authDp){
                    dbUser.dp = authDp;
                    console.log("Updating photo URL...");
                    await userRef.set(dbUser);
                }
                updateDpInGames(user.uid, authDp);
                setUserFcmToken(user.id);
                props.onLogin(dbUser);
            }
            else {
                console.log("No user in db!");
                registerNewUser(user);
            }
        }).catch(function(error) {
            console.log("Error getting user document:", error)
            setAuthenticating(false);
        });
    }

    function updateDpInGames(userId, newDp){
        const gamesRef = db.collection("games");
        const userGames = gamesRef
            .where("players", "array-contains", userId)
            .get();

        userGames.then(snapshot => {
            let games = snapshot.docs.map(doc => doc.data());            
            games.forEach(async (game) => {
                const playerKey = game.players.indexOf(userId) === 0 ? "player1" : "player2";
                if(game[playerKey].dp !== newDp){
                    game[playerKey].dp = newDp;
                    console.log("Updating game dp....");
                    await db.doc("games/" + game.id).set(game);
                    console.log("Game dp updated!");
                }
            });
        })
    }

    function registerNewUser(user){
        const name = user.displayName.split(" ")[0].toLowerCase();
        const newUser = {
            id: user.uid,
            name,
            username: name.substring(0, 1).toUpperCase() + name.substring(1),
            provider: user.providerData[0].providerId,
            dp: user.providerData[0].photoURL
        }

        const userRef = db.doc("users/" + user.uid);
        userRef.set(newUser)
            .then(() => {
                console.log("User successfully registered");
                props.onLogin(newUser);
            })
            .catch(error => {
                console.log("Error registering user:", error)
                props.onLogin(newUser);
            });
    }

    return (
        <div className="loginScreen">
			<img className="logo-image" src={logo} alt="" />
			<h3>Letter Place</h3>
			<p>To get started please login first.</p>
			
			<button className={authenticating ? 'loading' : ''} onClick={() => loginWithProvider('google')}>
                { provider !== 'google' && <span> Google Login </span> }
                { authenticating && provider === 'google' && <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg> }
            </button>
            <button className={'fb ' + (authenticating ? 'loading' : '')} 
                onClick={() => loginWithProvider('facebook')}>
                { provider !== 'facebook' && <span> Facebook Login </span> }
                { authenticating && provider === 'facebook' && <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg> }
            </button>
		</div>
    );
}
 
export default Login;