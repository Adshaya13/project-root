# Test Credentials for Smart Campus Operations Hub

## Authentication
- **Method**: Google OAuth via Emergent Auth
- **Login URL**: Click "Sign in with Google" button on /login page
- No password-based credentials (OAuth only)

## Test User Accounts

### Admin User (Seeded in Database)
- **Email**: admin@campus.edu
- **Name**: Admin User
- **Role**: ADMIN
- **User ID**: admin_001

Note: To test as this admin user, you need to:
1. Create a session in MongoDB manually, OR
2. Sign in with Google and have the system assign this role

## Test Resources (Seeded)
- Main Lecture Hall A (resource_001)
- Computer Lab B (resource_002)
- Meeting Room C (resource_003)

## Testing Flow
1. Go to /login
2. Click "Sign in with Google"
3. Complete Google OAuth
4. System will create new user with USER role by default
5. To test other roles, update user role in MongoDB or use admin panel (when available)

## MongoDB Manual Session Creation
```bash
mongosh --eval "
use test_database;
var userId = 'admin_001';
var sessionToken = 'test_session_' + Date.now();
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
"
```

Then set the session_token cookie in your browser.
