import { Request, Response } from 'express';
import { db } from '../config/database';
import { FAQ, FAQCreate, ApiResponse, SearchParams } from '../types';

export const getFAQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      is_active = true,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query as any;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(question ILIKE $${paramIndex} OR answer ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      queryParams.push(is_active);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM faqs WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get FAQs with pagination
    const faqsResult = await db.query<FAQ>(
      `SELECT f.*, u.name as created_by_name
       FROM faqs f
       LEFT JOIN users u ON f.created_by = u.id
       WHERE ${whereClause}
       ORDER BY f.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: faqsResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      message: 'FAQs retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getFAQById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<FAQ>(
      `SELECT f.*, u.name as created_by_name
       FROM faqs f
       LEFT JOIN users u ON f.created_by = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'FAQ not found'
      } as ApiResponse);
    

      return;}

    const faq = result.rows[0];

    // Increment view count for public access
    if (req.user?.role === 'user') {
      await db.query(
        'UPDATE faqs SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );
    }

    res.json({
      success: true,
      data: faq,
      message: 'FAQ retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get FAQ by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { question, answer, category }: FAQCreate = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    

      return;}

    // Create FAQ
    const result = await db.query<FAQ>(
      `INSERT INTO faqs (question, answer, category, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [question, answer, category, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'FAQ created successfully'
    } as ApiResponse);

  


    return;} catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, answer, category, is_active } = req.body;

    // Check if FAQ exists
    const existingFAQ = await db.query<FAQ>(
      'SELECT * FROM faqs WHERE id = $1',
      [id]
    );

    if (existingFAQ.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'FAQ not found'
      } as ApiResponse);
    

      return;}

    // Build update query
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (question !== undefined) {
      updateFields.push(`question = $${paramIndex}`);
      updateParams.push(question);
      paramIndex++;
    }

    if (answer !== undefined) {
      updateFields.push(`answer = $${paramIndex}`);
      updateParams.push(answer);
      paramIndex++;
    }

    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      updateParams.push(category);
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
    

      return;}

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(id);

    const updateQuery = `UPDATE faqs SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query<FAQ>(updateQuery, updateParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'FAQ updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if FAQ exists
    const existingFAQ = await db.query<FAQ>(
      'SELECT * FROM faqs WHERE id = $1',
      [id]
    );

    if (existingFAQ.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'FAQ not found'
      } as ApiResponse);
    

      return;}

    // Delete FAQ
    await db.query(
      'DELETE FROM faqs WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getFAQCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL AND is_active = true ORDER BY category'
    );

    const categories = result.rows.map(row => row.category);

    res.json({
      success: true,
      data: categories,
      message: 'FAQ categories retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getPopularFAQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const result = await db.query<FAQ>(
      `SELECT * FROM faqs 
       WHERE is_active = true 
       ORDER BY view_count DESC, created_at DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Popular FAQs retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get popular FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};
