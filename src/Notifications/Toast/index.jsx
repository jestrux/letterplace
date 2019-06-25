import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import './styles.css';

const toastRoot = document.querySelector('#toastRoot');

export const TOAST_DURATION = {
    SHORT: 2000,
    LONG: 3500
};

const Toast = ({ children, duration }) => {
    const [hide, setHide] = useState(false);
    useEffect(() => {
        var hideTimer = setTimeout(() => {
            setHide(true);
        }, duration);

        return () => {
            clearTimeout(hideTimer);
        };
    }, []);
    
    return ReactDom.createPortal(
        <div className={'lp-toast ' + (hide ? 'hide' : '')}>
            { children }
        </div>,
        toastRoot
    );
}

export default Toast;