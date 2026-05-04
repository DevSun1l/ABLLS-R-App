import { getDb } from '../_utils/db.js';
import { hashPassword, generateToken } from '../_utils/auth.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const { firstName, lastName, email, password, role, organization } = req.body;
     
     if (!firstName || !lastName || !email || !password || !role || !organization) {
         return res.status(400).json({error: 'Missing required fields'});
     }

     const db = getDb();
     
     // Check if email exists
     const { data: existing, error: checkError } = await db
       .from('users')
       .select('id')
       .eq('email', email);

     if (checkError) return res.status(500).json({error: checkError.message});
     
     if (existing && existing.length > 0) {
        return res.status(400).json({error: 'Email already registered'});
     }
     
     // Create organization
     const orgId = `org_${uuidv4().substring(0,8)}`;
     const { error: orgError } = await db
       .from('organizations')
       .insert({ id: orgId, name: organization });

     if (orgError) return res.status(500).json({error: orgError.message});
     
     const userId = `usr_${uuidv4().substring(0,8)}`;
     const hashed = await hashPassword(password);
     
     const { error: userError } = await db
       .from('users')
       .insert({
          id: userId,
          email,
          password_hash: hashed,
          first_name: firstName,
          last_name: lastName,
          role,
          org_id: orgId
       });

     if (userError) return res.status(500).json({error: userError.message});
     
     const user = { id: userId, email, role, first_name: firstName, last_name: lastName, org_id: orgId };
     const token = generateToken(user);
     
     return res.status(201).json({ token, user });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}
