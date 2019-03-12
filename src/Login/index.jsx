import React, { useState, useEffect } from 'react';

import { db, auth, google_auth_provider, fb_auth_provider } from '../data/firebase'

import './styles.css';
import logo from '../logo.png';

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

    function loginWithProvider(provider){
        setAuthenticating(true);
        setProvider(provider);

        const auth_provider = provider === 'facebook' ? 
            fb_auth_provider : google_auth_provider;

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
                console.log("User found in DB");
                const dbUser = doc.data();
                if(dbUser.dp !== user.photoURL){
                    dbUser.dp = user.photoURL;
                    await userRef.set(dbUser);
                }
                props.onLogin(doc.data());
            }
            else {
                console.log("No user in db!");
                registerNewUser(user);
            }
        }).catch(function(error) {
            console.log("Error getting user document:", error)
            setAuthenticating(false, () => {
                // alert("Error getting document!")
            });
        });
    }

    function registerNewUser(user){
        const name = user.displayName.split(" ")[0].toLowerCase();
        const newUser = {
            id: user.uid,
            name,
            username: name.substring(0, 1).toUpperCase() + name.substring(1),
            provider: user.providerData[0].providerId,
            dp: user.photoURL
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