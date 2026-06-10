
import pytest
import os
import tempfile
import shutil


@pytest.fixture
def temp_model_dir():
    temp_dir = tempfile.mkdtemp()
    original_saved_models = os.getenv("SAVED_MODELS_DIR", None)
    os.environ["SAVED_MODELS_DIR"] = temp_dir
    yield temp_dir
    if original_saved_models:
        os.environ["SAVED_MODELS_DIR"] = original_saved_models
    else:
        del os.environ["SAVED_MODELS_DIR"]
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def sample_entropy_features():
    import numpy as np
    return np.array([
        4.2,  # entropy_score
        0.525,  # entropy_normalized
        0.2,  # score_delta
        0.2,  # score_delta_abs
        1.0,  # delta_direction
        5.0,  # file_size_log
        1.0,  # is_document
        0.0,  # is_image
        0.0,  # is_database
        0.0,  # is_unknown_ext
        14.0,  # hour_of_day
        1.0,  # is_business_hours
        4.2,  # rolling_avg_3
        0.1,  # rolling_std_3
        4.2,  # rolling_max_5
        0.0,  # score_vs_rolling_avg
        0.0,  # consecutive_high_count
    ], dtype=np.float32)


@pytest.fixture
def sample_anomaly_entropy_features():
    import numpy as np
    return np.array([
        7.8,  # entropy_score
        0.975,  # entropy_normalized
        3.0,  # score_delta
        3.0,  # score_delta_abs
        1.0,  # delta_direction
        5.0,  # file_size_log
        1.0,  # is_document
        0.0,  # is_image
        0.0,  # is_database
        0.0,  # is_unknown_ext
        2.0,  # hour_of_day
        0.0,  # is_business_hours
        4.8,  # rolling_avg_3
        1.2,  # rolling_std_3
        7.8,  # rolling_max_5
        3.0,  # score_vs_rolling_avg
        2.0,  # consecutive_high_count
    ], dtype=np.float32)


@pytest.fixture
def sample_process_features():
    import numpy as np
    return np.array([
        50.0,  # ops_per_minute
        3.9318256327192985,  # ops_per_minute_log
        20,  # files_opened
        15,  # files_read
        5,  # files_written
        0,  # files_renamed
        0,  # files_deleted
        0.0,  # rename_ratio
        0.0,  # delete_ratio
        0.25,  # write_ratio
        3.0,  # read_write_ratio
        30.0,  # cpu_percent
        6.214608098422191,  # memory_mb_log
        5.303304917791153,  # network_bytes_sent_log
        1.0,  # has_network_activity
        0.0,  # is_system_process
        0.0,  # is_known_ransomware_name
        2.302585093,  # name_entropy
        0.0,  # is_hidden_process
        14.0,  # hour_of_day
        1.0,  # is_business_hours
        1.6666666666666667,  # ops_cpu_ratio
        0.2,  # io_intensity
    ], dtype=np.float32)


@pytest.fixture
def sample_ransomware_process_features():
    import numpy as np
    return np.array([
        800.0,  # ops_per_minute
        6.684612416553087,  # ops_per_minute_log
        300,  # files_opened
        100,  # files_read
        100,  # files_written
        80,  # files_renamed
        20,  # files_deleted
        0.26666666666666666,  # rename_ratio
        0.06666666666666667,  # delete_ratio
        0.3333333333333333,  # write_ratio
        1.0,  # read_write_ratio
        70.0,  # cpu_percent
        7.600902459535252,  # memory_mb_log
        10.596634734,  # network_bytes_sent_log
        1.0,  # has_network_activity
        0.0,  # is_system_process
        1.0,  # is_known_ransomware_name
        1.897119985,  # name_entropy
        0.0,  # is_hidden_process
        3.0,  # hour_of_day
        0.0,  # is_business_hours
        11.428571428571429,  # ops_cpu_ratio
        1.0,  # io_intensity
    ], dtype=np.float32)


@pytest.fixture
def sample_cryptominer_process_features():
    import numpy as np
    return np.array([
        10.0,  # ops_per_minute
        2.3978952727983707,  # ops_per_minute_log
        2,  # files_opened
        1,  # files_read
        1,  # files_written
        0,  # files_renamed
        0,  # files_deleted
        0.0,  # rename_ratio
        0.0,  # delete_ratio
        0.5,  # write_ratio
        1.0,  # read_write_ratio
        95.0,  # cpu_percent
        6.907755278982137,  # memory_mb_log
        0.0,  # network_bytes_sent_log
        0.0,  # has_network_activity
        0.0,  # is_system_process
        0.0,  # is_known_ransomware_name
        1.791759469,  # name_entropy
        0.0,  # is_hidden_process
        10.0,  # hour_of_day
        0.0,  # is_business_hours
        0.10526315789473684,  # ops_cpu_ratio
        0.2,  # io_intensity
    ], dtype=np.float32)
