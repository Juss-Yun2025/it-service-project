import { Request, Response } from 'express';
import { db } from '../config/database';
import { generateInquiryNumber } from '../utils/generators';
import { GeneralInquiry, GeneralInquiryCreate, ApiResponse, SearchParams } from '../types';

export const createGeneralInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, content }: GeneralInquiryCreate = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    

      return;}

    // Get user info
    const userResult = await db.query(
      'SELECT name, department FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    const user = userResult.rows[0];
    const inquiryNumber = generateInquiryNumber();

    // Create general inquiry
    const result = await db.query<GeneralInquiry>(
      `INSERT INTO general_inquiries 
       (inquiry_number, title, content, requester_id, requester_department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [inquiryNumber, title, content, userId, user.department]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'General inquiry created successfully'
    } as ApiResponse);

  


    return;} catch (error) {
    console.error('Create general inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getGeneralInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      department,
      startDate,
      endDate,
      sortBy = 'inquiry_date',
      sortOrder = 'DESC',
      unansweredOnly = false
    } = req.query as any;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'user') {
      whereConditions.push(`requester_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'technician') {
      whereConditions.push(`(requester_id = $${paramIndex} OR answerer_id = $${paramIndex})`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'assignment_manager') {
      whereConditions.push(`(requester_id = $${paramIndex} OR answerer_id = $${paramIndex})`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'service_manager') {
      // Service manager can see inquiries from their department
      const userResult = await db.query(
        'SELECT department FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows.length > 0) {
        whereConditions.push(`requester_department = $${paramIndex}`);
        queryParams.push(userResult.rows[0].department);
        paramIndex++;
      }
    }
    // System admin can see all inquiries (no additional filtering)

    // Unanswered only filter
    if (unansweredOnly === true || unansweredOnly === 'true') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push('pending');
      paramIndex++;
    }

    // Build additional WHERE conditions
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR inquiry_number ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`requester_department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`inquiry_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`inquiry_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM general_inquiries WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get general inquiries with pagination
    const inquiriesResult = await db.query<GeneralInquiry>(
      `SELECT gi.*, 
              u1.name as requester_name,
              u2.name as answerer_name
       FROM general_inquiries gi
       LEFT JOIN users u1 ON gi.requester_id = u1.id
       LEFT JOIN users u2 ON gi.answerer_id = u2.id
       WHERE ${whereClause}
       ORDER BY gi.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: inquiriesResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      message: 'General inquiries retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get general inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getGeneralInquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let whereClause = 'gi.id = $1';
    const queryParams = [id];

    // Role-based access control
    if (userRole === 'user') {
      whereClause += ' AND gi.requester_id = $2';
      queryParams.push(userId!);
    } else if (userRole === 'technician') {
      whereClause += ' AND (gi.requester_id = $2 OR gi.answerer_id = $2)';
      queryParams.push(userId!);
    } else if (userRole === 'assignment_manager') {
      whereClause += ' AND (gi.requester_id = $2 OR gi.answerer_id = $2)';
      queryParams.push(userId!);
    } else if (userRole === 'service_manager') {
      const userResult = await db.query(
        'SELECT department FROM users WHERE id = $2',
        [userId!]
      );
      if (userResult.rows.length > 0) {
        whereClause += ' AND gi.requester_department = $3';
        queryParams.push(userResult.rows[0].department);
      }
    }

    const result = await db.query<GeneralInquiry>(
      `SELECT gi.*, 
              u1.name as requester_name,
              u2.name as answerer_name
       FROM general_inquiries gi
       LEFT JOIN users u1 ON gi.requester_id = u1.id
       LEFT JOIN users u2 ON gi.answerer_id = u2.id
       WHERE ${whereClause}`,
      queryParams
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'General inquiry not found'
      } as ApiResponse);
    

      return;}

    res.json({
      success: true,
      data: result.rows[0],
      message: 'General inquiry retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get general inquiry by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const updateGeneralInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if inquiry exists and user has permission
    const existingInquiry = await db.query<GeneralInquiry>(
      'SELECT * FROM general_inquiries WHERE id = $1',
      [id]
    );

    if (existingInquiry.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'General inquiry not found'
      } as ApiResponse);
    

      return;}

    const inquiry = existingInquiry.rows[0];

    // Only the original requester can update their inquiry (if not answered)
    if (userRole === 'user' && inquiry.requester_id !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own inquiries'
      } as ApiResponse);
    

      return;}

    // Can't update if already answered
    if (inquiry.status === 'answered' && userRole === 'user') {
      res.status(403).json({
        success: false,
        message: 'Cannot update answered inquiries'
      } as ApiResponse);
    

      return;}

    // Build update query
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      updateParams.push(title);
      paramIndex++;
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      updateParams.push(content);
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

    const updateQuery = `UPDATE general_inquiries SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query<GeneralInquiry>(updateQuery, updateParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'General inquiry updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update general inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const answerGeneralInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer_content } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only technicians and above can answer inquiries
    if (!['technician', 'assignment_manager', 'service_manager', 'system_admin'].includes(userRole!)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to answer inquiries'
      } as ApiResponse);
    

      return;}

    // Check if inquiry exists
    const existingInquiry = await db.query<GeneralInquiry>(
      'SELECT * FROM general_inquiries WHERE id = $1',
      [id]
    );

    if (existingInquiry.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'General inquiry not found'
      } as ApiResponse);
    

      return;}

    const inquiry = existingInquiry.rows[0];

    if (inquiry.status === 'answered') {
      res.status(400).json({
        success: false,
        message: 'This inquiry has already been answered'
      } as ApiResponse);
    

      return;}

    // Update inquiry with answer
    const result = await db.query<GeneralInquiry>(
      `UPDATE general_inquiries 
       SET answer_content = $1, 
           answer_date = CURRENT_TIMESTAMP,
           answerer_id = $2,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [answer_content, userId, 'answered', id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'General inquiry answered successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Answer general inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const deleteGeneralInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if inquiry exists
    const existingInquiry = await db.query<GeneralInquiry>(
      'SELECT * FROM general_inquiries WHERE id = $1',
      [id]
    );

    if (existingInquiry.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'General inquiry not found'
      } as ApiResponse);
    

      return;}

    const inquiry = existingInquiry.rows[0];

    // Permission check
    if (userRole === 'user' && inquiry.requester_id !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own inquiries'
      } as ApiResponse);
    

      return;}

    // Can't delete if already answered (unless admin)
    if (inquiry.status === 'answered' && userRole === 'user') {
      res.status(403).json({
        success: false,
        message: 'Cannot delete answered inquiries'
      } as ApiResponse);
    

      return;}

    // Delete inquiry
    await db.query(
      'DELETE FROM general_inquiries WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'General inquiry deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete general inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};
