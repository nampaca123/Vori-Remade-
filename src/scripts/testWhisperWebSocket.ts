import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

// npx ts-node src/scripts/testWhisperWebSocket.ts로 실행

interface MeetingMetadata {
  audioId: number;
  groupId: number;
}

async function testWhisperWebSocket(audioPath: string, meetingId: number, metadata: MeetingMetadata) {
  const ws = new WebSocket(`ws://localhost:8000/ws/meeting/${meetingId}`);

  ws.on('open', async () => {
    console.log('WebSocket connected');

    // 메타데이터 전송
    ws.send(JSON.stringify({
      type: 'metadata',
      data: metadata
    }));
    console.log('Metadata sent');

    // 오디오 파일 읽기
    const audioData = fs.readFileSync(audioPath);
    
    // 프레임 크기 설정 (32KB - WebM 프레임에 적합)
    const chunkSize = 32768;
    
    // 오디오 데이터를 청크로 나누어 전송
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      ws.send(chunk);
      console.log(`Sent chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(audioData.length/chunkSize)}`);
      
      // 실제 오디오 스트리밍 속도에 맞춤 (100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  ws.on('message', (data: WebSocket.Data) => {
    const response = JSON.parse(data.toString());
    console.log('Received transcription:', response.text);
  });

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
}

// 테스트 실행
const testMetadata = {
  audioId: 500,
  groupId: 1
};

const meetingId = 200;
const audioPath = path.join(__dirname, '../test/fixtures/test-audio.webm');
testWhisperWebSocket(audioPath, meetingId, testMetadata); 