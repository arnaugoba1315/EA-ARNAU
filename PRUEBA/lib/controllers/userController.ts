import { Request, Response } from 'express';
import { IUser } from '../modules/users/model';
import UserService from '../modules/users/service';
import * as mongoose from 'mongoose';
import User from '../modules/users/schema';

export class UserController {
  private user_service: UserService = new UserService();

  public async register_user(req: Request, res: Response) {
    try {
      console.log(2);
      // this check whether all the filds were send through the request or not
      if (
        req.body.first_name &&
        req.body.last_name &&
        req.body.email &&
        req.body.phone_number &&
        req.body.gender &&
        req.body.password &&
        req.body.birth_date
      ) {
        const user_params = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone_number: req.body.phone_number,
          gender: req.body.gender,
          password: req.body.password,
          birth_date: req.body.birth_date,
          role: req.body.role || 'user',
          user_deactivated: false,
          creation_date: new Date(),
          modified_date: new Date(),
        });
        console.log(3);
        user_params.password = await user_params.encryptPassword(req.body.password);
        const user_data = await this.user_service.register(user_params);
        console.log(user_data);
        return res.status(201).json(user_data);
      } else {
        return res.status(400).json({ error: 'Missing fields' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async get_user(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const user_filter = { _id: req.params.id };
        // Fetch user
        const user_data = await this.user_service.filterOneUser(user_filter);
        if (user_data.user_deactivated === true) {
          return res.status(400).json({ error: 'User not found' });
        }
        // Send success response
        return res.status(200).json(user_data);
      } else {
        return res.status(400).json({ error: 'Missing fields' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async get_user_even_deactivated(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const user_filter = { _id: req.params.id };
        // Fetch user
        const user_data = await this.user_service.filterOneUser(user_filter);
        // Send success response
        return res.status(200).json(user_data);
      } else {
        return res.status(400).json({ error: 'Missing fields' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async get_users(req: Request, res: Response) {
    try {
      // Extract pagination parameters from query string or use default values
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 100;

      // Fetch users based on pagination parameters
      const user_data = await this.user_service.filterUsers({}, page, pageSize);

      // Send success response
      return res.status(200).json(user_data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async get_users_even_deactivated(req: Request, res: Response) {
    try {
      // Extract pagination parameters from query string or use default values
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

      // Fetch users based on pagination parameters
      const user_data = await this.user_service.filterUsersEvenDeactivated({}, page, pageSize);

      // Send success response
      return res.status(200).json(user_data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async update_user(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const user_filter = { _id: req.params.id };
        // Fetch user
        const user_data = await this.user_service.filterOneUser(user_filter);
        if (user_data.user_deactivated === true) {
          return res.status(400).json({ error: 'User not found' });
        }
        const objectid = new mongoose.Types.ObjectId(req.params.id);

        // Check if emergency_contact exists in req.body and handle accordingly
        const emergency_contact = req.body.emergency_contact || {};

        const user_params = new User({
          _id: objectid,
          first_name: req.body.first_name || user_data.first_name,
          middle_name: req.body.middle_name || user_data.middle_name,
          last_name: req.body.last_name || user_data.last_name,
          email: req.body.email || user_data.email,
          phone_number: req.body.phone_number || user_data.phone_number,
          gender: req.body.gender || user_data.gender,
          places: user_data.places,
          reviews: user_data.reviews,
          conversations: user_data.conversations,
          user_rating: user_data.user_rating,
          photo: req.body.photo || user_data.photo,
          description: req.body.description || user_data.description,
          personality: req.body.personality || user_data.personality,
          password: user_data.password,
          birth_date: req.body.birth_date || user_data.birth_date,
          role: req.body.role || user_data.role,
          user_deactivated: user_data.user_deactivated,
          creation_date: user_data.creation_date,
          modified_date: new Date(),
        });

        // Update user
        await this.user_service.updateUser(user_params);
        //get new user data
        const new_user_data = await this.user_service.filterOneUser(user_filter);
        // Send success response
        return res.status(200).json(new_user_data);
      } else {
        // Send error response if ID parameter is missing
        return res.status(400).json({ error: 'Missing ID parameter' });
      }
    } catch (error) {
      // Catch and handle any errors
      console.error('Error updating:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  public async update_pass(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const user_filter = { _id: req.params.id };
        // Fetch user
        const user_data = await this.user_service.filterOneUser(user_filter);
        if (user_data.user_deactivated === true) {
          return res.status(400).json({ error: 'User not found' });
        }
        console.log(req.body.oldpassword);
        console.log(req.body.newpassword);
        const validPassword = await user_data.validatePassword(req.body.oldpassword);

        // Check if password is valid
        if (!validPassword) {
          return res.status(401).json({
            token: null,
            message: 'El usuario o la contraseña son incorrectos.',
          });
        } else {
          user_data.password = await user_data.encryptPassword(req.body.newpassword);
          await this.user_service.updateUser(user_data);

          // Send success response
          return res.status(200).json();
        }
      } else {
        // Send error response if ID parameter is missing
        return res.status(400).json({ error: 'Missing ID parameter' });
      }
    } catch (error) {
      // Catch and handle any errors
      console.error('Error updating:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async deactivate_user(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const user_filter = { _id: req.params.id };
        // Fetch user
        const user_data = await this.user_service.filterOneUser(user_filter);
        if (user_data.user_deactivated === true) {
          return res.status(400).json({ error: 'User not found' });
        }
        // Create a partial user object with only the user_deactivated field updated
        const user_paramsPartial: Partial<IUser> = {
          user_deactivated: true,
          modified_date: new Date(),
        };

        // Update user
        await this.user_service.deactivateUser(user_paramsPartial, user_filter);

        const new_user_data = await this.user_service.filterOneUser(user_filter);
        // Send success response
        if (new_user_data.user_deactivated === true) {
          return res.status(200).json({ message: 'User Deleted' });
        }
      } else {
        // Send error response if ID parameter is missing
        return res.status(400).json({ error: 'Missing ID parameter' });
      }
    } catch (error) {
      // Catch and handle any errors
      console.error('Error updating:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
