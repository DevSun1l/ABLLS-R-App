import { getDb } from '../_utils/db.js';
import { verifyPassword, generateToken } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const { email, password } = req.body;
     const db = getDb();
     const result = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email]
     });
     
     if (result.rows.length === 0) {
        return res.status(401).json({error: 'Invalid credentials'});
     }
     
     const user = result.rows[0];

     if (user.status === 'blocked') {
        return res.status(403).json({ 
           error: 'YOUR ACCOUNT HAS BEEN BLOCKED FOR SUSPICION OF VIOLATING THE GUIDELINES OF THE APP. PLEASE CONTACT helpdesk@cognifycareteam.com for more info' 
        });
     }

     const isValid = await verifyPassword(password, user.password_hash);
     
     if (!isValid) {
        return res.status(401).json({error: 'Invalid credentials'});
     }
     
     // Log login activity
     await db.execute({
        sql: "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
        args: [user.id, 'login', JSON.stringify({ ip: req.headers['x-forwarded-for'] || 'local' })]
     });

     const token = generateToken(user);
     return res.status(200).json({ 
        token, 
        user: { 
           id: user.id, 
           email: user.email, 
           role: user.role, 
           first_name: user.first_name, 
           last_name: user.last_name, 
           org_id: user.org_id 
        } 
     });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}
