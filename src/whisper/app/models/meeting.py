from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Meeting(BaseModel):
    id: str
    title: str
    audioUrl: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    userId: str
    createdAt: datetime
    updatedAt: datetime 