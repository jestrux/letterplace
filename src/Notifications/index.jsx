import React, { useContext, useReducer } from 'react';
import shortid from 'shortid';

import Alert from './Alert';
import Toast, { TOAST_DURATION } from './Toast';

const TheContext = React.createContext();

const NOTIFICATION_TYPE = {
    ALERT: "alert", 
    TOAST: "toast"
};

const NOTIFICATION_ACTION = {
    ADD: "ADD_NOTIFICATION", 
    REMOVE: "REMOVE_NOTIFICATION"
};

const Reducer = (state, action) => {
    switch (action.type) {
        case NOTIFICATION_ACTION.ADD:{
            return [...state, action.notification];
        }

        case NOTIFICATION_ACTION.REMOVE:
            return state.filter(n => n.id !== action.notificationId);
    
        default:
            return state;
    }
}

function TheUI(){
    const {notifications, closeNotification} = useContext(TheContext);
    return (
        notifications.map(({content, ...notification}) => {
            if(notification.type === NOTIFICATION_TYPE.ALERT){
                return <Alert 
                    key={notification.id}
                    {...notification}
                    children={content}
                    onClose= { () => closeNotification(notification.id) } />
            }
            
            else if(notification.type === NOTIFICATION_TYPE.TOAST){
                return <Toast 
                    key={notification.id} 
                    {...notification}
                    children={content} />
            }
                    
            return null;
        })
    );
}

export const useNotify = () => {
    const { showNotification } = useContext(TheContext);

    const Alert = (title, content, actions) => {
        const contentIsJsX = React.isValidElement(content);
        content = contentIsJsX ? content : <p>{content}</p>
        const notification = { title, content, actions };
        showNotification({
            id: shortid.generate(),
            type: NOTIFICATION_TYPE.ALERT,
            ...notification, 
        });
    }
    
    const Toast = (content, duration = TOAST_DURATION.SHORT) => {
        const contentIsJsX = React.isValidElement(content);
        showNotification({
            id: shortid.generate(),
            type: NOTIFICATION_TYPE.TOAST,
            content: contentIsJsX ? content : <p>{content}</p>, 
            duration
        });
    }

    return { Alert, Toast };
}

const Notifications = ({ children }) => {
    const [notifications, dispatch] = useReducer(Reducer, []);

    const showNotification = (notification) => {
        dispatch({type: NOTIFICATION_ACTION.ADD, notification});

        if(notification.type === NOTIFICATION_TYPE.TOAST){
            setTimeout(() => {
                closeNotification(notification.id);
            }, notification.duration);
        }
    }

    const closeNotification = (notificationId) => {
        dispatch({type: NOTIFICATION_ACTION.REMOVE, notificationId});
    }

    const contextData = {
        notifications,
        showNotification,
        closeNotification
    };

    return(
        <TheContext.Provider value={contextData}>
            <TheUI />
            { children }
        </TheContext.Provider>
    );
}

export default Notifications;