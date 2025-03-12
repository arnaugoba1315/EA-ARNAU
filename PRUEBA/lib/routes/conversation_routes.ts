import { Application, Request, Response, NextFunction } from 'express';
import { ConversationController } from '../controllers/conversationController';
import {authJWT} from '../middlewares/authJWT';

export class ConversationRoutes {

    private conversation_controller: ConversationController = new ConversationController();
    private AuthJWT: authJWT = new authJWT();

    public route(app: Application) {

        // Create conversation
        app.post('/conversation', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.conversation_controller.create_conversation(req, res);
            });
        });

        // Get conversations
        app.get('/conversation', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.conversation_controller.get_conversations(req, res);
            });
        });

        // Delete conversation by ID
        app.delete('/conversation/:id', (req: Request, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                this.AuthJWT.isOwner(req, res, (err?: any) => {
                    if (err) {
                        return next(err); // Short-circuit if isOwner check fails
                    }
                    this.conversation_controller.deactivate_conversation(req, res);
                }, 'Conversation');
            });
        });
    }
}