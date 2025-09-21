const bcrypt = require('bcryptjs');

// 테스트할 해시와 비밀번호
const hash = '$2a$10$X0vKhHBR1G/8Hmbb.7dYbOu3RsW1Hs8gWAB85y.Fk7Ceh2JYzYPBG';
const password = 'system123';

console.log('Testing password comparison...');
console.log('Hash:', hash);
console.log('Password:', password);

bcrypt.compare(password, hash)
  .then(result => {
    console.log('Password comparison result:', result);
    if (result) {
      console.log('✅ Password verification SUCCESS');
    } else {
      console.log('❌ Password verification FAILED');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
