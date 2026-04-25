// JOBSEEKER APPLY FOR JOBS
const express = require('express');
const { query } = require('../helpers/db.js');
const { auth } = require("../helpers/auth.js");
const multer = require('multer');
const applyRouter = express.Router();
const upload = multer({ dest: "uploads/" });
const fs = require('fs');
const path = require('path');
applyRouter.post("/apply",auth,upload.single("cv"),async(req,res) => {
    try{
        const { job_id, applyCoverLetter} = req.body;
        const jobseeker_id = req.user.id;
        const cvPath = req.file ? req.file.path : null;
        if (!job_id) {
            return res.status(400).json({ error: "job_id is required" });
        }
        const sql = "INSERT INTO applications (job_id, jobseeker_id, cover_letter, cv) VALUES ($1, $2, $3, $4) returning *"
        const result = await query(sql,[job_id, jobseeker_id, applyCoverLetter, cvPath])
        res.status(200).json(result.rows[0]) 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET applications by user + filter status
applyRouter.get("/search", auth, async (req, res) => {
    try {
        const jobseeker_id = req.user.id;
        const { status } = req.query;

        let sql = `
            SELECT 
                a.id,
                a.status,
                a.cover_letter,
                a.cv,
                a.created_at,

                j.id as job_id,
                j.service_title,
                j.service_schedule,
                j.service_location,
                j.service_pay_rate,
                j.service_description

            FROM applications a
            JOIN jobposts j ON a.job_id = j.id
            WHERE a.jobseeker_id = $1
        `;

        const params = [jobseeker_id];

        // if filter status
        if (status && status !== "all") {
            sql += ` AND a.status = $2`;
            params.push(status);
        }

        sql += ` ORDER BY a.created_at DESC`;

        const result = await query(sql, params);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DOWNLOAD CV
applyRouter.get("/download-cv/:id", auth, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role; // jobseeker / client
        const sql = `
            SELECT a.cv, a.jobseeker_id, j.client_id
            FROM applications a
            JOIN jobposts j ON a.job_id = j.id
            WHERE a.id = $1
        `;
        const result = await query(sql, [applicationId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Not found" });
        }
        const app = result.rows[0];
        // RULE 1: jobseeker view her own CV
        if (role === "jobseeker" && app.jobseeker_id !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        // RULE 2: client view CVs on her own job
        if (role === "client" && app.client_id !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        res.download(app.cv);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
// GET APPLICANTS BY JOB POST
applyRouter.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // MASHAIR FIX - added photo, location, services to applicant data
// MASHAIR FIX - added jobseeker_id for view profile button
const sql=
      `SELECT applications.id,applications.job_id,applications.cv,applications.status,applications.jobseeker_id,users.fullname,users.experience,users.skills,users.photo,users.location,users.services
       FROM applications
       JOIN users ON applications.jobseeker_id = users.id
       WHERE applications.job_id = $1`
    const result = await query(sql,[postId]);
    res.json(result.rows);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    }
});
// CHANGES STATUS OF APPLICATION
applyRouter.put("/:id/status", async (req, res) => {
const { id } = req.params;
const { status } = req.body;

try {
    const sql=`UPDATE applications SET status = $1 WHERE id = $2 returning *`;
    const result = await query(sql,[status, id]);
    res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
module.exports = {applyRouter};