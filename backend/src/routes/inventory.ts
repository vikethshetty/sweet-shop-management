import express, { Request, Response } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

router.use(authenticateToken);

router.post('/:id/purchase', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const sweetResult = await db.query(
      'SELECT * FROM sweets WHERE id = $1',
      [id]
    );

    if (sweetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    const sweet = sweetResult.rows[0];

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity' });
    }

    const updateResult = await db.query(
      'UPDATE sweets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    res.json({
      message: 'Purchase successful',
      sweet: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/restock', authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const result = await db.query(
      'UPDATE sweets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({
      message: 'Restock successful',
      sweet: result.rows[0]
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;