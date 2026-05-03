from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr = Field(description="The email address of the user")
    username: str = Field(description="The username of the user")
    full_name: Optional[str] = Field(default=None, description="The full name of the user")
    is_active: bool = Field(default=True, description="Whether the user account is active")
    is_superuser: bool = Field(default=False, description="Whether the user has superuser privileges")


class UserCreate(UserBase):
    password: str = Field(description="The plain text password for the user")


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(default=None, description="The updated email address")
    username: Optional[str] = Field(default=None, description="The updated username")
    full_name: Optional[str] = Field(default=None, description="The updated full name")
    is_active: Optional[bool] = Field(default=None, description="Updated active status")
    is_superuser: Optional[bool] = Field(default=None, description="Updated superuser status")
    password: Optional[str] = Field(default=None, description="The updated plain text password")


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserBase):
    id: UUID
    hashed_password: str = Field(description="The hashed password stored in the database")
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
