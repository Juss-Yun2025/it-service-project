const WebSocket = require('ws');
const http = require('http');

const PORT = 3055;
const TOKEN = process.env.FIGMA_ACCESS_TOKEN || 'YOUR_FIGMA_ACCESS_TOKEN';

// HTTP 서버 생성
const server = http.createServer();

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

console.log('🎨 Figma MCP 서버 시작 중...');
console.log(`📡 포트: ${PORT}`);

// WebSocket 연결 처리
wss.on('connection', (ws) => {
  console.log('🔌 클라이언트 연결됨');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 받은 메시지:', data);
      
      // Figma API 호출
      if (data.type === 'figma_request') {
        const response = await callFigmaAPI(data.endpoint, data.params);
        ws.send(JSON.stringify({
          type: 'figma_response',
          data: response
        }));
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 클라이언트 연결 해제됨');
  });
});

// Figma API 호출 함수
async function callFigmaAPI(endpoint, params = {}) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: 'GET',
      headers: {
        'X-Figma-Token': TOKEN,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('JSON 파싱 오류: ' + error.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 Figma MCP 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log('💡 환경변수 FIGMA_ACCESS_TOKEN을 설정해주세요.');
});
