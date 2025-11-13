import {useCallback, useState} from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = window.localStorage.getItem(key);
        if (item === null) {
            return initialValue;
        }

        if (typeof initialValue === 'string') {
            return item as unknown as T;
        }

        try {
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return item as unknown as T;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);
            try {
                if (typeof valueToStore === 'string') {
                    window.localStorage.setItem(key, valueToStore);
                } else {
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );
                }
            } catch (error) {
                console.error(
                    `Error setting localStorage key "${key}":`,
                    error
                );
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue] as const;
}
