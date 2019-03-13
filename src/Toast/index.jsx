import React, { useEffect, useState } from 'react';

import './styles.css';

const Toast = ( props ) => {
    const [ show, setShow ] = useState(false);
    const [ hide, setHide ] = useState(false);

    useEffect(() => {
        setShow(true);
        // setTimeout(() => {
        //     setShow(false);
        //     setHide(true);
        // }, 500);
    });

    let className = "letterplace-toast ";
    className += show ? "show" : "";
    className += hide ? "hide" : "";

    return (
        <div className={className} style={props.style}>{ props.children }</div> 
    );
}
 
export default Toast;