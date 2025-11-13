export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    rules?: any[];
    dependencies?: string[];
}
