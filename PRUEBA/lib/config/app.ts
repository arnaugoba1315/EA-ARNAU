import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import * as http from 'http';
import { Server } from "socket.io";
import environment from "../environment";
import { TestRoutes } from "../routes/test_routes";
import { UserRoutes } from "../routes/user_routes";
import { AchievementRoutes } from "../routes/achievement_routes";
import { PlaceRoutes } from "../routes/place_routes";
import { ActivityRoutes } from "../routes/activity_routes";
import { ConversationRoutes } from "../routes/conversation_routes";
import { ChallengeRoutes } from "../routes/challenge_routes";
import { ChatbotRoutes } from "../routes/chatbot";
import { PhotoUploadRoutes } from "../routes/photo_upload_routes";


class App {

   public app: express.Application;
   public server: http.Server;
   public io: Server;
   //if testing on local machine use the localhost link and comment the link below
   public mongoUrl: string = 'mongodb://localhost/' + environment.getDBName();
   //public mongoUrl: string = 'mongodb://bankitos-mongodb:27017/' + environment.getDBName();

   private test_routes: TestRoutes = new TestRoutes();
   private achievement_routes: AchievementRoutes = new AchievementRoutes();
   private user_routes: UserRoutes = new UserRoutes();
   private place_routes: PlaceRoutes = new PlaceRoutes();
   private activity_routes: ActivityRoutes = new ActivityRoutes();
   private conversation_routes: ConversationRoutes = new ConversationRoutes();
   private challenge_routes: ChallengeRoutes = new ChallengeRoutes();
   private chatbot_routes: ChatbotRoutes = new ChatbotRoutes();
   private photo_upload_routes: PhotoUploadRoutes = new PhotoUploadRoutes();

   constructor() {
      this.app = express();
      this.server = http.createServer(this.app);
      this.io = new Server(this.server,{cors: {origin: "*"}});
      this.io.on("connection", (socket: any) => {
         console.log("New client connected");
         socket.on("disconnect", () => console.log("Client disconnected"));
      });

      this.config();
      this.mongoSetup();
      this.test_routes.route(this.app);
      this.user_routes.route(this.app);
      this.place_routes.route(this.app);
      this.achievement_routes.route(this.app);
      this.conversation_routes.route(this.app);
      this.challenge_routes.route(this.app);
      this.chatbot_routes.route(this.app);
      this.photo_upload_routes.route(this.app);
      //Siempre dejarlo abajo del todo si no da error!!!
      this.activity_routes.route(this.app);
   }

   private config(): void {
      // support application/json type post data
      this.app.use(bodyParser.json());
      //support application/x-www-form-urlencoded post data
      this.app.use(bodyParser.urlencoded({ extended: false }));
      // Enable CORS for all origins
      this.app.use(cors());
   }

   private mongoSetup(): void {
      mongoose.connect(this.mongoUrl)
          .then(() => {
              console.log("MongoDB connected successfully.");
          })
          .catch((err) => {
              console.error("MongoDB connection error:", err);
          });
  }
}
const appInstance = new App();
export default appInstance.server;
export const io = appInstance.io;