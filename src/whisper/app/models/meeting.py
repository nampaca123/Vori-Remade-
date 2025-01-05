from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Meeting(BaseModel):
    meetingId: int
    audioId: int
    transcript: Optional[str] = None
    createdAt: datetime 