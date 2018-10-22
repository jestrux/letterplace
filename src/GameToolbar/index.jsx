import React from 'react';
import logo from '../logo.png';

import './GameToolbar.css';

const GameToolbar = ( props ) => {
    const { page, user, tilesPlayed } = props;
    const listHeader = (
        <div id="listHeader">
            <img src={logo} alt="" id="appLogo"/>

			Letterplace

			<div id="user">
				<div id="theDp" style={{ backgroundImage: `url(${user.dp})` }}></div>
			</div>
		</div>
    );
    
    const detailHeader = (
        <div id="detailHeader">
            <button onClick={ props.onGoHome }>back</button>

            { tilesPlayed && 
                <React.Fragment>
                    <button>clear</button>
                    <button id="submitBtn">submit</button>
                </React.Fragment>
            }
        </div>
    );

    return (
        <div id="header">
            { (!page || page === 'game-list') && listHeader }

            { page && page === 'game-detail' && detailHeader }
        </div> 
    );
}
 
export default GameToolbar;