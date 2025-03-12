import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../modules/users/schema';
import UserService from '../modules/users/service';
import IJwtPayload from '../modules/JWTPayload';
import RevokedTokenService from '../modules/revokedToken/service';
import { io } from '../config/app';
import { OAuth2Client } from 'google-auth-library';
var verifier = require('google-id-token-verifier');
import * as crypto from 'crypto';


export class ReactAuthController {
  private user_service: UserService = new UserService();
  private revoked_token_service: RevokedTokenService = new RevokedTokenService();
  private google_client: OAuth2Client = new OAuth2Client(
    '445123380978-mvj74v61pr1rv34d7a6st0e8e65l5alh.apps.googleusercontent.com',
  );

  public async googleLogin(req: Request, res: Response): Promise<Response> {
    const _SECRET: string = 'api+jwt';
    const idToken = req.body.idToken;
    try {
      const ticket = await this.google_client.verifyIdToken({
        idToken: idToken,
        audience: '445123380978-mvj74v61pr1rv34d7a6st0e8e65l5alh.apps.googleusercontent.com', // Replace with your actual Google client ID
      });
      const payload = ticket.getPayload();
      const email = payload['email'];

      // Check if user exists in your database
      const userFound = await this.user_service.filterOneUser({ email });

      try{
      if (!userFound) {
        // Generate a random password
        const randomPassword = crypto.randomBytes(10).toString('hex');

        // Generate a random 10-digit phone number
        const randomNumber = () => Math.floor(Math.random() * 9) + 1;
        const randomPhoneNumber = `${randomNumber()}${Math.floor(Math.random() * 1000000000)}`;

        // Create user with random password and phone number
        const newUser = new User({
            first_name: 'Google User',
            last_name: 'Google User',
            email: payload['email'],
            phone_number: randomPhoneNumber,
            gender: 'not specified',
            password: randomPassword,
            birth_date: new Date(),
            role: req.body.role || 'user',
            user_deactivated: false,
            creation_date: new Date(),
            modified_date: new Date(),
        });
        newUser.password = await newUser.encryptPassword(randomPassword);
        const user_data = await this.user_service.register(newUser);
      }
    }
    catch(error){   
        console.error('Error during Google login:', error);
        return res.status(500).json({message: 'Internal Server Error',
        });
    }


      // Create JWT payload
      const session = { id: userFound._id } as IJwtPayload;

      // Sign JWT token
      const token = jwt.sign(session, _SECRET, {
        expiresIn: 86400, // 24 hours
      });

      // Send response with token
      return res.json({ token: token, _id: userFound._id, first_name: userFound.first_name });
    } catch (error) {
      console.error('Error during Google login:', error);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  }
}
