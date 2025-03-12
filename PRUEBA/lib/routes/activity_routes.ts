// lib/routes/activity_routes.ts
import { Application, Request, Response, NextFunction } from 'express';
import { ActivityController } from '../controllers/activitycontroller';
import { authJWT } from '../middlewares/authJWT';

export class ActivityRoutes {
    private activity_controller: ActivityController = new ActivityController();
    private AuthJWT: authJWT = new authJWT();

    public route(app: Application) {
        // Crear nueva actividad
        app.post('/activities', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.createActivity(req, res);
            });
        });

        // Obtener feed de actividades
        app.get('/activities/feed', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.getActivityFeed(req, res);
            });
        });

        // Obtener actividades de un usuario específico
        app.get('/activities/user/:userId', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.getUserActivities(req, res);
            });
        });

        // Obtener una actividad específica
        app.get('/activities/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.getActivity(req, res);
            });
        });

        // Actualizar una actividad
        app.put('/activities/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err);
                    }
                    this.activity_controller.updateActivity(req, res);
                }, 'Activity');
            });
        });

        // Eliminar una actividad
        app.delete('/activities/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err);
                    }
                    this.activity_controller.deactivateActivity(req, res);
                }, 'Activity');
            });
        });

        // Dar kudos a una actividad
        app.post('/activities/:activityId/kudos', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.addKudos(req, res);
            });
        });

        // Añadir comentario a una actividad
        app.post('/activities/:activityId/comments', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.addComment(req, res);
            });
        });

        // Obtener actividades cercanas
        app.get('/activities/nearby/:longitude/:latitude/:maxDistanceKm', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.getNearbyActivities(req, res);
            });
        });

        // Obtener estadísticas de actividades por tipo
        app.get('/activities/stats/:type', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.getActivityStats(req, res);
            });
        });

        // Iniciar tracking de actividad en tiempo real
        app.post('/activities/tracking/start', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.startTracking(req, res);
            });
        });

        // Actualizar tracking de actividad en tiempo real
        app.post('/activities/tracking/:activityId/update', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.updateTracking(req, res);
            });
        });

        // Finalizar tracking de actividad
        app.post('/activities/tracking/:activityId/finish', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err);
                }
                this.activity_controller.finishTracking(req, res);
            });
        });
    }
}