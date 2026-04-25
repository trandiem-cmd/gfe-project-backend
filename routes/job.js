const express = require('express');
const { query } = require('../helpers/db.js');
const { auth } = require("../helpers/auth.js");
const jobRouter = express.Router();

// CLIENT POSTS A JOB 
jobRouter.post("/post",auth,async(req,res) => {
    try{
        const client_id = req.user.id;
        const sql = "insert into jobposts (client_id, service_type, service_title, service_description, service_schedule, service_frequency, service_location, service_pay_rate) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *"
        const result = await query(sql,[client_id, req.body.service_type, req.body.service_title, req.body.service_description, req.body.service_schedule, req.body.service_frequency, req.body.service_location,req.body.service_pay_rate])
        res.status(200).json(result.rows[0]) 
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({error: error})
    }
})

// CLIENT GET MY JOB'S POSTS
jobRouter.get("/dashboard",auth,async(req,res)=>{
    try{
        const client_id = req.user.id;
        const sql = "SELECT * FROM jobposts WHERE client_id = $1"
        const result = await query(sql,[client_id])
        res.status(200).json(result.rows) 
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({error: error})
    }
})

// JOBSEEKER SEARCH ALL JOBS
jobRouter.get("/search",auth,async(req,res)=>{
    try{
        const sql = "SELECT * FROM jobposts WHERE is_paused = false"
        const result = await query(sql,[])
        res.status(200).json(result.rows) 
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({error: error})
    }
})
// JOBSEEKER SEARCH JOBS BY SERVICE
jobRouter.get("/search/:service",auth,async(req,res)=>{
    try{
        const service = req.params.service;
        const sql = "SELECT * FROM jobposts WHERE service_type = $1 AND is_paused = false"
        const result = await query(sql,[service])
        res.status(200).json(result.rows) 
    } catch (error) {
        res.statusMessage = error
        res.status(500).json({error: error})
    }
})
// CLIENT UPDATE A JOB POST
jobRouter.put("/:id", auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const client_id = req.user.id;

        const sql = `
            UPDATE jobposts
            SET
                service_type = $1,
                service_title = $2,
                service_description = $3,
                service_schedule = $4,
                service_frequency = $5,
                service_location = $6,
                service_pay_rate = $7
            WHERE id = $8 AND client_id = $9
            RETURNING *
        `;

        const values = [
            req.body.service_type,
            req.body.service_title,
            req.body.service_description,
            req.body.service_schedule,
            req.body.service_frequency,
            req.body.service_location,
            req.body.service_pay_rate,
            jobId,
            client_id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found or not yours" });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Client pause/unpause job post
jobRouter.put("/pause/:id", auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const client_id = req.user.id;
        const sql = `UPDATE jobposts SET is_paused = NOT is_paused WHERE id = $1 AND client_id = $2 RETURNING *`;
        const result = await query(sql, [jobId, client_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found or not yours" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CLIENT DELETE A JOB POST
jobRouter.delete("/:id", auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const client_id = req.user.id;

        const sql = `
            DELETE FROM jobposts
            WHERE id = $1 AND client_id = $2
            RETURNING *
        `;

        const result = await query(sql, [jobId, client_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found or not yours" });
        }

        res.status(200).json({ message: "Job deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = {jobRouter};