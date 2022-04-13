//generate an auth token and store it in the DB and set it as a cookie
import { v4 as uuidv4 } from 'uuid';
import {dbPromise} from './index';

export const grantAuthToken = async (userId) =>{
    const db = await dbPromise;
    const tokenString = uuidv4();
    await db.run('INSERT INTO Authtokens (token, userId) VALUES (?,?);',
        tokenString, userId);
    return tokenString;
}

export const lookUpUserFromAuthToken = async (authToken)=>{
    const db = await dbPromise;
    const token = await db.get('SELECT * FROM AuthTokens WHERE token=?;', authToken);
    if(!token){
        return null;
    }
    const user = await db.get('SELECT id, email, username FROM Users WHERE id=?;', token.userId);
    return user;
}