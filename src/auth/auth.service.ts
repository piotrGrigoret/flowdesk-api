import bcrypt from 'bcrypt';
import {InvalidCredentialsError} from '../errors/app.auth.error.js';
import {
  findUserByEmail,
} from './auth.repository.js';

export const loginUser = async (
     email: string, 
     password: string,
     signToken: (payload: object) => string
) => {

    const user = await findUserByEmail(email);

    if(!user) {
        // throw new Error('User not found');
        throw new InvalidCredentialsError();
        
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if(!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    const accessToken = signToken({
        sub: user.id,
        email: user.email,
    });

    return {
        token: accessToken
    };
};

