import {Rule} from 'antd/es/form';
import React from 'react';

interface ComponentBaseProps {
    title?: string;
    index: number;
    actions?: React.ReactNode[];
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
}

export interface FormField extends ComponentBaseProps {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'number';
    autoComplete?: string;
    dataMarker?: string;
    placeholder?: string;
    rules?: Rule[];
    dependencies?: string[];
}

export interface CardProps extends ComponentBaseProps {
    content: React.ReactNode | string;
}
