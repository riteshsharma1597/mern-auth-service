import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        // let privateKey: Buffer;
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, 'SECRET KEY is not set');
            throw error;
        }
        try {
            // privateKey = fs.readFileSync(
            //     path.join(__dirname, '../../certs/private.pem'),
            // );
            privateKey = Config.PRIVATE_KEY;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Error while reading private key',
            );
            throw error;
            return;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1m',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 100 * 60 * 60 * 24 * 365; //1y-> (Leap year)
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return this.refreshTokenRepository.delete({ id: tokenId });
    }
}
