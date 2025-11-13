import {Button, Form} from 'antd';
import React from 'react';

import {FormInput} from '../FormInput';

import {FormField} from './types';

export interface SignFormProps {
    fields: FormField[];
    onSubmit: (values: any) => void;
    submitText: string;
    loading?: boolean;
    initialValues?: any;
}

export const SignForm: React.FC<SignFormProps> = ({
    fields,
    onSubmit,
    submitText,
    initialValues = {},
}) => {
    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            layout='vertical'
            onFinish={onSubmit}
            autoComplete='off'
        >
            {fields.map((field) => (
                <FormInput key={field.name} field={field} />
            ))}

            <Form.Item>
                <Button type='primary' htmlType='submit' block>
                    {submitText}
                </Button>
            </Form.Item>
        </Form>
    );
};
