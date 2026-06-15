from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RouteRequest, RouteResponse
from app.ml.routing_algo import router as path_router
from app.auth import get_current_user
from app.models import User
import random

router = APIRouter(prefix="/routes", tags=["routes"])

@router.post("/plan", response_model=RouteResponse)
def plan_route(
    request: RouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        response = path_router.plan_routes(
            start_lat=request.start_lat,
            start_lng=request.start_lng,
            end_lat=request.end_lat,
            end_lng=request.end_lng,
            preference=request.preference
        )
        
        # Award sustainability points for green routes (walking, bicycle, bus, metro, train)
        # We look at the top option fitting their preference
        is_green = False
        for option in response.options:
            if option.mode in ["walking", "bicycle", "bus", "metro", "train"]:
                is_green = True
                break
                
        if is_green and request.preference in ["eco", "balanced"]:
            # Award points randomly (between 10 and 30 points)
            points_awarded = random.randint(10, 30)
            current_user.sustainability_points += points_awarded
            db.add(current_user)
            db.commit()
            
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Route planning failed: {str(e)}"
        )
