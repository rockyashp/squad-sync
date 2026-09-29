"""
GamerDNA API routes: Generate/Classify role from survey responses, and retrieve user DNA.
Clean architecture implementation returning unified ApiResponse envelopes.
"""

from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DNAServiceDep
from app.schemas.common import ApiResponse
from app.schemas.dna import (
    GamerDNACardResponse,
    GamerDNAEvaluationResponse,
    GamerDNASubmitRequest,
)

router = APIRouter()


@router.post(
    "/generate",
    response_model=ApiResponse[GamerDNAEvaluationResponse],
    status_code=status.HTTP_200_OK,
    summary="Classify and generate Gamer DNA",
    description=(
        "Executes classification against user's stored survey responses, "
        "or directly persists traits from the frontend quiz submission."
    ),
)
async def generate_gamer_dna(
    current_user: CurrentUser,
    dna_service: DNAServiceDep,
    payload: GamerDNASubmitRequest | None = None,
) -> ApiResponse[GamerDNAEvaluationResponse]:
    """Classify gamer role from survey responses or frontend quiz and persist to database."""
    if payload and (payload.leadership is not None or payload.preferred_role is not None):
        evaluation = await dna_service.create_or_update_direct(user_id=current_user.id, payload=payload)
    else:
        evaluation = await dna_service.classify_and_store(user_id=current_user.id)
    return ApiResponse.ok(
        data=evaluation,
        message="Gamer DNA classified and saved successfully.",
    )


@router.get(
    "",
    response_model=ApiResponse[GamerDNACardResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Gamer DNA Card (Root Alias)",
)
@router.get(
    "/me",
    response_model=ApiResponse[GamerDNACardResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Gamer DNA Card",
    description=(
        "Retrieves the frontend-optimized Gamer DNA Card for the authenticated user. "
        "Includes username, profile metadata, primary & secondary roles, category score breakdown, "
        "personality archetype, strengths, weaknesses, and tailored playstyle recommendations."
    ),
)
async def get_my_gamer_dna_card(
    current_user: CurrentUser,
    dna_service: DNAServiceDep,
) -> ApiResponse[GamerDNACardResponse]:
    """Retrieve complete, frontend-optimized Gamer DNA Card for current user."""
    card = await dna_service.get_gamer_dna_card(user=current_user)
    return ApiResponse.ok(
        data=card,
        message="Gamer DNA Card retrieved successfully.",
    )
