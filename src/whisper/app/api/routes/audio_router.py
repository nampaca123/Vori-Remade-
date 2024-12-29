from fastapi import APIRouter, HTTPException
from app.services.audio import process_audio

router = APIRouter()

@router.post("/stream")
async def stream_audio(audio_data: bytes, meeting_id: str):
    try:
        await process_audio(audio_data, meeting_id)
        return {"message": "Audio data received"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 