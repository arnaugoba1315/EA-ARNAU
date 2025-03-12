import { Application, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import  {authJWT}  from '../middlewares/authJWT';
import { AuthController } from '../controllers/authController';
import { ReactAuthController } from '../controllers/reactAuthController';

export class UserRoutes {

    private user_controller: UserController = new UserController();
    private AuthJWT: authJWT = new authJWT();
    private auth_controller: AuthController = new AuthController();
    private react_auth_controller: ReactAuthController = new ReactAuthController();

    public route(app: Application) {
        
        app.post('/users', (req: Request, res: Response) => {
            console.log(1);
            this.user_controller.register_user(req, res);
        });

        app.post('/login', (req: Request, res: Response) => {
            
            this.auth_controller.signin(req, res);
        });

        app.post('/loginWithGoogle', (req: Request, res: Response) => {
            
            this.auth_controller.signinWithGoogle(req, res);
        });

        app.post('/googleloginreact', (req: Request, res: Response) => {
            this.react_auth_controller.googleLogin(req, res);
        });

        app.post('/logout', (req: Request, res: Response) => {
            this.auth_controller.logout(req, res);
        });


        app.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.user_controller.get_user(req, res);
            });
        });

        app.get('/usersadmin/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isAdmin(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isAdmin check fails
                    }
                    this.user_controller.get_user_even_deactivated(req, res);
                });
            });
        });

        //For the routes The page and pageSize parameters can be provided as query parameters:
        // e.g., /users?page=2&pageSize=10, to specify the page number and the number of users per page. 
        //If these parameters are not provided, default values will be used (page 1, pageSize 10).
        app.get('/users', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.user_controller.get_users(req, res);
            }); 
        });

        app.get('/usersadmin', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isAdmin(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isAdmin check fails
                    }
                    this.user_controller.get_users(req, res);
                });
            });
        });

        app.put('/users/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isOwner check fails
                    }
                    this.user_controller.update_user(req, res);
                }, 'User');
            });
        });
        app.put('/users/changepassword/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isOwner check fails
                    }
                    this.user_controller.update_pass(req, res);
                }, 'User');
            });
        });


        app.delete('/users/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isOwner check fails
                    }
                    this.user_controller.deactivate_user(req, res);
                }, 'User');
            });
        });
        

    }
}
