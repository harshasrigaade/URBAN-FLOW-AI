from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, EmergencyContactsUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email_clean = user_in.email.strip().lower()
    db_user = db.query(User).filter(User.email == email_clean).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Assign admin role to designated email, otherwise user
    role = "admin" if email_clean.startswith("admin@") else "user"
    
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        name=user_in.name,
        email=email_clean,
        hashed_password=hashed_pwd,
        role=role,
        phone=user_in.phone,
        emergency_contacts="Mom:555-0199;Dad:555-0188" # default mockup contacts
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_clean = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/contacts", response_model=UserResponse)
def update_emergency_contacts(
    contacts_in: EmergencyContactsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.emergency_contacts = contacts_in.contacts
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
