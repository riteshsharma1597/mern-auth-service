import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies;
        return refreshToken;
    },

    // async isRevoked(req: Request, token) {
    //     try {
    //         const refreshTokenRepository =
    //             AppDataSource.getRepository(RefreshToken);
    //         const refreshToken = await refreshTokenRepository.findOne({
    //             where: {
    //                 id: Number((token?.payload as IRefreshTokenPayload)?.id),
    //                 user: { id: Number(token?.payload?.sub) },
    //             },
    //         });

    //         return refreshToken === null;
    //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     } catch (err) {
    //         logger.error('Error while getting the refresh token', {
    //             id: (token?.payload as IRefreshTokenPayload).id,
    //         });
    //     }

    //     return true;
    // },
});
