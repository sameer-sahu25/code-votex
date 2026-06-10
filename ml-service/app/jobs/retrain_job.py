
from app.training.pipeline import TrainingPipeline


async def retrain_all_models():
    """Retrain all models."""
    print(f"Starting retraining job at {__import__('datetime').datetime.now()}")
    pipeline = TrainingPipeline()
    await pipeline.run_all()
    print("Retraining job completed")
