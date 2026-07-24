import {Avatar, Flex, Typography} from 'antd';
import block from 'bem-cn-lite';

import {type User as UserType} from '@/users/types';

import './User.scss';

const b = block('user');

interface UserProps {
    data: UserType;
}

export const User = ({data}: UserProps) => {
    const {avatar, username} = data;
    return (
        <Flex justify='start' align='center' gap={6} className={b()}>
            <Avatar src={avatar} className={b('avatar')} />
            <Typography.Title level={5} rootClassName={b('author')}>
                {username}
            </Typography.Title>
        </Flex>
    );
};
