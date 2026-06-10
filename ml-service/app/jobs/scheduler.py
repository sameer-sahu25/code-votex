
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.jobs.retrain_job import retrain_all_models
from app.jobs.drift_detector import check_model_drift
from datetime import datetime

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start the background scheduler."""
    # Retrain daily at 3 AM UTC
    scheduler.add_job(
        retrain_all_models,
        trigger=CronTrigger(hour=3, minute=0),
        id='retrain_all',
        name='Daily Model Retraining',
        replace_existing=True
    )

    # Check for model drift every 6 hours
    scheduler.add_job(
        check_model_drift,
        'interval',
        hours=6,
        id='drift_check',
        name='Model Drift Detection',
        replace_existing=True
    )

    scheduler.start()
    print("Scheduler started")


def stop_scheduler():
    """Stop the background scheduler."""
    scheduler.shutdown()
    print("Scheduler stopped")
