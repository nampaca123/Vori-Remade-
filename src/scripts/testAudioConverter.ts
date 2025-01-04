import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

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

    // 4. 요청 데이터 생성 및 저장
    const requestData = {
      meetingId: 'test-meeting-001',
      title: 'Test Meeting',
      userId: 'test-user',
      audioData: encodedAudio,
      timestamp: new Date().toISOString()
    };

    const jsonPath = path.join(path.dirname(inputPath), 'encoded-audio.json');
    fs.writeFileSync(jsonPath, JSON.stringify(requestData, null, 2));

    // 5. 결과 출력
    console.log('\nProcessing completed!');
    console.log('Webm file:', webmPath);
    console.log('JSON file:', jsonPath);
    console.log('Original size:', (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Webm size:', (fs.statSync(webmPath).size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Base64 length:', encodedAudio.length);
    console.log('Sample of encoded data:', encodedAudio.slice(0, 100) + '...');

    return {
      webmPath,
      jsonPath,
      requestData
    };

  } catch (error) {
    console.error('Error processing audio:', error);
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