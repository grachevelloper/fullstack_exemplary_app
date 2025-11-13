import {Form, FormItemProps, Input, InputProps} from 'antd';

import {useFormSync} from '../../hooks';
import {FormField} from '../SignForm/types';

interface FormInputProps extends Omit<FormItemProps, 'children'> {
    field: FormField;
}

export const FormInput = ({field, ...formItemProps}: FormInputProps) => {
    const {name, label, type, dependencies, placeholder, rules} = field;

    const formInputBaseProps: InputProps = {
        placeholder: placeholder,
        variant: 'underlined',
        className: formItemProps.rootClassName,
    };
    const formValue = useFormSync(name, '');

    const renderInput = () => {
        switch (type) {
            case 'password':
                return <Input.Password {...formInputBaseProps} />;
            case 'email':
                return <Input type='email' {...formInputBaseProps} />;
            default:
                return <Input {...formInputBaseProps} />;
        }
    };

    return (
        <Form.Item
            name={name}
            label={label}
            rules={rules}
            dependencies={dependencies}
            className={formItemProps.className}
            initialValue={formValue}
        >
            {renderInput()}
        </Form.Item>
    );
};
