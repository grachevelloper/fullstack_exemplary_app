import {observable} from 'mobx';

interface TokenManagerType {
    refreshToken: string | undefined;
    authToken: string | undefined;
}

export class TokenManager implements TokenManagerType {
    @observable refreshToken: string | undefined = undefined;
    @observable authToken: string | undefined = undefined;
}
