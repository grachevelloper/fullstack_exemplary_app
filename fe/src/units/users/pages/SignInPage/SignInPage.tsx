import {SignForm} from '@/shared/components/SignForm/SignForm';

import {useSignInFields} from './hooks';

export const SignInPage = () => {
    const signInFields = useSignInFields();
    const handleSubmit = (values: any) => {
        return;
    };

    return (
        <div>
            <SignForm
                fields={signInFields}
                onSubmit={handleSubmit}
                submitText='Войти'
            />
        </div>
    );
};
