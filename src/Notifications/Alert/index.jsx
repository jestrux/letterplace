import React from 'react';
import classnames from 'classnames/bind';

import styles from './styles.scss';
import FlButton from '../FlButton';

const cx = classnames.bind(styles);

const FlAlert = (props) => {
    const { children, title, message, onCancel, onOkay, cancelText = 'Cancel', okText = 'Okay'} = props;

    return ( 
        <div className={cx('finlink-alert')}>
            <div className={cx('finlink-alert-content')}>
                {   title && title.length > 0 && <h2>{ title } </h2> }
                
                { message && <p className="alert-body" dangerouslySetInnerHTML={ {__html: message} } /> }

                { children }

                { (onCancel || onOkay) && 
                    <div className={cx('finlink-alert-buttons')}>
                        { onCancel && 
                            <FlButton flat onClick={onCancel} primary={!onOkay}>
                                { cancelText }
                            </FlButton>
                        }

                        { onOkay &&
                            <FlButton flat onClick={onOkay} primary>
                                { okText }
                            </FlButton>
                        }
                    </div>
                }
            </div>
        </div>
    );
}
 
export default FlAlert;