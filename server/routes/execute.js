const express = require('express');
const router = express.Router();

const LANGUAGE_IDS = { javascript: 63, python: 71, java: 62, cpp: 54 };

router.post('/', async (req, res) => {
    const { code, language } = req.body;

    if (!code || !LANGUAGE_IDS[language]) {
        return res.status(400).json({ error: 'code and a valid language are required' });
    }

    try {
        const base = process.env.JUDGE0_URL || 'https://ce.judge0.com';
        const headers = { 'Content-Type': 'application/json' };
        if (process.env.JUDGE0_KEY) {
            headers['X-RapidAPI-Key'] = process.env.JUDGE0_KEY;
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        }

        const response = await fetch(`${base}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ source_code: code, language_id: LANGUAGE_IDS[language] }),
        });

        if (!response.ok) {
            return res.status(502).json({ error: `Judge0 returned ${response.status}` });
        }

        const data = await response.json();
        const output =
            data.stdout || data.compile_output || data.stderr || data.message ||
            data.status?.description || '(no output)';

        res.json({ output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Code execution failed' });
    }
});

module.exports = router;