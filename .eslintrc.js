module.exports = {
  // TypeScript 파서 사용
  parser: '@typescript-eslint/parser',
  
  // TypeScript 추천 규칙과 Prettier 호환성 규칙 적용
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  
  // JavaScript 버전 설정
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  }
}; 