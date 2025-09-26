import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 단계 조회
export const getStages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT id, name, description, created_at, updated_at
      FROM stages
      ORDER BY id ASC
    `);

    // 단계별 활성화 필드 매핑 (설정 가능)
    const stageFieldMapping: {[key: string]: string[]} = {
      '확인': ['scheduledDate'],
      '예정': ['workStartDate'],
      '작업': ['workContent', 'workCompleteDate'],
      '완료': ['problemIssue', 'isUnresolved']
    };

    // 단계별 필수 필드 매핑 (설정 가능)
    const stageRequiredFields: {[key: string]: string[]} = {
      '확인': ['scheduledDate'],
      '예정': ['workStartDate'],
      '작업': ['workContent', 'workCompleteDate'],
      '완료': ['problemIssue']
    };

    // 단계별 진행 메시지 매핑 (설정 가능)
    const stageMessages: {[key: string]: string} = {
      '확인': '작업 예정 조율 단계가 진행 되었습니다. 다음 단계로 진행....',
      '예정': '작업 시작 단계가 진행 되었습니다. 다음 단계로 진행....',
      '작업': '작업 단계가 완료 되었습니다. 미결 사항이 있다면 다음 단계로 진행....',
      '완료': '미결 단계로 처리 되었습니다....'
    };

    // 단계별 아이콘 매핑 (설정 가능)
    const stageIcons: {[key: string]: {icon: string, iconColor: string}} = {
      '접수': { icon: 'user', iconColor: 'text-blue-600' },
      '배정': { icon: 'check', iconColor: 'text-green-600' },
      '재배정': { icon: 'refresh-cw', iconColor: 'text-orange-600' },
      '확인': { icon: 'eye', iconColor: 'text-purple-600' },
      '예정': { icon: 'calendar', iconColor: 'text-indigo-600' },
      '작업': { icon: 'settings', iconColor: 'text-yellow-600' },
      '완료': { icon: 'check-circle', iconColor: 'text-green-600' },
      '미결': { icon: 'x-circle', iconColor: 'text-red-600' }
    };

    // 단계별 버튼 매핑 (설정 가능)
    const stageButtons: {[key: string]: string[]} = {
      '배정': ['assignmentCancel'],
      '확인': ['edit', 'delete'],
      '예정': ['edit', 'delete'],
      '작업': ['edit', 'delete'],
      '완료': ['edit', 'delete'],
      '미결': ['edit', 'delete']
    };

    // 단계별 색상 매핑 (설정 가능)
    const stageColors: {[key: string]: string} = {
      '접수': 'bg-purple-100 text-purple-800',
      '배정': 'bg-blue-100 text-blue-800',
      '확인': 'bg-green-100 text-green-800',
      '예정': 'bg-yellow-100 text-yellow-800',
      '작업': 'bg-blue-100 text-blue-800',
      '완료': 'bg-green-100 text-green-800',
      '미결': 'bg-red-100 text-red-800',
      '재배정': 'bg-orange-100 text-orange-800'
    };

    // 단계별 통계 매핑 (설정 가능)
    const stageStatsMapping: {[key: string]: string} = {
      '배정': 'assigned',
      '작업': 'working',
      '완료': 'completed',
      '미결': 'failed'
    };

    // 각 단계에 활성화 필드, 필수 필드, 메시지, 아이콘, 버튼, 색상, 통계 매핑 정보 추가
    const stagesWithFields = result.rows.map(stage => ({
      ...stage,
      activeFields: stageFieldMapping[stage.name] || [],
      requiredFields: stageRequiredFields[stage.name] || [],
      progressMessage: stageMessages[stage.name] || '다음 단계로 진행....',
      icon: stageIcons[stage.name]?.icon || 'circle',
      iconColor: stageIcons[stage.name]?.iconColor || 'text-gray-600',
      buttons: stageButtons[stage.name] || [],
      color: stageColors[stage.name] || 'bg-gray-100 text-gray-800',
      statsKey: stageStatsMapping[stage.name] || null
    }));

    res.json({
      success: true,
      data: stagesWithFields
    });
  } catch (error) {
    console.error('단계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 특정 단계 조회
export const getStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT id, name, description, created_at, updated_at
      FROM stages
      WHERE id = $1
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
    console.error('단계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 새 단계 생성
export const createStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, sort_order } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: '단계명은 필수입니다.'
      });
      return;
    }

    const result = await db.query(`
      INSERT INTO stages (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, name, description, created_at, updated_at
    `, [name, description || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단계 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 생성 중 오류가 발생했습니다.'
    });
  }
};

// 단계 수정
export const updateStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;

    const result = await db.query(`
      UPDATE stages 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, description, created_at, updated_at
    `, [name, description, id]);

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
    console.error('단계 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 수정 중 오류가 발생했습니다.'
    });
  }
};

// 단계 삭제
export const deleteStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      DELETE FROM stages 
      WHERE id = $1
      RETURNING id, name
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
      message: '단계가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('단계 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 삭제 중 오류가 발생했습니다.'
    });
  }
};
