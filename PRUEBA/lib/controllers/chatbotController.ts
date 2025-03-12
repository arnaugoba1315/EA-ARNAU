import { Request, Response } from 'express';
import * as dialogflow from 'dialogflow';
import * as path from 'path';
import environment from '../environment';

export class ChatbotController {
    private sessionClient: dialogflow.SessionsClient;
    private sessionPath: string;

    constructor() {
        this.sessionClient = new dialogflow.SessionsClient({
            keyFilename: path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
        });
        this.sessionPath = environment.getSessionPath('unique-session-id'); // You can use a unique session ID for each conversation
    }

    public async processMessage(req: Request, res: Response) {
        try {
            // Extract message from request body
            const { message } = req.body;

            // Create request object
            const request = {
                session: this.sessionPath,
                queryInput: {
                    text: {
                        text: message,
                        languageCode: 'en-US',
                    },
                },
            };

            // Send request to Dialogflow
            const responses = await this.sessionClient.detectIntent(request);
            const result = responses[0].queryResult;

            // Get response from Dialogflow
            const reply = result.fulfillmentText;

            // Send response
            return res.status(200).json({ reply });
        } catch (error) {
            console.error('Error processing message:', error);
            return res.status(500).json({ error: 'Failed to process message' });
        }
    }
}
