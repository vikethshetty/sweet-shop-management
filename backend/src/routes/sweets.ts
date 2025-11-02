import express, { Request, Response } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT * FROM sweets ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || !category || !price || quantity === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.query(
      'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, category, parseFloat(price), parseInt(quantity)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    
    let query = 'SELECT * FROM sweets WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice as string));
    }

    query += ' ORDER BY name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    if (!name || !category || !price || quantity === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.query(
      'UPDATE sweets SET name = $1, category = $2, price = $3, quantity = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, category, parseFloat(price), parseInt(quantity), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM sweets WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;