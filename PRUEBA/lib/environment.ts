// lib/environment.ts
import * as dialogflow from '@google-cloud/dialogflow';
import * as path from 'path';
import * as dotenv from 'dotenv';


dotenv.config();

console.log("Google Application Credentials:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("GCP Project ID:", process.env.GCP_PROJECT_ID);

// Define sessionClient globally
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});

// Define sessionPath function globally
const sessionPath = (sessionId: string) => sessionClient.sessionPath(process.env.GCP_PROJECT_ID as string, sessionId);

enum Environments {
    local_environment = 'local',
    dev_environment = 'dev',
    prod_environment = 'prod',
    qa_environment = 'qa'
}

class Environment {
    private environment: string;

    constructor(environment: string) {
        this.environment = environment;
    }

    getPort(): number {
        switch (this.environment) {
            case Environments.prod_environment:
                return 8081;
            case Environments.dev_environment:
                return 8082;
            case Environments.qa_environment:
                return 8083;
            default:
                return 3000;
        }
    }

    getDBName(): string {
        switch (this.environment) {
            case Environments.prod_environment:
                return 'db_test_project_prod';
            case Environments.dev_environment:
                return 'db_test_project_dev';
            case Environments.qa_environment:
                return 'db_test_project_qa';
            default:
                return 'bankitos_BBDD';
        }
    }

    getAPIKey(): string | undefined {
        return process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    getSessionPath(sessionId: string): string {
        const projectId = process.env.GCP_PROJECT_ID as string; // Make sure to set this in your .env file
        return sessionPath(sessionId); // Use the globally defined sessionPath function
    }
}

export default new Environment(Environments.local_environment);

// Export sessionClient and sessionPath individually
export { sessionClient, sessionPath };
