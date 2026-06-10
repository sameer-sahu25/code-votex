
import asyncio
from app.training.pipeline import TrainingPipeline

async def main():
    pipeline = TrainingPipeline()
    await pipeline.run_all()

if __name__ == "__main__":
    asyncio.run(main())
