import './State.scss';

import {Button} from 'antd';
import block from 'bem-cn-lite';
import {observer} from 'mobx-react';
import {forwardRef, Fragment} from 'react';
import {useTranslation} from 'react-i18next';

import {TodoState} from '@/todos/types';

// import fireAnimation from '../../../../../public/lotiie/fire.json';

const b = block('state');

interface StateProps {
    state: TodoState;
    editable?: false | {isEdited: boolean};
    onClick?: () => void;
    isLoading?: boolean;
}

const getColor = (state: TodoState) => {
    switch (state) {
        case TodoState.CANCELED:
            return 'red';
        case TodoState.FINISHED:
            return 'green';
        case TodoState.IN_WORK:
            return 'blue';
        case TodoState.PLANNING:
            return 'yellow';
    }
};

export const State = observer(
    forwardRef<HTMLButtonElement, StateProps>(
        ({state, editable, onClick, isLoading}, ref) => {
            const {t} = useTranslation('todo');

            const isEdited = editable && editable?.isEdited;
            return (
                <Fragment>
                    {/* {isRotated ? (
                <Lottie
                    animationData={fireAnimation}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: elementWidth,
                    }}
                    loop={false}
                />
            ) : null} */}
                    <Button
                        className={b({
                            'is-edited': isEdited,
                        })}
                        onClick={onClick}
                        type='primary'
                        color={getColor(state)}
                        variant='solid'
                        loading={isLoading}
                        ref={ref}
                    >
                        {t(`todo.state.${state}`)}
                    </Button>
                </Fragment>
            );
        }
    )
);
