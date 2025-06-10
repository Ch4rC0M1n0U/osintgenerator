import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { generateProfile } from '../services/profileGenerator.js';
import { generateSocialMediaProfiles } from '../services/socialMediaGenerator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateProfile = [
  body('nationality').optional().isLength({ min: 2, max: 10 }),
  body('gender').optional().isIn(['male', 'female']),
  body('minAge').optional().isInt({ min: 18, max: 100 }),
  body('maxAge').optional().isInt({ min: 18, max: 100 }),
];

// Generate new profile
router.post('/generate', validateProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nationality, gender, minAge, maxAge } = req.body;
    
    // Generate basic profile
    const profile = await generateProfile({ nationality, gender, minAge, maxAge });
    
    // Save to database
    const profileData = {
      id: profile.id,
      first_name: profile.firstName,
      last_name: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender,
      nationality: profile.nationality,
      age: profile.age,
      photo_url: profile.photoUrl,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      postcode: profile.postcode,
      created_by: req.user.userId
    };

    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO profiles (
          id, first_name, last_name, email, phone, gender, 
          nationality, age, photo_url, address, city, state, country, postcode, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(Object.values(profileData), function(err) {
        if (err) reject(err);
        else resolve(this);
      });
      stmt.finalize();
    });

    // Generate social media profiles
    const socialMediaProfiles = generateSocialMediaProfiles(profile);
    
    // Save social media profiles
    for (const smProfile of socialMediaProfiles) {
      await new Promise((resolve, reject) => {
        const stmt = db.prepare(`
          INSERT INTO social_media_profiles (
            profile_id, platform, username, bio, followers, following, 
            posts_count, interests, data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
          profile.id,
          smProfile.platform,
          smProfile.username,
          smProfile.bio,
          smProfile.followers,
          smProfile.following,
          smProfile.postsCount,
          JSON.stringify(smProfile.interests),
          JSON.stringify(smProfile.data)
        ], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
        stmt.finalize();
      });
    }

    // Log the action
    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO usage_logs (profile_id, user_id, action, notes) 
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([profile.id, req.user.userId, 'GENERATED', 'Profile generated'], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
      stmt.finalize();
    });

    res.json({ profile, socialMediaProfiles });
  } catch (error) {
    console.error('Error generating profile:', error);
    res.status(500).json({ error: 'Failed to generate profile' });
  }
});

// Get all profiles (only for the authenticated user)
router.get('/', async (req, res) => {
  try {
    const { search, tag, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, GROUP_CONCAT(t.name) as tags
      FROM profiles p
      LEFT JOIN profile_tags pt ON p.id = pt.profile_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.created_by = ?
    `;
    
    const params = [req.user.userId];
    
    if (search) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (tag) {
      query += ` AND t.name = ?`;
      params.push(tag);
    }
    
    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const profiles = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get profile by ID with social media data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM profiles WHERE id = ? AND created_by = ?', [id, req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const socialMediaProfiles = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM social_media_profiles WHERE profile_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else {
          // Parse JSON strings back to objects/arrays for consistency
          const parsedRows = rows.map(row => ({
            ...row,
            interests: JSON.parse(row.interests || '[]'),
            data: JSON.parse(row.data || '{}')
          }));
          resolve(parsedRows);
        }
      });
    });
    
    const tags = await new Promise((resolve, reject) => {
      db.all(`
        SELECT t.* FROM tags t
        JOIN profile_tags pt ON t.id = pt.tag_id
        WHERE pt.profile_id = ?
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Log the view action
    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO usage_logs (profile_id, user_id, action, notes) 
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([id, req.user.userId, 'VIEWED', 'Profile viewed'], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
      stmt.finalize();
    });

    res.json({ profile, socialMediaProfiles, tags });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Delete profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM profiles WHERE id = ? AND created_by = ?', [id, req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM profiles WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// Add tag to profile
router.post('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tagName, color = '#3B82F6' } = req.body;
    
    // Verify ownership
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM profiles WHERE id = ? AND created_by = ?', [id, req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Create tag if it doesn't exist
    const tagId = await new Promise((resolve, reject) => {
      db.run('INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)', [tagName, color], function(err) {
        if (err) reject(err);
        else {
          db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
            if (err) reject(err);
            else resolve(row.id);
          });
        }
      });
    });
    
    // Associate tag with profile
    await new Promise((resolve, reject) => {
      db.run('INSERT OR IGNORE INTO profile_tags (profile_id, tag_id) VALUES (?, ?)', [id, tagId], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    
    res.json({ message: 'Tag added successfully' });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Get all tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tags ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

export default router;