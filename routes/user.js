const express = require('express');
const { query } = require('../helpers/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { auth } = require("../helpers/auth.js");
const multer = require('multer');
const path = require('path');


// configure where to save photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const userRouter = express.Router();

// LOGIN
userRouter.post('/login', async (req, res) => {
  try {
    const sql = "select * from users where email=$1 and role=$2"
    const result = await query(sql, [req.body.email, req.body.role])
    if (result.rowCount === 1) {
      bcrypt.compare(req.body.password, result.rows[0].password, (err, bcrypt_res) => {
        if (!err) {
          if (bcrypt_res === true) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET_KEY)
            res.status(200).json({
              id: user.id,
              email: user.email,
              role: user.role,
              token: token,
              has_profile: user.has_profile,
              fullname: user.fullname
            })
          } else {
            res.status(401).json({ error: 'Invalid login' })
          }
        } else {
          res.status(500).json({ error: err })
        }
      })
    } else {
      res.status(401).json({ error: 'Invalid login' })
    }
  } catch (error) {
    res.status(500).json({ error: error })
  }
});
// CLIENT SEARCH ALL JOBSEEKERS
userRouter.get("/jobseeker",auth,async(req,res)=>{
    try{
        const sql = "SELECT * FROM users WHERE role=$1"
        const result = await query(sql,['jobseeker'])
        res.status(200).json(result.rows) 
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({error: error})
    }
})
// CLIENT SEARCH ALL JOBSEEKERS BY SERVICE
userRouter.get("/jobseeker/:service", auth, async (req, res) => {
    try {
        const service = req.params.service;
        // MASHAIR FIX - hide deactivated jobseekers
        const sql = "SELECT * FROM users WHERE role=$1 AND services=$2 AND is_paused=false"
        const result = await query(sql, ['jobseeker', service])
        res.status(200).json(result.rows)
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({ error: error })
    }
})

// REGISTER
userRouter.post("/register", async (req, res) => {
  bcrypt.hash(req.body.password, 10, async (err, hash) => {
    if (!err) {
      try {
        const sql = "insert into users (email, password, role, has_profile) values ($1,$2,$3,false) returning *"
        const result = await query(sql, [req.body.email, hash, req.body.role])
        res.status(200).json({ id: result.rows[0].id })
      } catch (error) {
        res.status(500).json({ error: error })
      }
    } else {
      res.status(500).json({ error: err })
    }
  })
});

// UPDATE PROFILE
// UPDATE PROFILE
userRouter.put("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // build dynamic update query based on what fields are sent
    const fields = [];
    const values = [];
    let counter = 1;

    if (req.body.fullname !== undefined) { fields.push(`fullname=$${counter++}`); values.push(req.body.fullname); }
    if (req.body.contact_email !== undefined) { fields.push(`contact_email=$${counter++}`); values.push(req.body.contact_email); }
    if (req.body.contact_phone !== undefined) { fields.push(`contact_phone=$${counter++}`); values.push(req.body.contact_phone); }
    if (req.body.location !== undefined) { fields.push(`location=$${counter++}`); values.push(req.body.location); }
    if (req.body.services !== undefined) { fields.push(`services=$${counter++}`); values.push(req.body.services); }
    if (req.body.about_you !== undefined) { fields.push(`about_you=$${counter++}`); values.push(req.body.about_you); }
    if (req.body.experience !== undefined) { fields.push(`experience=$${counter++}`); values.push(req.body.experience); }
    if (req.body.hourly_rate !== undefined) { fields.push(`hourly_rate=$${counter++}`); values.push(req.body.hourly_rate); }
    if (req.body.about_experience !== undefined) { fields.push(`about_experience=$${counter++}`); values.push(req.body.about_experience); }
    if (req.body.skills !== undefined) { fields.push(`skills=$${counter++}`); values.push(req.body.skills); }

    fields.push(`has_profile=true`);
    values.push(userId);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id=$${counter} RETURNING *`;
    const result = await query(sql, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// GET all jobseekers (for client inbox)
userRouter.get('/jobseekers', async (req, res) => {
  try {
    const result = await query("SELECT id, fullname, services, photo FROM users WHERE role = 'jobseeker'");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get jobseekers' });
  }
});

// GET all clients (for jobseeker inbox)
userRouter.get('/clients', async (req, res) => {
  try {
    const result = await query("SELECT id, fullname FROM users WHERE role = 'client'");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get clients' });
  }
})

userRouter.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});


// UPLOAD PHOTO
userRouter.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const photoPath = req.file.filename;
    
    const sql = "UPDATE users SET photo = $1 WHERE id = $2 RETURNING *";
    const result = await query(sql, [photoPath, userId]);
    
    res.status(200).json({ 
      message: 'Photo uploaded!', 
      photo: photoPath 
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
// PAUSE/RESUME application
userRouter.put('/pause', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'UPDATE users SET is_paused = NOT is_paused WHERE id = $1 RETURNING is_paused',
      [userId]
    );
    res.status(200).json({ is_paused: result.rows[0].is_paused });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// DELETE user
userRouter.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await query('DELETE FROM users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
// CHANGE PASSWORD
userRouter.put('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is wrong!' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ error: error });
  }

});




module.exports = { userRouter };
