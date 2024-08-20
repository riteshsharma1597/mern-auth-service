import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
             
        } catch (err) {
            console.log(err);
            const error = createHttpError(
                '500',
                'Failed to store the data in Database',
            );
            throw error;
        }
    }
}
