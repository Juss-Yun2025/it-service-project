import { Request, Response } from 'express';
import { db } from '../config/database';
import { ApiResponse, FAQIcon } from '../types';

export interface FAQIconCreate {
  name: string;
  file_path: string;
  label: string;
  category?: string;
  sort_order?: number;
}

// Get all active FAQ icons
export const getFAQIcons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT id, name, file_path, label, category, sort_order, is_active, created_at, updated_at
      FROM faq_icons 
      WHERE is_active = true
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY sort_order ASC, label ASC`;
    
    const result = await db.query<FAQIcon>(query, params);

    res.json({
      success: true,
      data: result.rows,
      message: 'FAQ icons retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get FAQ icons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve FAQ icons'
    } as ApiResponse);
  }
};

// Get FAQ icon categories
export const getFAQIconCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query<{category: string, count: number}>(
      `SELECT category, COUNT(*) as count
       FROM faq_icons 
       WHERE is_active = true
       GROUP BY category
       ORDER BY category ASC`
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'FAQ icon categories retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get FAQ icon categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve FAQ icon categories'
    } as ApiResponse);
  }
};

// Create new FAQ icon (admin only)
export const createFAQIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, file_path, label, category = 'general', sort_order = 0 }: FAQIconCreate = req.body;

    // Check if icon name already exists
    const existingIcon = await db.query<FAQIcon>(
      'SELECT id FROM faq_icons WHERE name = $1',
      [name]
    );

    if (existingIcon.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Icon name already exists'
      } as ApiResponse);
      return;
    }

    const result = await db.query<FAQIcon>(
      `INSERT INTO faq_icons (name, file_path, label, category, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, file_path, label, category, sort_order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'FAQ icon created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Create FAQ icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create FAQ icon'
    } as ApiResponse);
  }
};

// Update FAQ icon (admin only)
export const updateFAQIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, file_path, label, category, sort_order, is_active } = req.body;

    // Check if icon exists
    const existingIcon = await db.query<FAQIcon>(
      'SELECT * FROM faq_icons WHERE id = $1',
      [id]
    );

    if (existingIcon.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'FAQ icon not found'
      } as ApiResponse);
      return;
    }

    // Build update query
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateParams.push(name);
      paramIndex++;
    }

    if (file_path !== undefined) {
      updateFields.push(`file_path = $${paramIndex}`);
      updateParams.push(file_path);
      paramIndex++;
    }

    if (label !== undefined) {
      updateFields.push(`label = $${paramIndex}`);
      updateParams.push(label);
      paramIndex++;
    }

    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      updateParams.push(category);
      paramIndex++;
    }

    if (sort_order !== undefined) {
      updateFields.push(`sort_order = $${paramIndex}`);
      updateParams.push(sort_order);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      updateParams.push(is_active);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update'
      } as ApiResponse);
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(id);

    const updateQuery = `UPDATE faq_icons SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query<FAQIcon>(updateQuery, updateParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'FAQ icon updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update FAQ icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FAQ icon'
    } as ApiResponse);
  }
};

// Delete FAQ icon (admin only)
export const deleteFAQIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if icon exists
    const existingIcon = await db.query<FAQIcon>(
      'SELECT * FROM faq_icons WHERE id = $1',
      [id]
    );

    if (existingIcon.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'FAQ icon not found'
      } as ApiResponse);
      return;
    }

    // Soft delete - mark as inactive
    await db.query(
      'UPDATE faq_icons SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'FAQ icon deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete FAQ icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete FAQ icon'
    } as ApiResponse);
  }
};