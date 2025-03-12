import { Request, Response } from 'express';
import { IConversation } from '../modules/activities/model';
import ConversationService from '../modules/activities/service';
import UserService from '../modules/users/service';

export class ConversationController {

  private conversation_service: ConversationService = new ConversationService();
  private user_service: UserService = new UserService();

  public async create_conversation(req: Request, res: Response) {
    try{
        // this check whether all the filds were send through the request or not
        if (req.body.user
            && req.body.content
            ) {
            const conversation_params: IConversation = {
                user: req.body.user,
                content: req.body.content,
                conversation_deactivated: false,
            };
            const conversation_data = await this.conversation_service.createConversation(conversation_params);
            return res.status(201).json(conversation_data);
        }else{            
            return res.status(400).json({ error: 'Missing fields' });
        }
    }catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

  public async get_conversations(req: Request, res: Response) {
    try {
        // Extract pagination parameters from query string or use default values
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

        // Fetch users based on pagination parameters
        const conversation_data = await this.conversation_service.filterConversations({}, page, pageSize);

        // Send success response
        return res.status(200).json(conversation_data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

public async deactivate_conversation(req: Request, res: Response) {
    try {
        if (req.params.id) {
            const conversation_filter = { _id: req.params.id };
            // Create a partial user object with only the user_deactivated field updated
        const conversation_paramsPartial: Partial<IConversation> = {
            conversation_deactivated: true,
        };

        // Update user
        await this.conversation_service.deactivateConversation(conversation_paramsPartial, conversation_filter);
        return res.status(200).json({ message: 'User Deleted' });
    } else {
        // Send error response if ID parameter is missing
        return res.status(400).json({ error: 'Missing ID parameter' });
    }
} catch (error) {
    // Catch and handle any errors
    console.error("Error updating:", error);
    return res.status(500).json({ error: 'Internal server error' });
}
}

}