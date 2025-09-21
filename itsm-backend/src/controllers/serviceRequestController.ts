import { Request, Response } from 'express';
import db from '../config/database';

export interface ServiceRequest {
  id: number;
  request_number: string;
  title: string;
  status: string;
  current_status: string;
  request_date: string;
  request_time?: string;
  requester_id?: number;
  requester_name: string;
  requester_department: string;
  stage: string;
  assign_time?: string;
  assign_date?: string;
  assignee_id?: number;
  assignee_name?: string;
  assignee_department?: string;
  content: string;
  contact?: string;
  location?: string;
  actual_contact?: string;
  service_type: string;
  completion_date?: string;
  assignment_opinion?: string;
  previous_assign_date?: string;
  previous_assignee?: string;
  previous_assignment_opinion?: string;
  rejection_date?: string;
  rejection_opinion?: string;
  scheduled_date?: string;
  work_start_date?: string;
  work_content?: string;
  work_complete_date?: string;
  problem_issue?: string;
  is_unresolved?: boolean;
  current_work_stage?: string;
  created_at: string;
  updated_at: string;
}

// 모든 서비스 요청 조회
export const getAllServiceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      startDate, 
      endDate, 
      department, 
      showIncompleteOnly,
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT sr.id, sr.request_number, sr.title, sr.status, sr.current_status,
             sr.request_date, sr.request_time, sr.requester_id, sr.assignee_id,
             sr.assignee_name, sr.assignee_department, sr.content, sr.contact,
             sr.location, sr.actual_contact, sr.service_type, sr.completion_date,
             sr.assignment_opinion, sr.previous_assign_date, sr.previous_assignee,
             sr.previous_assignment_opinion, sr.rejection_date, sr.rejection_opinion,
             sr.scheduled_date, sr.work_start_date, sr.work_content,
             sr.work_complete_date, sr.problem_issue, sr.is_unresolved,
             sr.current_work_stage, sr.stage, sr.assign_time, sr.assign_date,
             sr.created_at, sr.updated_at,
             u1.name as requester_name,
             u1.department as requester_department
      FROM service_requests sr
      LEFT JOIN users u1 ON sr.requester_id = u1.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 0;

    // 날짜 필터
    if (startDate && endDate) {
      paramCount++;
      query += ` AND sr.request_date >= $${paramCount}`;
      queryParams.push(startDate);
      
      paramCount++;
      query += ` AND sr.request_date <= $${paramCount}`;
      queryParams.push(endDate);
    }

    // 부서 필터
    if (department && department !== '전체') {
      paramCount++;
      query += ` AND sr.assignee_department = $${paramCount}`;
      queryParams.push(department);
    }

    // 미완료 조회 필터
    if (showIncompleteOnly === 'true') {
      query += ` AND sr.stage != '완료'`;
    }

    // 정렬
    query += ` ORDER BY sr.request_date DESC`;

    // 페이지네이션
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await db.query<ServiceRequest>(query, queryParams);

    // 총 개수 조회
    let countQuery = `
      SELECT COUNT(*) as total
      FROM service_requests sr
      LEFT JOIN users u1 ON sr.requester_id = u1.id
      LEFT JOIN users u2 ON sr.assignee_id = u2.id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamCount = 0;

    if (startDate && endDate) {
      countParamCount++;
      countQuery += ` AND sr.request_date >= $${countParamCount}`;
      countParams.push(startDate);
      
      countParamCount++;
      countQuery += ` AND sr.request_date <= $${countParamCount}`;
      countParams.push(endDate);
    }

    if (department && department !== '전체') {
      countParamCount++;
      countQuery += ` AND sr.assignee_department = $${countParamCount}`;
      countParams.push(department);
    }

    if (showIncompleteOnly === 'true') {
      countQuery += ` AND sr.stage != '완료'`;
    }

    const countResult = await db.query<{total: string}>(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      error: '서비스 요청 목록을 가져오는데 실패했습니다.'
    });
  }
};

// 특정 서비스 요청 조회
export const getServiceRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query<ServiceRequest>(
      `SELECT sr.*, 
              u1.name as requester_name,
              u1.department as requester_department,
              u2.name as assignee_name,
              u2.department as assignee_department
       FROM service_requests sr
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.assignee_id = u2.id
       WHERE sr.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '서비스 요청을 찾을 수 없습니다.'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({
      success: false,
      error: '서비스 요청 정보를 가져오는데 실패했습니다.'
    });
  }
};

// 서비스 요청 생성
export const createServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      content,
      requester_id,
      requester_name,
      requester_department,
      contact,
      location,
      service_type
    } = req.body;

    // 요청 번호 생성 (SR-YYYYMMDD-XXX 형식)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 해당 날짜의 마지막 번호 조회
    const lastNumberResult = await db.query(
      'SELECT request_number FROM service_requests WHERE request_number LIKE $1 ORDER BY request_number DESC LIMIT 1',
      [`SR-${dateStr}-%`]
    );
    
    let nextNumber = 1;
    if (lastNumberResult.rows.length > 0) {
      const lastNumber = lastNumberResult.rows[0].request_number;
      const lastSeq = parseInt(lastNumber.split('-')[2]);
      nextNumber = lastSeq + 1;
    }
    
    const requestNumber = `SR-${dateStr}-${nextNumber.toString().padStart(3, '0')}`;

    const result = await db.query<ServiceRequest>(
      `INSERT INTO service_requests 
       (request_number, title, content, requester_id, requester_name, requester_department, 
        contact, location, service_type, request_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        requestNumber,
        title,
        content,
        requester_id,
        requester_name,
        requester_department,
        contact,
        location,
        service_type || '일반',
        new Date().toTimeString().slice(0, 8)
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({
      success: false,
      error: '서비스 요청 생성에 실패했습니다.'
    });
  }
};

// 서비스 요청 수정
export const updateServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 업데이트할 필드들만 동적으로 구성
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: '수정할 데이터가 없습니다.'
      });
      return;
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());
    
    paramCount++;
    values.push(id);

    const query = `
      UPDATE service_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query<ServiceRequest>(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '서비스 요청을 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    res.status(500).json({
      success: false,
      error: '서비스 요청 수정에 실패했습니다.'
    });
  }
};

// 서비스 요청 삭제
export const deleteServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM service_requests WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '서비스 요청을 찾을 수 없습니다.'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '서비스 요청이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting service request:', error);
    res.status(500).json({
      success: false,
      error: '서비스 요청 삭제에 실패했습니다.'
    });
  }
};
