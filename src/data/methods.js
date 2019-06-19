import { db, messaging } from './firebase';
import axios from 'axios';

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

const APP_URL = isLocalhost ? "http://localhost:3000" : "http://letterplace.herokuapp.com";

export const getGameById = function(gameId){
	return new Promise(async (resolve, reject) => {
		db.doc("games/" + gameId).get().then(doc => {
			if (doc.exists)
                resolve(doc.data());
			else
				reject("Game not found.");
		})
		.catch(function(error) {
            reject(error);
		})
	});
}

const getUserFCMTokens = function(userId){
	return new Promise(async (resolve, reject) => {
        try {
            const tokenSnapshot = await db.collection("users/" + userId + "/tokens").get();
            if(tokenSnapshot.empty){
                reject("No tokens found!");
                return;
            }

            const tokenDocs = tokenSnapshot.docs;
            const tokens = tokenDocs.map(doc => doc.data());
            resolve(tokens); 
        } 
        catch (error) {
            console.log("Error getting other user token:", error);
            reject(error);
        }
	});
}

export const setUserFcmToken = (userId) => {
    console.log("Setting fcm token....");
    return new Promise(async (resolve, reject) => {
        messaging.getToken().then(function(token) {
            if (token) {
                const tokenData = {
                    createdAt: new Date().getTime(),
                    platform: "web",
                    token
                };
                db.doc("users/" + userId + "/tokens/" + token)
                    .set(tokenData).then(() => {
                        console.log("Auth token persisted");
                        resolve();
                    });
            } 
            else {
                console.log('No Instance ID token available. Request permission to generate one.');
                reject('No Instance ID token available. Request permission to generate one.');
            }
        })
        .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
            reject(err);
        });
    });
}

const sendFcmNotification = async (userId, notification) => {
    const otherPlayerTokens = await getUserFCMTokens(userId);
    const sendTokenPromises = otherPlayerTokens.map(tokenData => {
        const notificationData = {
            ...notification,
            "to": tokenData.token
        };

        return axios({
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "key=AAAAmT5Cni4:APA91bF4h8xZBRG70v4R53Q2br5dCpqCNLJiM02Lc6uwuhJQk_iog2C3zjLbBEZLGf4cfOncQj32wJRPvi15f0Ux6Z-Vp_tQ51wcV3X78vw3xA7h5RhkLKzk-rx_QUqBaYQhZuEkV4Jfv1z5g76blsgajGpjzLgPrA"
            },
            data: notificationData
        });
    });

    return Promise.all(sendTokenPromises);
}

export const sendTurnNotification = async function(player, otherPlayerId, game){
    try {
        const score = game.player1.points + " - " + game.player2.points;
        const notification = {
            "notification": {
                "title": "Your Turn",
                "body": `${player} played ${game.lastword}, new score: ${score}`,
                "icon": "data:image/png;base64,"+game.summary_image,
                "click_action": APP_URL + "?source=notification/#view/" + game.id
            },
            "data": {
                "action": "game-changed",
                "gameId": game.id
            }
        };

        return sendFcmNotification(otherPlayerId, notification);
    } catch (error) {
        return false;
    }
}

export const sendNewGameNotification = async function(player, otherPlayerId, game){
    try {
        const notification = {
            "notification": {
                "title": "New Game",
                "body": `${player} played ${game.lastword}`,
                "icon": "data:image/png;base64,"+game.summary_image,
                "click_action": APP_URL + "?source=notification/#view/" + game.id
            },
            "data": {
                "action": "new-game",
                "gameId": game.id
            }
        }

        return sendFcmNotification(otherPlayerId, notification);
    } catch (error) {
        return false;
    }
}