import {Typography} from 'antd';
import block from 'bem-cn-lite';
import React from 'react';

import {FlexibleCard} from '@/shared/components/FlexibleCard';
import {FormInput} from '@/shared/components/FormInput';
import {CardProps, FormField} from '@/typings/components';

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
    const {type, content, className} = props;
    const stepNumber = content.index + 1;

    const renderBody = () => {
        switch (type) {
            case 'form':
                return <FormInput field={content} />;
            case 'text':
                return typeof content.content === 'string' ? (
                    <Typography.Paragraph className={b('content')}>
                        {content.content}
                    </Typography.Paragraph>
                ) : (
                    content.content
                );
        }
    };

    return (
        <FlexibleCard
            key={content.index}
            rootClassName={b(undefined, className)}
            actions={content.actions ? content.actions : []}
        >
            <div className={b('header')}>
                <Typography.Text className={b('counter')}>
                    {stepNumber.toString().padStart(2, '0')}
                </Typography.Text>
                {content.title && (
                    <Typography.Title level={2} className={b('title')}>
                        {content.title}
                    </Typography.Title>
                )}
            </div>
            {renderBody()}
        </FlexibleCard>
    );
};
