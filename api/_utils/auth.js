import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'ablls_super_secret_dev_key_change_me_in_prod';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user) => {
  return jwt.sign(
    { 
       id: user.id, 
       email: user.email, 
       role: user.role, 
       org_id: user.org_id,
       first_name: user.first_name,
       last_name: user.last_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
   try {
     return jwt.verify(token, JWT_SECRET);
   } catch(e) {
     return null;
   }
};

// Middleware-like helper for vercel api routes
export const requireAuth = (req) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
   const token = authHeader.split(' ')[1];
   return verifyToken(token);
};
