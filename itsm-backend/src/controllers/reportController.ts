import { Request, Response } from 'express';
import { db } from '../config/database';
import { calculateAssignmentHours, calculateWorkHours } from '../utils/generators';
import { ApiResponse, SearchParams } from '../types';

export const getServiceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      stage,
      department,
      startDate,
      endDate,
      sortBy = 'request_date',
      sortOrder = 'DESC'
    } = req.query as any;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'service_manager') {
      // Service manager can see requests from their department
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
    // System admin can see all requests (no additional filtering)

    // Build additional WHERE conditions
    if (search) {
      whereConditions.push(`(sr.title ILIKE $${paramIndex} OR sr.description ILIKE $${paramIndex} OR sr.request_number ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // status 필터 제거 (status 컬럼이 제거됨)
    // if (status) {
    //   whereConditions.push(`sr.status = $${paramIndex}`);
    //   queryParams.push(status);
    //   paramIndex++;
    // }

    if (stage) {
      whereConditions.push(`sr.stage = $${paramIndex}`);
      queryParams.push(stage);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`sr.requester_department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`sr.request_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`sr.request_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM service_requests sr WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get service report data with pagination
    const reportResult = await db.query(
      `SELECT sr.request_number,
              sr.title,
              cs.name as current_status,
              s.name as stage,
              sr.requester_department,
              st.name as service_type,
              TO_CHAR(sr.request_date, 'YYYY-MM-DD') as request_date,
              TO_CHAR(sr.assignment_date, 'YYYY-MM-DD') as assignment_date,
              TO_CHAR(sr.estimated_completion_date, 'YYYY-MM-DD') as estimated_completion_date,
              TO_CHAR(sr.work_start_date, 'YYYY-MM-DD') as work_start_date,
              TO_CHAR(sr.work_completion_date, 'YYYY-MM-DD') as work_completion_date,
              u1.name as requester_name,
              u2.name as technician_name,
              u2.department as technician_department,
              sc.name as category_name,
              CASE 
                WHEN sr.assignment_date IS NOT NULL THEN 
                  EXTRACT(EPOCH FROM (sr.assignment_date - sr.request_date)) / 3600
                ELSE 0 
              END as assignment_hours,
              CASE 
                WHEN sr.work_start_date IS NOT NULL AND sr.work_completion_date IS NOT NULL THEN 
                  EXTRACT(EPOCH FROM (sr.work_completion_date - sr.work_start_date)) / 3600
                ELSE 0 
              END as work_hours
       FROM service_requests sr
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.technician_id = u2.id
       LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
       LEFT JOIN stages s ON sr.stage_id = s.id
       LEFT JOIN service_types st ON sr.service_type_id = st.id
       WHERE ${whereClause}
       ORDER BY sr.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: reportResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      message: 'Service report retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get service report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getServiceStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, department } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'service_manager') {
      // Service manager can see requests from their department
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

    // Date filtering
    if (startDate) {
      whereConditions.push(`request_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`request_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`requester_department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get various statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN cs.name = '정상작동' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN cs.name = '오류발생' THEN 1 END) as assigned_requests,
        COUNT(CASE WHEN cs.name = '메시지창' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN cs.name = '부분불능' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN cs.name = '전체불능' THEN 1 END) as cancelled_requests,
        COUNT(CASE WHEN s.name = '접수' THEN 1 END) as stage_received,
        COUNT(CASE WHEN s.name = '배정' THEN 1 END) as stage_assigned,
        COUNT(CASE WHEN s.name = '재배정' THEN 1 END) as stage_reassigned,
        COUNT(CASE WHEN s.name = '확인' THEN 1 END) as stage_confirmed,
        COUNT(CASE WHEN s.name = '예정' THEN 1 END) as stage_scheduled,
        COUNT(CASE WHEN s.name = '작업' THEN 1 END) as stage_working,
        COUNT(CASE WHEN s.name = '완료' THEN 1 END) as stage_completed,
        COUNT(CASE WHEN s.name = '미결' THEN 1 END) as stage_pending,
        AVG(CASE 
          WHEN assignment_date IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (assignment_date - request_date)) / 3600
          ELSE NULL 
        END) as avg_assignment_hours,
        AVG(CASE 
          WHEN work_start_date IS NOT NULL AND work_completion_date IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (work_completion_date - work_start_date)) / 3600
          ELSE NULL 
        END) as avg_work_hours
      FROM service_requests sr
      LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
      WHERE ${whereClause}
    `, queryParams);

    // Get department statistics
    const deptResult = await db.query(`
      SELECT 
        requester_department,
        COUNT(*) as request_count,
        COUNT(CASE WHEN cs.name = '정상작동' THEN 1 END) as completed_count
      FROM service_requests 
      WHERE ${whereClause}
      GROUP BY requester_department
      ORDER BY request_count DESC
    `, queryParams);

    // Get service type statistics
    const typeResult = await db.query(`
      SELECT 
        st.name as service_type,
        COUNT(*) as request_count,
        COUNT(CASE WHEN cs.name = '정상작동' THEN 1 END) as completed_count
      FROM service_requests sr
      LEFT JOIN service_types st ON sr.service_type_id = st.id
      LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
      WHERE ${whereClause}
      GROUP BY st.name
      ORDER BY request_count DESC
    `, queryParams);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        by_department: deptResult.rows,
        by_service_type: typeResult.rows
      },
      message: 'Service statistics retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get service statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getInquiryStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, department } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'service_manager') {
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

    // Date filtering
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

    if (department) {
      whereConditions.push(`requester_department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get inquiry statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_inquiries,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_inquiries,
        COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_inquiries,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_inquiries,
        AVG(CASE 
          WHEN answer_date IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (answer_date - inquiry_date)) / 3600
          ELSE NULL 
        END) as avg_answer_hours
      FROM general_inquiries 
      WHERE ${whereClause}
    `, queryParams);

    // Get department statistics
    const deptResult = await db.query(`
      SELECT 
        requester_department,
        COUNT(*) as inquiry_count,
        COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_count
      FROM general_inquiries 
      WHERE ${whereClause}
      GROUP BY requester_department
      ORDER BY inquiry_count DESC
    `, queryParams);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        by_department: deptResult.rows
      },
      message: 'Inquiry statistics retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get inquiry statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'user') {
      whereConditions.push(`requester_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'technician') {
      whereConditions.push(`(requester_id = $${paramIndex} OR technician_id = $${paramIndex})`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'assignment_manager') {
      whereConditions.push(`(requester_id = $${paramIndex} OR technician_id = $${paramIndex} OR assignment_manager_id = $${paramIndex})`);
      queryParams.push(userId);
      paramIndex++;
    } else if (userRole === 'service_manager') {
      // Service manager can see requests from their department
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

    const whereClause = whereConditions.join(' AND ');

    // Get service request statistics
    const serviceStats = await db.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN cs.name = '정상작동' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN cs.name = '오류발생' THEN 1 END) as assigned_requests,
        COUNT(CASE WHEN cs.name = '메시지창' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN cs.name = '부분불능' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN stage = '접수' THEN 1 END) as stage_received,
        COUNT(CASE WHEN stage = '배정' THEN 1 END) as stage_assigned,
        COUNT(CASE WHEN stage = '재배정' THEN 1 END) as stage_reassigned,
        COUNT(CASE WHEN stage = '확인' THEN 1 END) as stage_confirmed,
        COUNT(CASE WHEN stage = '예정' THEN 1 END) as stage_scheduled,
        COUNT(CASE WHEN stage = '작업' THEN 1 END) as stage_working,
        COUNT(CASE WHEN stage = '완료' THEN 1 END) as stage_completed,
        COUNT(CASE WHEN stage = '미결' THEN 1 END) as stage_pending
      FROM service_requests sr
      LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
      WHERE ${whereClause}
    `, queryParams);

    // Get inquiry statistics (if user can see inquiries)
    let inquiryStats = null;
    if (['technician', 'assignment_manager', 'service_manager', 'system_admin'].includes(userRole!)) {
      const inquiryResult = await db.query(`
        SELECT 
          COUNT(*) as total_inquiries,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_inquiries,
          COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_inquiries
        FROM general_inquiries 
        WHERE ${whereClause.replace('service_requests', 'general_inquiries').replace('requester_id', 'requester_id')}
      `, queryParams);
      inquiryStats = inquiryResult.rows[0];
    }

    res.json({
      success: true,
      data: {
        service_requests: serviceStats.rows[0],
        general_inquiries: inquiryStats
      },
      message: 'Dashboard data retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};
