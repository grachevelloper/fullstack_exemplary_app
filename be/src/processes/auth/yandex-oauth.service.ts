import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

import {User} from "../../modules/users/users.entity";
import {UsersService} from "../../modules/users/users.service";

interface YandexTokenResponse {
    access_token?: string;
}

interface YandexProfile {
    default_avatar_id?: string;
    default_email?: string;
    display_name?: string;
    first_name?: string;
    id?: string;
    is_avatar_empty?: boolean;
    last_name?: string;
    login?: string;
    real_name?: string;
    sex?: "female" | "male" | null;
}

@Injectable()
export class YandexOAuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {}

    getAuthorizationUrl(state: string): string {
        const url = new URL("https://oauth.yandex.ru/authorize");
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.getConfig("YANDEX_CLIENT_ID"));
        url.searchParams.set(
            "redirect_uri",
            this.getConfig("YANDEX_REDIRECT_URI"),
        );
        url.searchParams.set("state", state);

        return url.toString();
    }

    async authenticate(code: string): Promise<User> {
        const accessToken = await this.exchangeCode(code);
        const profile = await this.loadProfile(accessToken);

        if (!profile.id || !profile.default_email) {
            throw new BadGatewayException(
                "Yandex did not return a user id and email",
            );
        }

        const existingUser = await this.usersService.findByYandexId(profile.id);
        if (existingUser) {
            return existingUser;
        }

        const username = this.getUsername(profile);
        const avatar =
            profile.is_avatar_empty || !profile.default_avatar_id
                ? null
                : `https://avatars.yandex.net/get-yapic/${encodeURIComponent(profile.default_avatar_id)}/islands-200`;

        return this.usersService.createFromYandex({
            yandexId: profile.id,
            email: profile.default_email.toLowerCase(),
            username,
            avatar,
        });
    }

    private async exchangeCode(code: string): Promise<string> {
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: this.getConfig("YANDEX_CLIENT_ID"),
            client_secret: this.getConfig("YANDEX_CLIENT_SECRET"),
        });

        const response = await this.request(
            "https://oauth.yandex.ru/token",
            {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body,
            },
        );
        const result = (await response.json()) as YandexTokenResponse;

        if (!result.access_token) {
            throw new BadGatewayException("Yandex token response is invalid");
        }
        return result.access_token;
    }

    private async loadProfile(accessToken: string): Promise<YandexProfile> {
        const response = await this.request(
            "https://login.yandex.ru/info?format=json",
            {
                headers: {Authorization: `OAuth ${accessToken}`},
            },
        );
        return (await response.json()) as YandexProfile;
    }

    private async request(
        url: string,
        init: RequestInit,
    ): Promise<Response> {
        let response: Response;
        try {
            response = await fetch(url, init);
        } catch {
            throw new ServiceUnavailableException("Yandex is unavailable");
        }
        if (!response.ok) {
            throw new BadGatewayException("Yandex OAuth request failed");
        }
        return response;
    }

    private getUsername(profile: YandexProfile): string {
        const candidate =
            profile.display_name ||
            profile.real_name ||
            [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
            profile.login;

        if (!candidate) {
            throw new BadGatewayException("Yandex did not return a user name");
        }
        return candidate.slice(0, 50);
    }

    private getConfig(name: string): string {
        const value = this.configService.get<string>(name);
        if (!value) {
            throw new ServiceUnavailableException(
                "Yandex OAuth is not configured",
            );
        }
        return value;
    }
}
