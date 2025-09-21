import { apiClient } from './api';

// 단계-진행 매칭 캐시
let stageProgressCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 단계명으로 진행명을 가져오는 함수
export const getProgressByStage = async (stageName: string): Promise<string> => {
  // 캐시가 유효한지 확인
  const now = Date.now();
  if (stageProgressCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return stageProgressCache.get(stageName) || stageName;
  }

  try {
    // 캐시가 없거나 만료된 경우 API에서 모든 단계 정보를 가져옴
    const response = await apiClient.getStages();
    
    if (response.success && response.data) {
      // 캐시 업데이트
      stageProgressCache = new Map();
      response.data.forEach((stage: any) => {
        stageProgressCache!.set(stage.name, stage.progress_name);
      });
      cacheTimestamp = now;
      
      return stageProgressCache.get(stageName) || stageName;
    }
  } catch (error) {
    console.error('Error fetching stage progress mapping:', error);
  }

  // API 호출 실패 시 기본 매핑 사용
  return getDefaultProgressByStage(stageName);
};

// 기본 매핑 (API 호출 실패 시 사용)
const getDefaultProgressByStage = (stageName: string): string => {
  const defaultMapping: Record<string, string> = {
    '접수': '정상접수',
    '배정': '담당배정',
    '재배정': '담당배정',
    '확인': '담당배정',
    '예정': '시간조율',
    '작업': '작업진행',
    '완료': '처리완료',
    '미결': '미결처리'
  };

  return defaultMapping[stageName] || stageName;
};

// 캐시 초기화
export const clearStageProgressCache = (): void => {
  stageProgressCache = null;
  cacheTimestamp = 0;
};

// 여러 단계의 진행명을 한 번에 가져오는 함수
export const getProgressByStages = async (stageNames: string[]): Promise<Map<string, string>> => {
  const result = new Map<string, string>();
  
  // 캐시가 유효한지 확인
  const now = Date.now();
  if (stageProgressCache && (now - cacheTimestamp) < CACHE_DURATION) {
    stageNames.forEach(stageName => {
      result.set(stageName, stageProgressCache!.get(stageName) || stageName);
    });
    return result;
  }

  try {
    // API에서 모든 단계 정보를 가져옴
    const response = await apiClient.getStages();
    
    if (response.success && response.data) {
      // 캐시 업데이트
      stageProgressCache = new Map();
      response.data.forEach((stage: any) => {
        stageProgressCache!.set(stage.name, stage.progress_name);
      });
      cacheTimestamp = now;
      
      // 요청된 단계들의 진행명 반환
      stageNames.forEach(stageName => {
        result.set(stageName, stageProgressCache!.get(stageName) || stageName);
      });
    }
  } catch (error) {
    console.error('Error fetching stage progress mappings:', error);
    
    // API 호출 실패 시 기본 매핑 사용
    stageNames.forEach(stageName => {
      result.set(stageName, getDefaultProgressByStage(stageName));
    });
  }

  return result;
};
