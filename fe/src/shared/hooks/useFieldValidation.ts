import {Form, FormInstance} from 'antd';
import {useEffect, useState} from 'react';

export function useFieldValidation<T>(form: FormInstance, fieldName: string) {
    const fieldValue = Form.useWatch<T>(fieldName, form);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        form.validateFields([fieldName]);
    }, [fieldName, form]);

    useEffect(() => {
        const fieldErrors = form.getFieldError(fieldName);

        const newIsValid = fieldErrors.length === 0 && Boolean(fieldValue);

        setIsValid((prevIsValid) => {
            console.log('Validation errors', fieldErrors);
            if (prevIsValid !== newIsValid) {
                return newIsValid;
            }
            return prevIsValid;
        });
    }, [fieldValue, fieldName, form]);

    return isValid;
}
