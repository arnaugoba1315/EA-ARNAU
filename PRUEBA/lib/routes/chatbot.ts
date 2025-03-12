import { Application, Request, Response, NextFunction } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import { authJWT } from '../middlewares/authJWT';

export class ChatbotRoutes {
    private chatbot_controller: ChatbotController = new ChatbotController();
    private AuthJWT: authJWT = new authJWT();

    public route(app: Application) {
        // Define route for chatbot requests
        app.post('/chatbot', (req: Request, res: Response, next: NextFunction) => {
            // Verify token before processing the message
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    return next(err); // Short-circuit if token verification fails
                }
                // Token verified, process the message
                this.chatbot_controller.processMessage(req, res);
            });
        });
    }
}
