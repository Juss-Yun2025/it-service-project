import { Request, Response } from 'express';
import { db } from '../config/database';
import { generateRequestNumber, calculateAssignmentHours, calculateWorkHours } from '../utils/generators';
import { ServiceRequest, ServiceRequestCreate, ApiResponse, SearchParams } from '../types';

export const createServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, description, priority, service_type_id }: ServiceRequestCreate = req.body;

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
    const requestNumber = generateRequestNumber();

    // Create service request (생성 당시의 사용자 정보 보존)
    const result = await db.query<ServiceRequest>(
      `INSERT INTO service_requests 
       (request_number, title, description, requester_id, requester_name, requester_department, priority, service_type_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [requestNumber, title, description, userId, user.name, user.department, priority, service_type_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Service request created successfully'
    } as ApiResponse);

  


    return;} catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getServiceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      stage,
      stage_id,
      department,
      technician_department,
      priority,
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
    // System admin can see all requests (no additional filtering)

    // Build additional WHERE conditions
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR request_number ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // status 필터 제거 (status 컬럼이 제거됨)
    // if (status) {
    //   whereConditions.push(`status = $${paramIndex}`);
    //   queryParams.push(status);
    //   paramIndex++;
    // }

    if (stage) {
      whereConditions.push(`s.name = $${paramIndex}`);
      queryParams.push(stage);
      paramIndex++;
    }

    if (stage_id) {
      whereConditions.push(`sr.stage_id = $${paramIndex}`);
      queryParams.push(stage_id);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`requester_department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    if (technician_department) {
      whereConditions.push(`technician_department = $${paramIndex}`);
      queryParams.push(technician_department);
      paramIndex++;
    }

    if (priority) {
      whereConditions.push(`priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }

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

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM service_requests sr
       LEFT JOIN service_types st ON sr.service_type_id = st.id
       LEFT JOIN stages s ON sr.stage_id = s.id
       WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get service requests with pagination
    const requestsResult = await db.query<ServiceRequest>(
      `SELECT sr.*, 
              u1.name as requester_name,
              u2.name as technician_name,
              u3.name as assignment_manager_name,
              st.name as service_type,
              s.name as stage
       FROM service_requests sr
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.technician_id = u2.id
       LEFT JOIN users u3 ON sr.assignment_manager_id = u3.id
       LEFT JOIN service_types st ON sr.service_type_id = st.id
       LEFT JOIN stages s ON sr.stage_id = s.id
       WHERE ${whereClause}
       ORDER BY sr.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: requestsResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      message: 'Service requests retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getServiceRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let whereClause = 'sr.id = $1';
    const queryParams = [id];

    // Role-based access control
    if (userRole === 'user') {
      whereClause += ' AND sr.requester_id = $2';
      queryParams.push(userId!);
    } else if (userRole === 'technician') {
      whereClause += ' AND (sr.requester_id = $2 OR sr.technician_id = $2)';
      queryParams.push(userId!);
    } else if (userRole === 'assignment_manager') {
      whereClause += ' AND (sr.requester_id = $2 OR sr.technician_id = $2 OR sr.assignment_manager_id = $2)';
      queryParams.push(userId!);
    } else if (userRole === 'service_manager') {
      const userResult = await db.query(
        'SELECT department FROM users WHERE id = $2',
        [userId!]
      );
      if (userResult.rows.length > 0) {
        whereClause += ' AND sr.requester_department = $3';
        queryParams.push(userResult.rows[0].department);
      }
    }

    const result = await db.query<ServiceRequest>(
      `SELECT sr.*, 
              u1.name as requester_name,
              u2.name as technician_name,
              u3.name as assignment_manager_name,
              st.name as service_type,
              s.name as stage
       FROM service_requests sr
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.technician_id = u2.id
       LEFT JOIN users u3 ON sr.assignment_manager_id = u3.id
       LEFT JOIN service_types st ON sr.service_type_id = st.id
       LEFT JOIN stages s ON sr.stage_id = s.id
       WHERE ${whereClause}`,
      queryParams
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service request not found'
      } as ApiResponse);
    

      return;}

    const request = result.rows[0];

    // Calculate assignment and work hours
    const assignmentHours = calculateAssignmentHours(
      new Date(request.request_date),
      request.assignment_date ? new Date(request.assignment_date) : undefined
    );

    const workHours = calculateWorkHours(
      request.work_start_date ? new Date(request.work_start_date) : undefined,
      request.work_completion_date ? new Date(request.work_completion_date) : undefined
    );

    res.json({
      success: true,
      data: {
        ...request,
        assignment_hours: assignmentHours,
        work_hours: workHours
      },
      message: 'Service request retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get service request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const updateServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, stage, estimated_completion_date, work_start_date, work_completion_date, technician_id, resolution_notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if user has permission to update this request
    const existingRequest = await db.query<ServiceRequest>(
      'SELECT * FROM service_requests WHERE id = $1',
      [id]
    );

    if (existingRequest.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service request not found'
      } as ApiResponse);
    

      return;}

    const request = existingRequest.rows[0];

    // Role-based update permissions
    let canUpdate = false;
    if (userRole === 'system_admin') {
      canUpdate = true;
    } else if (userRole === 'service_manager') {
      canUpdate = true;
    } else if (userRole === 'assignment_manager') {
      canUpdate = ['접수', '배정', '재배정', '확인', '예정'].includes(stage || request.stage);
    } else if (userRole === 'technician') {
      canUpdate = request.technician_id === userId && ['작업', '완료'].includes(stage || request.stage);
    } else if (userRole === 'user') {
      canUpdate = request.requester_id === userId && ['접수'].includes(stage || request.stage);
    }

    if (!canUpdate) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update this request'
      } as ApiResponse);
    

      return;}

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      updateParams.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateParams.push(description);
      paramIndex++;
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      updateParams.push(priority);
      paramIndex++;
    }

    // status 업데이트 제거 (status 컬럼이 제거됨)
    // if (status !== undefined) {
    //   updateFields.push(`status = $${paramIndex}`);
    //   updateParams.push(status);
    //   paramIndex++;
    // }

    if (stage !== undefined) {
      // stage는 stages 테이블의 name을 참조하므로 stage_id로 변환
      const stageResult = await db.query(
        'SELECT id FROM stages WHERE name = $1',
        [stage]
      );
      if (stageResult.rows.length > 0) {
        updateFields.push(`stage_id = $${paramIndex}`);
        updateParams.push(stageResult.rows[0].id);
        paramIndex++;
      }
    }

    if (estimated_completion_date !== undefined) {
      updateFields.push(`estimated_completion_date = $${paramIndex}`);
      updateParams.push(estimated_completion_date);
      paramIndex++;
    }

    if (work_start_date !== undefined) {
      updateFields.push(`work_start_date = $${paramIndex}`);
      updateParams.push(work_start_date);
      paramIndex++;
    }

    if (work_completion_date !== undefined) {
      updateFields.push(`work_completion_date = $${paramIndex}`);
      updateParams.push(work_completion_date);
      paramIndex++;
    }

    if (technician_id !== undefined) {
      // technician_id가 변경되는 경우 조치담당자 정보 조회 (부서 정보는 보존)
      const technicianResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [technician_id]
      );

      if (technicianResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: '조치담당자를 찾을 수 없습니다.'
        } as ApiResponse);
        return;
      }

      const technician = technicianResult.rows[0];
      updateFields.push(`technician_id = $${paramIndex}`);
      updateParams.push(technician_id);
      paramIndex++;
      
      updateFields.push(`technician_name = $${paramIndex}`);
      updateParams.push(technician.name);
      paramIndex++;
      
      // technician_department는 생성 당시의 부서 정보를 보존하므로 업데이트하지 않음
    }

    if (resolution_notes !== undefined) {
      updateFields.push(`resolution_notes = $${paramIndex}`);
      updateParams.push(resolution_notes);
      paramIndex++;
    }

    // Set assignment manager if not already set
    if (stage === '배정' && !request.assignment_manager_id) {
      updateFields.push(`assignment_manager_id = $${paramIndex}`);
      updateParams.push(userId);
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

    const updateQuery = `UPDATE service_requests SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query<ServiceRequest>(updateQuery, updateParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Service request updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const assignServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { technician_id, estimated_completion_date } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only assignment managers and above can assign requests
    if (!['assignment_manager', 'service_manager', 'system_admin'].includes(userRole!)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to assign requests'
      } as ApiResponse);
    

      return;}

    // Get technician info
    const technicianResult = await db.query(
      'SELECT name, department FROM users WHERE id = $1 AND role = $2',
      [technician_id, 'technician']
    );

    if (technicianResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Technician not found'
      } as ApiResponse);
    

      return;}

    const technician = technicianResult.rows[0];

    // Get stage_id for '배정'
    const stageResult = await db.query(
      'SELECT id FROM stages WHERE name = $1',
      ['배정']
    );
    
    if (stageResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Stage not found'
      } as ApiResponse);
      return;
    }

    // Update service request (배정 당시의 부서 정보 보존)
    const result = await db.query<ServiceRequest>(
      `UPDATE service_requests 
       SET technician_id = $1, 
           technician_name = $2,
           technician_department = $3,
           assignment_manager_id = $4,
           assignment_date = CURRENT_TIMESTAMP,
           stage_id = $5,
           estimated_completion_date = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [technician_id, technician.name, technician.department, userId, stageResult.rows[0].id, estimated_completion_date, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service request not found'
      } as ApiResponse);
    

      return;}

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Service request assigned successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Assign service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

