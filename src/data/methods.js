import { db } from './firebase';
import axios from 'axios';

export const getUserFCMToken = function(userId){
	return new Promise(async (resolve, reject) => {
		db.doc("users/" + userId).get().then(doc => {
			if (doc.exists){
                const user = doc.data();
                console.log("User fcm token fetched!", user.fcm_token);
				if(user.fcm_token && user.fcm_token.length)
					resolve(user.fcm_token);
				else
					reject("User has no fcm token.");
			}
			else
				reject("user account deleted.");
		})
		.catch(function(error) {
				console.log("Error getting other user token:", error);
				reject("Error getting other user token");
		})
	});
}

const myToken = "fTd3hqzfdXk:APA91bEg7hWRmDJdTmVyn4-eJxhfCafOJhJUQAVEcjq8oXk2OwZ8VACD_Xhbc9ox_yit0haJWaDzKcYeghtqK6EkbPGfmNFkTZRtXmNBG7wqe88WWQloK2xrSHftPREsGZpTnWd1O2lr";
export const sendTurnNotification = async function(player, otherPlayerId, game){
    try {
        const otherPlayerToken = await getUserFCMToken(otherPlayerId);
        const notification = {
            "notification": {
                "title": "Your Turn",
                "body": `${player} played ${game.lastword}`
            },
            "data": {
                "action": "game-changed",
                "game": {
                    "id": game.id,
                    "tiles": game.tiles,
                    "turn": game.turn,
                    "next": game.next,
                    "players": game.players,
                    "lastword": game.lastword,
                    "updated_at" : game.updated_at,
                    "summary_image" : game.summary_image
                }
            },
            "to": otherPlayerToken
        }

        return await axios({
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "key=AAAAmT5Cni4:APA91bF4h8xZBRG70v4R53Q2br5dCpqCNLJiM02Lc6uwuhJQk_iog2C3zjLbBEZLGf4cfOncQj32wJRPvi15f0Ux6Z-Vp_tQ51wcV3X78vw3xA7h5RhkLKzk-rx_QUqBaYQhZuEkV4Jfv1z5g76blsgajGpjzLgPrA"
            },
            data: notification
        });
    } catch (error) {
        return false;
    }
}