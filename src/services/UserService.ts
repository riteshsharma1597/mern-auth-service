import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { UserData, UserQueryParams } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const error = createHttpError(400, 'Email is already exist');
            throw error;
        }

        //Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in Database',
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        const user = await this.userRepository.findOne({
            where: { email: email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        });

        return user;
    }

    async findById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id: id },
            relations: {
                tenant: true,
            },
        });
        return user;
    }

    async update(
        id: number,
        userData: { firstName: string; lastName: string; role: string },
    ) {
        return await this.userRepository.update(id, userData);
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .getManyAndCount();

        return result;
        // return await this.userRepository.find();
    }

    async getById(userId: number) {
        return await this.userRepository.findOne({
            where: { id: userId },
        });
    }
}
