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
  technician_id?: number;
  technician_name?: string;
  technician_department?: string;
  content: string;
  contact?: string;
  location?: string;
  actual_contact?: string;
  service_type: string; // This will be populated from service_types table
  completion_date?: string;
  assignment_opinion?: string;
  previous_assign_date?: string;
  previous_assignee?: string;
  previous_assignment_opinion?: string;
  rejection_date?: string;
  rejection_opinion?: string;
  rejection_name?: string;
  scheduled_date?: string;
  work_start_date?: string;
  work_content?: string;
  work_complete_date?: string;
  problem_issue?: string;
  is_unresolved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  progress_name: string;
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
      SELECT sr.id, sr.request_number, sr.title, cs.name as current_status,
             TO_CHAR(sr.request_date, 'YYYY-MM-DD') as request_date, sr.request_time, sr.requester_id, sr.assignee_id,
             sr.assignee_name, sr.assignee_department, sr.technician_id,
             sr.technician_name, sr.technician_department, sr.content, sr.contact,
             sr.location, sr.actual_contact, sr.actual_requester_name, sr.actual_requester_department,
             st.name as service_type, TO_CHAR(sr.completion_date, 'YYYY-MM-DD') as completion_date,
             sr.assignment_opinion, TO_CHAR(sr.previous_assign_date, 'YYYY-MM-DD"T"HH24:MI:SS') as previous_assign_date, sr.previous_assignee,
             sr.previous_assignment_opinion, TO_CHAR(sr.rejection_date, 'YYYY-MM-DD"T"HH24:MI:SS') as rejection_date, sr.rejection_opinion, sr.rejection_name,
             TO_CHAR(sr.scheduled_date, 'YYYY-MM-DD"T"HH24:MI') as scheduled_date, TO_CHAR(sr.work_start_date, 'YYYY-MM-DD"T"HH24:MI') as work_start_date, sr.work_content,
             TO_CHAR(sr.work_complete_date, 'YYYY-MM-DD"T"HH24:MI') as work_complete_date, sr.problem_issue, sr.is_unresolved,
             s.name as stage, sr.stage_id, sr.assign_time, TO_CHAR(sr.assign_date, 'YYYY-MM-DD"T"HH24:MI') as assign_date,
             sr.created_at, sr.updated_at,
             sr.requester_name,
             sr.requester_department
      FROM service_requests sr
      LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
      LEFT JOIN service_types st ON sr.service_type_id = st.id
      LEFT JOIN stages s ON sr.stage_id = s.id
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

    // 부서 필터 (조치담당자 부서 기준)
    if (department && department !== '전체') {
      paramCount++;
      query += ` AND sr.technician_department = $${paramCount}`;
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
      LEFT JOIN current_statuses cs ON sr.current_status_id = cs.id
      LEFT JOIN service_types st ON sr.service_type_id = st.id
      LEFT JOIN stages s ON sr.stage_id = s.id
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
      countQuery += ` AND sr.technician_department = $${countParamCount}`;
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
      `SELECT sr.id, sr.request_number, sr.title, sr.current_status_id,
              TO_CHAR(sr.request_date, 'YYYY-MM-DD') as request_date, sr.request_time, sr.requester_id, sr.assignee_id,
              sr.assignee_name, sr.assignee_department, sr.technician_id,
              sr.technician_name, sr.technician_department, sr.content, sr.contact,
              sr.location, sr.actual_contact, sr.actual_requester_name, sr.actual_requester_department,
              sr.service_type_id, TO_CHAR(sr.completion_date, 'YYYY-MM-DD') as completion_date,
              sr.assignment_opinion, TO_CHAR(sr.previous_assign_date, 'YYYY-MM-DD') as previous_assign_date, sr.previous_assignee,
              sr.previous_assignment_opinion, TO_CHAR(sr.rejection_date, 'YYYY-MM-DD') as rejection_date, sr.rejection_opinion,
              TO_CHAR(sr.scheduled_date, 'YYYY-MM-DD"T"HH24:MI') as scheduled_date, TO_CHAR(sr.work_start_date, 'YYYY-MM-DD"T"HH24:MI') as work_start_date, sr.work_content,
              TO_CHAR(sr.work_complete_date, 'YYYY-MM-DD"T"HH24:MI') as work_complete_date, sr.problem_issue, sr.is_unresolved,
              sr.stage_id, sr.assign_time, TO_CHAR(sr.assign_date, 'YYYY-MM-DD"T"HH24:MI') as assign_date,
              sr.created_at, sr.updated_at,
              u1.name as requester_name,
              u1.department as requester_department,
              u2.name as assignee_name,
              u2.department as assignee_department,
              u3.name as technician_name,
              u3.department as technician_department
       FROM service_requests sr
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.assignee_id = u2.id
       LEFT JOIN users u3 ON sr.technician_id = u3.id
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
      assignee_id,
      technician_id,
      contact,
      location,
      service_type_id
    } = req.body;

    // requester_id로 사용자 정보 조회 (생성 당시의 부서 정보 보존)
    const requesterResult = await db.query(
      'SELECT name, department FROM users WHERE id = $1',
      [requester_id]
    );

    if (requesterResult.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: '신청자를 찾을 수 없습니다.'
      });
      return;
    }

    const requester = requesterResult.rows[0];
    const requester_name = requester.name;
    const requester_department = requester.department; // 생성 당시의 부서 정보로 고정

    // assignee_id로 배정담당자 정보 조회 (선택적)
    let assignee_name = null;
    let assignee_department = null;
    if (assignee_id) {
      const assigneeResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [assignee_id]
      );
      
      if (assigneeResult.rows.length > 0) {
        const assignee = assigneeResult.rows[0];
        assignee_name = assignee.name;
        assignee_department = assignee.department;
      }
    }

    // technician_id로 조치담당자 정보 조회 (선택적)
    let technician_name = null;
    let technician_department = null;
    if (technician_id) {
      const technicianResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [technician_id]
      );
      
      if (technicianResult.rows.length > 0) {
        const technician = technicianResult.rows[0];
        technician_name = technician.name;
        technician_department = technician.department;
      }
    }

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
        assignee_id, assignee_name, assignee_department,
        technician_id, technician_name, technician_department,
        contact, location, service_type_id, request_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        requestNumber,
        title,
        content,
        requester_id,
        requester_name,
        requester_department,
        assignee_id,
        assignee_name,
        assignee_department,
        technician_id,
        technician_name,
        technician_department,
        contact,
        location,
        service_type_id,
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

    // requester_id가 변경되는 경우 사용자 정보 조회
    if (updateData.requester_id) {
      const requesterResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [updateData.requester_id]
      );

      if (requesterResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: '신청자를 찾을 수 없습니다.'
        });
        return;
      }

      const requester = requesterResult.rows[0];
      // requester_id가 변경될 때만 사용자 정보 업데이트 (부서 이동 고려)
      updateData.requester_name = requester.name;
      updateData.requester_department = requester.department;
    }

    // assignee_id가 변경되는 경우 배정담당자 정보 조회 (부서 정보는 보존)
    if (updateData.assignee_id) {
      const assigneeResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [updateData.assignee_id]
      );

      if (assigneeResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: '배정담당자를 찾을 수 없습니다.'
        });
        return;
      }

      const assignee = assigneeResult.rows[0];
      updateData.assignee_name = assignee.name;
      // assignee_department는 생성 당시의 부서 정보를 보존하므로 업데이트하지 않음
    }

    // technician_id가 변경되는 경우 조치담당자 정보 조회 (부서 정보는 보존)
    if (updateData.technician_id) {
      const technicianResult = await db.query(
        'SELECT name, department FROM users WHERE id = $1',
        [updateData.technician_id]
      );

      if (technicianResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: '조치담당자를 찾을 수 없습니다.'
        });
        return;
      }

      const technician = technicianResult.rows[0];
      updateData.technician_name = technician.name;
      // technician_department는 생성 당시의 부서 정보를 보존하므로 업데이트하지 않음
    }

    // stage 필드가 있으면 stage_id로 변환
    if (updateData.stage) {
      const stageResult = await db.query(
        'SELECT id FROM stages WHERE name = $1',
        [updateData.stage]
      );
      
      if (stageResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 단계입니다.'
        });
        return;
      }
      
      updateData.stage_id = stageResult.rows[0].id;
      delete updateData.stage; // stage 필드 제거
    }

    // service_type 필드가 있으면 service_type_id로 변환
    if (updateData.service_type) {
      const serviceTypeResult = await db.query(
        'SELECT id FROM service_types WHERE name = $1',
        [updateData.service_type]
      );
      
      if (serviceTypeResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 서비스 타입입니다.'
        });
        return;
      }
      
      updateData.service_type_id = serviceTypeResult.rows[0].id;
      delete updateData.service_type; // service_type 필드 제거
    }

    // 업데이트할 필드들만 동적으로 구성
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        
        // datetime-local 형식의 날짜 필드들을 TIMESTAMP로 변환
        if (key === 'scheduled_date' || key === 'work_start_date' || key === 'work_complete_date') {
          if (updateData[key]) {
            // datetime-local 형식 (YYYY-MM-DDTHH:MM)을 PostgreSQL TIMESTAMP 형식으로 변환
            const dateTime = new Date(updateData[key]);
            updateFields.push(`${key} = $${paramCount}`);
            values.push(dateTime.toISOString());
          } else {
            updateFields.push(`${key} = $${paramCount}`);
            values.push(null);
          }
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
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

    // assignee_opinion을 assignment_opinion으로 변환
    if (updateData.assignee_opinion !== undefined) {
      updateData.assignment_opinion = updateData.assignee_opinion;
      delete updateData.assignee_opinion;
    }

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

// 모든 단계 정보 조회
export const getAllStages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT id, name, description, color, is_active, progress_name, created_at, updated_at
      FROM stages 
      WHERE is_active = true 
      ORDER BY id
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({
      success: false,
      error: '단계 정보 조회에 실패했습니다.'
    });
  }
};

// 특정 단계 정보 조회
export const getStageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, name, description, color, is_active, progress_name, created_at, updated_at
      FROM stages 
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '단계를 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stage:', error);
    res.status(500).json({
      success: false,
      error: '단계 정보 조회에 실패했습니다.'
    });
  }
};

// 단계별 다음 단계 조회
export const getNextStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentStageId } = req.params;
    
    // 현재 단계 정보 조회
    const currentStageResult = await db.query(`
      SELECT id, name FROM stages WHERE id = $1 AND is_active = true
    `, [currentStageId]);

    if (currentStageResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '현재 단계를 찾을 수 없습니다.'
      });
      return;
    }

    // 다음 단계 조회 (id가 현재 단계보다 큰 첫 번째 활성 단계)
    const nextStageResult = await db.query(`
      SELECT id, name, description, color, progress_name
      FROM stages 
      WHERE id > $1 AND is_active = true 
      ORDER BY id 
      LIMIT 1
    `, [currentStageId]);

    if (nextStageResult.rows.length === 0) {
      res.json({
        success: true,
        data: null,
        message: '다음 단계가 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: nextStageResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching next stage:', error);
    res.status(500).json({
      success: false,
      error: '다음 단계 조회에 실패했습니다.'
    });
  }
};
