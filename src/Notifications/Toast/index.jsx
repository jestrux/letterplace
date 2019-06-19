import React from 'react';
import classnames from 'classnames/bind';

import styles from './styles.scss';

const cx = classnames.bind(styles);

class FlToast extends React.Component {
    render() { 
        const { message } = this.props;
        
        return (
            <div className="finlink-toast-notifications">
                <div className={cx('finlink-toast')}>
                    { message }
                </div>
            </div>
        );
    }
}

export default FlToast;