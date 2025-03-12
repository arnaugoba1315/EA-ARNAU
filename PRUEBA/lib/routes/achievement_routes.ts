// lib/routes/achievement_routes.ts
import { Application, Request, Response, NextFunction } from 'express';
import { AchievementController } from '../controllers/AchivementsController';
import { authJWT } from '../middlewares/authJWT';
import { Router } from 'express';

export class AchievementRoutes {
    private achievement_controller: AchievementController = new AchievementController();
    private AuthJWT: authJWT = new authJWT();

    public route(app: Application) {
        // Crear nuevo logro (solo admin)
        app.post('/achievements', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.AuthJWT.isAdmin(req, res, (err?: any) => {
                    if (err) {
                        return next(err);
                    }
                    this.achievement_controller.createAchievement(req, res);
                });
            });
        });

        // Obtener logros del usuario
        app.get('/achievements/user/:userId?', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getUserAchievements(req, res);
            });
        });

        // Obtener logros disponibles
        app.get('/achievements/available', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getAvailableAchievements(req, res);
            });
        });

        // Obtener progreso del usuario
        app.get('/achievements/progress/:userId?', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getUserProgress(req, res);
            });
        });

        // Obtener progreso por categoría
        app.get('/achievements/category/:category/progress/:userId?', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getCategoryProgress(req, res);
            });
        });

        // Obtener logros recientes
        app.get('/achievements/recent/:userId?', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getUserAchievements(req, res);
            });
        });

        // Verificar logros (llamado después de completar actividades)
        app.post('/achievements/check', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.checkAchievements(req, res);
            });
        });

        // Obtener puntos totales
        app.get('/achievements/points/:userId?', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.achievement_controller.getTotalPoints(req, res);
            });
        });

        // Actualizar logro (solo admin)
        app.put('/achievements/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.AuthJWT.isAdmin(req, res, (err?: any) => {
                    if (err) {
                        return next(err);
                    }
                    this.achievement_controller.createAchievement(req, res);
                });
            });
        });

        // Desactivar logro (solo admin)
        app.delete('/achievements/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.AuthJWT.isAdmin(req, res, (err?: any) => {
                    if (err) {
                        return next(err);
                    }
                    this.achievement_controller.createAchievement(req, res);
                });
            });
        });
    }
}