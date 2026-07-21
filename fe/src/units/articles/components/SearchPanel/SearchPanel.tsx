import {Flex, Input} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import './SearchPanel.scss';

const b = block('search-panel');

interface SearchPanelProps {
    onSearchChange?: (value: string) => void;
    value?: string;
}

export const SearchPanel = ({onSearchChange, value}: SearchPanelProps) => {
    const {t} = useTranslation('article');
    return (
        <Flex className={b()} justify='start' align='start' vertical gap={8}>
            <Input.Search
                variant='filled'
                placeholder={t('articles.search.placeholder')}
                size='large'
                value={value}
                onChange={(event) => onSearchChange?.(event.target.value)}
                onSearch={(nextValue) => onSearchChange?.(nextValue)}
            />
        </Flex>
    );
};
