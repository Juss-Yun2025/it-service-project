const https = require('https')
const fs = require('fs')
const path = require('path')

// 피그마 API 설정 (환경변수에서 토큰 가져오기)
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || 'YOUR_FIGMA_ACCESS_TOKEN'
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || 'YOUR_FIGMA_FILE_KEY'

// 피그마 API 엔드포인트
const FIGMA_API_BASE = 'https://api.figma.com/v1'

/**
 * 피그마 API 호출 함수
 */
function callFigmaAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve(jsonData)
        } catch (error) {
          reject(new Error('JSON 파싱 오류: ' + error.message))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

/**
 * 디자인 토큰 추출 함수
 */
async function extractDesignTokens() {
  try {
    console.log('🎨 피그마에서 디자인 토큰 추출 중...')
    
    // 파일 정보 가져오기
    const fileData = await callFigmaAPI(`/files/${FIGMA_FILE_KEY}`)
    console.log('📄 파일 정보 로드 완료')
    
    // 스타일 정보 가져오기
    const stylesData = await callFigmaAPI(`/files/${FIGMA_FILE_KEY}/styles`)
    console.log('🎨 스타일 정보 로드 완료')
    
    // 디자인 토큰 추출
    const tokens = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    }
    
    // 색상 토큰 추출
    if (stylesData.meta && stylesData.meta.styles) {
      for (const [styleId, style] of Object.entries(stylesData.meta.styles)) {
        if (style.styleType === 'FILL') {
          // 색상 스타일 처리
          const styleDetails = await callFigmaAPI(`/styles/${styleId}`)
          if (styleDetails.meta && styleDetails.meta.fills) {
            styleDetails.meta.fills.forEach(fill => {
              if (fill.type === 'SOLID' && fill.color) {
                const colorName = style.name.toLowerCase().replace(/\s+/g, '-')
                const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b)
                tokens.colors[colorName] = hex
              }
            })
          }
        }
      }
    }
    
    // CSS 파일 생성
    const cssContent = generateCSS(tokens)
    const cssPath = path.join(__dirname, '..', 'lib', 'figma-tokens.css')
    
    fs.writeFileSync(cssPath, cssContent)
    console.log('✅ CSS 토큰 파일 생성 완료:', cssPath)
    
    // JSON 파일 생성
    const jsonPath = path.join(__dirname, '..', 'lib', 'figma-tokens.json')
    fs.writeFileSync(jsonPath, JSON.stringify(tokens, null, 2))
    console.log('✅ JSON 토큰 파일 생성 완료:', jsonPath)
    
  } catch (error) {
    console.error('❌ 토큰 추출 오류:', error.message)
  }
}

/**
 * RGB를 HEX로 변환
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * CSS 생성
 */
function generateCSS(tokens) {
  let css = ':root {\n'
  
  // 색상 토큰
  Object.entries(tokens.colors).forEach(([name, value]) => {
    css += `  --color-${name}: ${value};\n`
  })
  
  // 타이포그래피 토큰
  Object.entries(tokens.typography).forEach(([name, value]) => {
    css += `  --font-${name}: ${value};\n`
  })
  
  // 스페이싱 토큰
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value}px;\n`
  })
  
  css += '}\n'
  
  return css
}

// 실행
if (require.main === module) {
  extractDesignTokens()
}

module.exports = { extractDesignTokens }
