import React from 'react';
import classnames from 'classnames/bind';

import FlToast from './FlToast';
import FlAlert from '../../FlAlert';

import styles from './styles.scss';
import { TYPE_ALERT, TYPE_TOAST } from '../../../store/actions/notifications';

const cx = classnames.bind(styles);

const Notifications = ({ notifications, onCloseAlert }) => {
    return ( 
        <div className={cx('finlink-notifications')}>
            { 
                notifications.map(notification => {
                    if(notification.type === TYPE_ALERT)
                        return <FlAlert 
                            key={notification.id} 
                            alert={notification}
                            title={notification.title}
                            message={notification.message}
                            onOkay = { () => onCloseAlert(notification.id) } />

                    if(notification.type === TYPE_TOAST)
                        return <FlToast 
                            key={notification.id} 
                            message={notification.message} />
                            
                    else return null;
                })
            }

        </div>
    );
}

export default Notifications;