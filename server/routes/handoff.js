import express from 'express'

export const handoffRouter = express.Router()

// PDF generation via Puppeteer is disabled in the sandbox environment.
// Chromium cannot run on Render's free tier. Re-enable after upgrading
// to a paid instance or switching to a headless PDF service.
handoffRouter.post('/:id/handoff', async (req, res) => {
  res.status(503).json({
    error: 'Handoff PDF generation is not available in the sandbox environment.',
  })
})
