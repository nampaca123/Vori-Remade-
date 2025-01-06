import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

// npx ts-node src/scripts/testAudioConverter.ts 명령어로 실행

const execAsync = util.promisify(exec);

const convertAndEncodeAudio = async (inputPath: string) => {
  try {
    // 1. 입력 파일 확인
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // 2. webm으로 변환
    const webmPath = inputPath.replace('.m4a', '.webm');
    const command = `ffmpeg -i "${inputPath}" \
      -c:a libopus \
      -b:a 128k \
      -vbr on \
      -compression_level 10 \
      -frame_duration 60 \
      -application audio \
      "${webmPath}"`;

    console.log('Converting to webm...');
    const { stderr } = await execAsync(command);
    if (stderr) {
      console.log('FFmpeg messages:', stderr);
    }

    // 3. base64로 인코딩
    console.log('Encoding to base64...');
    const audioData = fs.readFileSync(webmPath);
    const encodedAudio = audioData.toString('base64');

    // 4. API 요청 형식에 맞게 데이터 생성
    const requestData = {
      audioId: 221,
      audioData: encodedAudio
    };

    const jsonPath = path.join(path.dirname(inputPath), 'encoded-audio.json');
    fs.writeFileSync(jsonPath, JSON.stringify(requestData, null, 2));

    // 5. 결과 출력
    console.log('\nProcessing completed!');
    console.log('Webm file:', webmPath);
    console.log('JSON file:', jsonPath);
    console.log('Original size:', (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Encoded size:', (fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2), 'MB');
    
    // 6. Postman 사용법 안내
    console.log('\nPostman 사용 방법:');
    console.log('1. URL: POST http://localhost:3000/api/meetings/101/stream');
    console.log('2. Body: encoded-audio.json의 내용을 그대로 사용');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 테스트 실행
const testAudioProcessing = async () => {
  try {
    const inputPath = path.join(__dirname, '../test/fixtures/test-audio.m4a');
    await convertAndEncodeAudio(inputPath);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAudioProcessing(); 