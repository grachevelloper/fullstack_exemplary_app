import {Form} from 'antd';
import {useEffect} from 'react';

import {useLocalStorage} from './useLocalStore';

export function useFormSync<T>(fieldKey: string, initialValue: T) {
    const [value, setFormValue] = useLocalStorage<T>(fieldKey, initialValue);

    const form = Form.useFormInstance();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const fieldValue: T = Form.useWatch(fieldKey, form);

    useEffect(() => {
        if (fieldValue !== undefined) {
            setFormValue(fieldValue);
        }
    }, [fieldValue, setFormValue]);

    return value;
}
