import React from 'react';

import './GameToolbar.css';

const GameToolbar = ( props ) => {
    return (
        <div id="header">{ props.children }</div> 
    );
}
 
export default GameToolbar;