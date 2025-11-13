import {Rule} from 'antd/es/form';
import React from 'react';

interface ComponentBaseProps {
    title?: string;
    index: number;
    actions?: React.ReactNode[];
}

export interface FormField extends ComponentBaseProps {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    rules?: Rule[];
    dependencies?: string[];
}

export interface CardProps extends ComponentBaseProps {
    content: React.ReactNode | string;
}
