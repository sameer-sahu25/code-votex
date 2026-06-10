
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score
)


def classification_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray = None) -> Dict:
    """Calculate classification performance metrics."""
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_true, y_pred, average="macro", zero_division=0)
    }
    if y_prob is not None:
        if len(y_prob.shape) > 1 and y_prob.shape[1] > 1:
            metrics["roc_auc_ovr"] = roc_auc_score(y_true, y_prob, multi_class="ovr")
        else:
            metrics["roc_auc"] = roc_auc_score(y_true, y_prob)
    return metrics


def regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
    """Calculate regression performance metrics."""
    return {
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "mae": mean_absolute_error(y_true, y_pred),
        "r2": r2_score(y_true, y_pred)
    }

