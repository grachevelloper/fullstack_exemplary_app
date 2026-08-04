import {Form, Input, InputProps} from 'antd';
import {TextAreaProps} from 'antd/es/input';

import {FormField} from '@/typings/components';

interface FormInputProps {
    field: FormField;
}

const {TextArea} = Input;

export function FormInput({field}: FormInputProps) {
    const {
        name,
        label,
        dependencies,
        rules,
        type,
        autoComplete,
        dataMarker,
        style,
        placeholder,
        className,
        rootClassName,
    } = field;

    const formInputBaseProps: InputProps = {
        autoComplete,
        placeholder,
        variant: 'underlined',
        className: rootClassName,
        'data-marker': dataMarker,
        style: {
            minWidth: 200,
        },
    };

    const renderInput = () => {
        switch (type) {
            case 'password':
                return <Input.Password {...formInputBaseProps} />;
            case 'email':
                return <Input type='email' {...formInputBaseProps} />;
            case 'text':
                return (
                    <TextArea
                        {...(formInputBaseProps as TextAreaProps)}
                        variant='outlined'
                        style={{resize: 'none'}}
                        autoSize={{
                            maxRows: 6,
                            minRows: 2,
                        }}
                    />
                );
            default:
                return <Input {...formInputBaseProps} />;
        }
    };

    return (
        <Form.Item
            layout='vertical'
            name={name}
            label={label}
            rules={rules}
            dependencies={dependencies}
            className={className}
            style={style}
            validateDebounce={500}
            validateTrigger={['onChange', 'onBlur']}
        >
            {renderInput()}
        </Form.Item>
    );
}
