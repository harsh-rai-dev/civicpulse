import 'dotenv/config';

export const JWT_SECRET: string = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to backend/.env');
}

export default JWT_SECRET;
