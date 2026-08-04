import {FloatButton} from 'antd';
import block from 'bem-cn-lite';
import {FaEyeSlash, FaRegEye} from 'react-icons/fa';

import {useLayout} from '@/shared/hooks';
import './ViewModeToggle.scss';

const b = block('view-mode-toggle');

type ViewModeToggleProps = {
    isReading: boolean;
    onToggle: () => void;
};

export const ViewModeToggle = ({isReading, onToggle}: ViewModeToggleProps) => {
    const {isDesktop} = useLayout();

    return (
        isDesktop && (
            <FloatButton
                className={b()}
                shape='circle'
                type='primary'
                onClick={onToggle}
                icon={
                    isReading ? (
                        <FaEyeSlash size={24} />
                    ) : (
                        <FaRegEye size={24} />
                    )
                }
                tooltip={
                    isReading ? 'Выйти из режима чтения' : 'Режим чтения'
                }
            />
        )
    );
};
