import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import './styles.css';

const alertRoot = document.querySelector('#alertRoot');

const Alert = (props) => {
    const { id, title, children, actions, onClose, closeText = 'Close'} = props;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true);

        return () => {
            setOpen(false);
        };
    }, []);
    
    return ReactDom.createPortal( 
        <div id={id} className={'lp-alert ' + (open ? 'open' : '')}>
            <div className="lp-alert-bg" onClick={onClose}></div>
            <div className="lp-alert-content">
                { title && title.length > 0 && <h1>{ title } </h1> }

                { children }

                <div style={{paddingTop: '1.5em'}}>
                    { actions &&
                        Object.entries(actions).map(([text, callback]) => 
                            <button key={text} onClick={() => { onClose(); callback.call(); }}>
                                { text }
                            </button>
                        )
                    }

                    <button onClick={onClose}>
                        { closeText }
                    </button>
                </div>
            </div>
        </div>,
        alertRoot
    );
}
 
export default Alert;