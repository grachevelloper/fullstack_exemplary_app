import {Typography} from 'antd';
import block from 'bem-cn-lite';
import React, {useEffect} from 'react';

import {FlexibleCard} from '@/shared/components/FlexibleCard';
import {FormInput} from '@/shared/components/FormInput';
import {useLocalStorage} from '@/shared/hooks/useLocalStore';
import {CardProps, FormField} from '@/typings/components';
import {AuthEmitter, SIGN_UP_EVENT} from '@/users/utils';

import {SIGN_UP_STEP_SLUG} from '../../constants';
import './SignStep.scss';

const b = block('sign-step');

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SignStepBaseProps
    extends Omit<React.HTMLProps<HTMLDivElement>, 'content'> {}

interface FormStep extends SignStepBaseProps {
    type: 'form';
    content: FormField;
}

interface TextStep extends SignStepBaseProps {
    type: 'text';
    content: CardProps;
}

type SignStepProps = FormStep | TextStep;

export const SignStep = (props: SignStepProps) => {
    const [, setSignStep] = useLocalStorage(SIGN_UP_STEP_SLUG, 0);
    const {type, content, className} = props;

    useEffect(() => {
        const handleSignStepChange = (newStep: number) => {
            setSignStep(newStep);
        };

        AuthEmitter.on(SIGN_UP_EVENT, handleSignStepChange);

        return () => {
            AuthEmitter.off(SIGN_UP_EVENT, handleSignStepChange);
        };
    }, [setSignStep]);

    const renderBody = () => {
        switch (type) {
            case 'form':
                return <FormInput field={content} />;
            case 'text':
                return typeof content.content === 'string' ? (
                    <Typography.Text>{content.content}</Typography.Text>
                ) : (
                    content.content
                );
        }
    };

    return (
        <FlexibleCard
            key={content.index}
            rootClassName={b(null, className)}
            title={content?.title}
            actions={content.actions ? content.actions : []}
        >
            {renderBody()}
        </FlexibleCard>
    );
};
