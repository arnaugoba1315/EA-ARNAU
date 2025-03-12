import RevokedToken from './schema';
import * as jwt from 'jsonwebtoken';

export default class RevokedTokenService {
    public async revokeToken(token: string): Promise<void> {
        try {
            const decoded = jwt.decode(token) as jwt.JwtPayload;
            if (!decoded || !decoded.exp) {
                throw new Error('Token inválido');
            }

            const revokedToken = new RevokedToken({
                token,
                expiresAt: new Date(decoded.exp * 1000) // Convertir de UNIX timestamp a Date
            });
            await revokedToken.save();
        } catch (error) {
            throw new Error(`Error al revocar token: ${error.message}`);
        }
    }

    public async isTokenRevoked(token: string): Promise<boolean> {
        try {
            const revokedToken = await RevokedToken.findOne({ token });
            return !!revokedToken;
        } catch (error) {
            throw new Error(`Error al verificar token: ${error.message}`);
        }
    }

    public async cleanupExpiredTokens(): Promise<void> {
        try {
            await RevokedToken.deleteMany({
                expiresAt: { $lt: new Date() }
            });
        } catch (error) {
            throw new Error(`Error al limpiar tokens expirados: ${error.message}`);
        }
    }
}