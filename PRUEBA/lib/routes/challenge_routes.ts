// lib/routes/challenge_routes.ts
import { Application, Request, Response, NextFunction } from 'express';
import { ChallengeController } from '../controllers/challengecontroller';
import { authJWT } from '../middlewares/authJWT';

export class ChallengeRoutes {
    private challenge_controller: ChallengeController = new ChallengeController();
    private AuthJWT: authJWT = new authJWT();

    public route(app: Application) {
        // Crear nuevo reto
        app.post('/challenges', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.createChallenge(req, res);
            });
        });

        // Obtener retos activos del usuario
        app.get('/challenges/active', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.getActiveUserChallenges(req, res);
            });
        });

        // Obtener retos disponibles para unirse
        app.get('/challenges/available', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.getAvailableChallenges(req, res);
            });
        });

        // Unirse a un reto
        app.post('/challenges/:challengeId/join', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.joinChallenge(req, res);
            });
        });

        // Obtener leaderboard de un reto
        app.get('/challenges/:challengeId/leaderboard', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.getLeaderboard(req, res);
            });
        });

        // Actualizar progreso de un reto (generalmente llamado después de registrar una actividad)
        app.post('/challenges/:challengeId/progress', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.challenge_controller.updateProgress(req, res);
            });
        });
    }
}