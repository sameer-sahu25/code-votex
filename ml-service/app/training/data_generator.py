
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os


def generate_normal_entropy_data(n=5000):
    """Generate normal entropy data."""
    entropy_scores = np.random.beta(2, 5, n) * 8  # Skewed low, peaks 2-5
    file_sizes = np.random.lognormal(10, 2, n)
    extensions = np.random.choice(['docx', 'xlsx', 'txt', 'py', 'js', 'jpg', 'png', 'db'], n)
    previous_scores = entropy_scores + np.random.normal(0, 0.3, n)
    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'entropy_score': entropy_scores,
        'file_size': file_sizes,
        'file_extension': extensions,
        'previous_score': previous_scores,
        'sampled_at': timestamps,
        'label': [0]*n
    }
    return pd.DataFrame(data)


def generate_ransomware_entropy_data(n=2000):
    """Generate ransomware entropy data with phases."""
    n_recon = int(n * 0.2)
    n_enc = int(n * 0.6)
    n_comp = n - n_recon - n_enc

    recon_scores = np.random.uniform(3.0, 5.5, n_recon)
    enc_scores = np.random.uniform(7.2, 8.0, n_enc)
    comp_scores = np.random.uniform(7.8, 8.0, n_comp)
    entropy_scores = np.concatenate([recon_scores, enc_scores, comp_scores])

    file_sizes = np.random.lognormal(10, 2, n)
    extensions = np.random.choice(['docx', 'xlsx', 'txt', 'py', 'js', 'jpg', 'png', 'db'], n)
    previous_scores = np.concatenate([
        recon_scores + np.random.normal(0, 0.3, n_recon),
        recon_scores[-1:] + np.cumsum(np.random.normal(0.5, 0.1, n_enc)),
        comp_scores
    ])

    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'entropy_score': entropy_scores,
        'file_size': file_sizes,
        'file_extension': extensions,
        'previous_score': previous_scores,
        'sampled_at': timestamps,
        'label': [1]*n
    }
    return pd.DataFrame(data)


def generate_normal_process_data(n=8000):
    """Generate normal process data."""
    archetypes = ['browser', 'ide', 'backup', 'office', 'system']
    arch_type = np.random.choice(archetypes, n)

    ops_per_minute = []
    files_opened = []
    files_read = []
    files_written = []
    files_renamed = []
    files_deleted = []
    cpu_percent = []
    memory_mb = []
    network_bytes_sent = []
    labels = []

    for arch in arch_type:
        if arch == 'browser':
            ops = np.random.gamma(2, 20)
            op = int(ops)
            ops_per_minute.append(ops)
            files_opened.append(op // 2)
            files_read.append(op // 2)
            files_written.append(op // 10)
            files_renamed.append(0)
            files_deleted.append(0)
            cpu_percent.append(np.random.uniform(10, 50))
            memory_mb.append(np.random.uniform(100, 1000))
            network_bytes_sent.append(np.random.randint(1000, 100000))
        elif arch == 'ide':
            ops = np.random.gamma(3, 30)
            op = int(ops)
            ops_per_minute.append(ops)
            files_opened.append(op // 2)
            files_read.append(op // 3)
            files_written.append(op // 3)
            files_renamed.append(np.random.randint(0, 3))
            files_deleted.append(np.random.randint(0, 2))
            cpu_percent.append(np.random.uniform(20, 60))
            memory_mb.append(np.random.uniform(500, 3000))
            network_bytes_sent.append(np.random.randint(0, 50000))
        elif arch == 'backup':
            ops = np.random.gamma(1.5, 40)
            op = int(ops)
            ops_per_minute.append(ops)
            files_opened.append(op)
            files_read.append(op)
            files_written.append(0)
            files_renamed.append(0)
            files_deleted.append(0)
            cpu_percent.append(np.random.uniform(5, 30))
            memory_mb.append(np.random.uniform(200, 1500))
            network_bytes_sent.append(np.random.randint(100000, 1000000))
        elif arch == 'office':
            ops = np.random.gamma(2, 15)
            op = int(ops)
            ops_per_minute.append(ops)
            files_opened.append(op)
            files_read.append(op // 2)
            files_written.append(op // 2)
            files_renamed.append(np.random.randint(0, 2))
            files_deleted.append(0)
            cpu_percent.append(np.random.uniform(10, 40))
            memory_mb.append(np.random.uniform(100, 800))
            network_bytes_sent.append(np.random.randint(0, 20000))
        else:  # system
            ops = np.random.gamma(1, 10)
            op = int(ops)
            ops_per_minute.append(ops)
            files_opened.append(op)
            files_read.append(op // 2)
            files_written.append(op // 2)
            files_renamed.append(0)
            files_deleted.append(0)
            cpu_percent.append(np.random.uniform(1, 20))
            memory_mb.append(np.random.uniform(50, 500))
            network_bytes_sent.append(np.random.randint(0, 10000))
        labels.append('normal')

    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'ops_per_minute': ops_per_minute,
        'files_opened': files_opened,
        'files_read': files_read,
        'files_written': files_written,
        'files_renamed': files_renamed,
        'files_deleted': files_deleted,
        'cpu_percent': cpu_percent,
        'memory_mb': memory_mb,
        'network_bytes_sent': network_bytes_sent,
        'label': labels,
        'observed_at': timestamps
    }
    return pd.DataFrame(data)


def generate_ransomware_process_data(n=1500):
    """Generate ransomware process data."""
    archetypes = ['wannacry', 'lockbit', 'revil', 'ryuk']
    arch_type = np.random.choice(archetypes, n)

    ops_per_minute = []
    files_opened = []
    files_read = []
    files_written = []
    files_renamed = []
    files_deleted = []
    cpu_percent = []
    memory_mb = []
    network_bytes_sent = []
    labels = []

    for arch in arch_type:
        if arch == 'wannacry':
            ops = np.random.uniform(300, 1000)
            ops_per_minute.append(ops)
            files_opened.append(int(ops))
            files_read.append(int(ops * 0.3))
            files_written.append(int(ops * 0.4))
            files_renamed.append(np.random.randint(50, 500))
            files_deleted.append(np.random.randint(10, 100))
            cpu_percent.append(np.random.uniform(40, 80))
            memory_mb.append(np.random.uniform(500, 2000))
            network_bytes_sent.append(np.random.randint(50000, 500000))
        elif arch == 'lockbit':
            ops = np.random.uniform(500, 2000)
            ops_per_minute.append(ops)
            files_opened.append(int(ops))
            files_read.append(int(ops * 0.2))
            files_written.append(int(ops * 0.5))
            files_renamed.append(np.random.randint(100, 500))
            files_deleted.append(np.random.randint(50, 200))
            cpu_percent.append(np.random.uniform(60, 95))
            memory_mb.append(np.random.uniform(1000, 4000))
            network_bytes_sent.append(np.random.randint(100000, 2000000))
        elif arch == 'revil':
            ops = np.random.uniform(400, 1500)
            ops_per_minute.append(ops)
            files_opened.append(int(ops))
            files_read.append(int(ops * 0.25))
            files_written.append(int(ops * 0.45))
            files_renamed.append(np.random.randint(80, 400))
            files_deleted.append(np.random.randint(30, 150))
            cpu_percent.append(np.random.uniform(70, 100))
            memory_mb.append(np.random.uniform(800, 3500))
            network_bytes_sent.append(np.random.randint(200000, 3000000))
        else:  # ryuk
            ops = np.random.uniform(100, 600)
            ops_per_minute.append(ops)
            files_opened.append(int(ops))
            files_read.append(int(ops * 0.35))
            files_written.append(int(ops * 0.35))
            files_renamed.append(np.random.randint(30, 150))
            files_deleted.append(np.random.randint(10, 50))
            cpu_percent.append(np.random.uniform(30, 60))
            memory_mb.append(np.random.uniform(300, 1500))
            network_bytes_sent.append(np.random.randint(30000, 300000))
        labels.append('ransomware')

    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'ops_per_minute': ops_per_minute,
        'files_opened': files_opened,
        'files_read': files_read,
        'files_written': files_written,
        'files_renamed': files_renamed,
        'files_deleted': files_deleted,
        'cpu_percent': cpu_percent,
        'memory_mb': memory_mb,
        'network_bytes_sent': network_bytes_sent,
        'label': labels,
        'observed_at': timestamps
    }
    return pd.DataFrame(data)


def generate_cryptominer_data(n=500):
    """Generate cryptominer process data."""
    ops_per_minute = np.random.uniform(1, 20, n)
    files_opened = np.random.randint(0, 5, n)
    files_read = np.random.randint(0, 3, n)
    files_written = np.random.randint(0, 2, n)
    files_renamed = [0]*n
    files_deleted = [0]*n
    cpu_percent = np.random.uniform(80, 100, n)
    memory_mb = np.random.uniform(200, 1500, n)
    network_bytes_sent = np.random.randint(1000, 50000, n)
    labels = ['cryptominer']*n

    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'ops_per_minute': ops_per_minute,
        'files_opened': files_opened,
        'files_read': files_read,
        'files_written': files_written,
        'files_renamed': files_renamed,
        'files_deleted': files_deleted,
        'cpu_percent': cpu_percent,
        'memory_mb': memory_mb,
        'network_bytes_sent': network_bytes_sent,
        'label': labels,
        'observed_at': timestamps
    }
    return pd.DataFrame(data)


def generate_exfiltration_data(n=500):
    """Generate exfiltration process data."""
    ops_per_minute = np.random.uniform(20, 100, n)
    files_opened = np.random.randint(5, 50, n)
    files_read = np.random.randint(5, 50, n)
    files_written = [0]*n
    files_renamed = [0]*n
    files_deleted = [0]*n
    cpu_percent = np.random.uniform(10, 40, n)
    memory_mb = np.random.uniform(100, 800, n)
    network_bytes_sent = np.random.randint(500000, 10000000, n)
    labels = ['exfiltration']*n

    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 7)) for _ in range(n)]

    data = {
        'ops_per_minute': ops_per_minute,
        'files_opened': files_opened,
        'files_read': files_read,
        'files_written': files_written,
        'files_renamed': files_renamed,
        'files_deleted': files_deleted,
        'cpu_percent': cpu_percent,
        'memory_mb': memory_mb,
        'network_bytes_sent': network_bytes_sent,
        'label': labels,
        'observed_at': timestamps
    }
    return pd.DataFrame(data)


def generate_canary_sequences(n_normal=500, n_attack=300):
    """Generate canary access sequences."""
    import random
    states = ['idle', 'read', 'write', 'rename', 'delete', 'encrypt']
    normal_sequences = []
    attack_sequences = []

    for _ in range(n_normal):
        seq_len = np.random.randint(5, 15)
        seq = ['idle']*seq_len
        read_positions = np.random.choice(seq_len, np.random.randint(1, 3), replace=False)
        for pos in read_positions:
            seq[pos] = 'read'
        normal_sequences.append(seq)

    attack_patterns = [
        ['read', 'write', 'rename', 'delete', 'rename', 'rename', 'encrypt', 'delete'],
        ['read', 'read', 'encrypt', 'rename', 'rename', 'delete', 'delete'],
        ['write', 'rename', 'rename', 'rename', 'encrypt', 'delete'],
        ['read', 'write', 'write', 'rename', 'encrypt']
    ]

    for _ in range(n_attack):
        pattern = random.choice(attack_patterns)
        attack_sequences.append(list(pattern))

    return normal_sequences, attack_sequences


def generate_threat_score_training_data(n=10000):
    """Generate threat score training data."""
    data = []
    for _ in range(n):
        case = np.random.choice(['all_zeros', 'canary_only', 'entropy_only', 'all_signals', 'mixed'], p=[0.2, 0.1, 0.2, 0.1, 0.4])
        if case == 'all_zeros':
            rule_score = 0
            canary_count = 0
            entropy_anomaly = 0
            max_entropy = 3
            avg_entropy = 2.5
            suspicious_process = 0
            max_ops = 10
            renamed = 0
            deleted = 0
            network = 100
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            baseline_dev = 0.1
            historical_avg = 5
            time_since = 1440
            score = 0
        elif case == 'canary_only':
            rule_score = 80
            canary_count = np.random.randint(1, 3)
            entropy_anomaly = 0
            max_entropy = 3
            avg_entropy = 2.5
            suspicious_process = 0
            max_ops = 10
            renamed = 0
            deleted = 0
            network = 100
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            baseline_dev = 0.2
            historical_avg = 5
            time_since = 5
            score = 85 + np.random.randint(0, 15)
        elif case == 'entropy_only':
            rule_score = 50
            canary_count = 0
            entropy_anomaly = np.random.randint(1, 5)
            max_entropy = 7.5
            avg_entropy = 6
            suspicious_process = 0
            max_ops = 50
            renamed = 0
            deleted = 0
            network = 500
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            baseline_dev = 0.3
            historical_avg = 10
            time_since = 60
            score = 40 + np.random.randint(0, 20)
        elif case == 'all_signals':
            rule_score = 90
            canary_count = np.random.randint(1, 5)
            entropy_anomaly = np.random.randint(3, 10)
            max_entropy = 7.8
            avg_entropy = 7
            suspicious_process = np.random.randint(1, 3)
            max_ops = 800
            renamed = 100
            deleted = 50
            network = 100000
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            baseline_dev = 0.8
            historical_avg = 15
            time_since = 1
            score = 90 + np.random.randint(0, 10)
        else:
            rule_score = np.random.randint(0, 100)
            canary_count = np.random.randint(0, 3)
            entropy_anomaly = np.random.randint(0, 5)
            max_entropy = np.random.uniform(3, 8)
            avg_entropy = max_entropy - np.random.uniform(0, 2)
            suspicious_process = np.random.randint(0, 3)
            max_ops = np.random.randint(10, 1000)
            renamed = np.random.randint(0, 100)
            deleted = np.random.randint(0, 50)
            network = np.random.randint(100, 500000)
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            baseline_dev = np.random.uniform(0.1, 0.9)
            historical_avg = np.random.randint(0, 50)
            time_since = np.random.randint(1, 1440)
            score = rule_score
        data.append({
            'rule_based_score': rule_score,
            'canary_alert_count': canary_count,
            'entropy_anomaly_count': entropy_anomaly,
            'max_entropy_score': max_entropy,
            'avg_entropy_score': avg_entropy,
            'suspicious_process_count': suspicious_process,
            'max_ops_per_minute': max_ops,
            'files_renamed_total': renamed,
            'files_deleted_total': deleted,
            'network_bytes_sent_total': network,
            'hour_of_day': hour,
            'day_of_week': day,
            'agent_baseline_deviation': baseline_dev,
            'historical_avg_score_7d': historical_avg,
            'time_since_last_alert_minutes': time_since,
            'score': score
        })
    return pd.DataFrame(data)


def generate_entropy_training_data():
    from app.features.entropy_features import build_entropy_features
    df_normal = generate_normal_entropy_data()
    df_ransom = generate_ransomware_entropy_data()
    df_combined = pd.concat([df_normal, df_ransom]).sample(frac=1).reset_index(drop=True)
    X = []
    y = []
    for _, row in df_combined.iterrows():
        features = build_entropy_features({
            'entropy_score': row['entropy_score'],
            'previous_score': row['previous_score'],
            'file_size': row['file_size'],
            'file_extension': row['file_extension'],
            'sampled_at': row['sampled_at'],
            'agent_id': 'training'
        })
        X.append(features)
        y.append(row['label'])
    return np.array(X), np.array(y)


def generate_process_training_data():
    from app.features.process_features import build_process_features
    df_normal = generate_normal_process_data()
    df_ransom = generate_ransomware_process_data()
    df_crypto = generate_cryptominer_data()
    df_exfil = generate_exfiltration_data()
    df_combined = pd.concat([df_normal, df_ransom, df_crypto, df_exfil]).sample(frac=1).reset_index(drop=True)
    X = []
    y = []
    for _, row in df_combined.iterrows():
        features = build_process_features({
            'ops_per_minute': row['ops_per_minute'],
            'files_opened': row['files_opened'],
            'files_read': row['files_read'],
            'files_written': row['files_written'],
            'files_renamed': row['files_renamed'],
            'files_deleted': row['files_deleted'],
            'cpu_percent': row['cpu_percent'],
            'memory_mb': row['memory_mb'],
            'network_bytes_sent': row['network_bytes_sent'],
            'observed_at': row['observed_at'],
            'process_name': 'unknown'
        })
        X.append(features)
        y.append(row['label'])
    return np.array(X), np.array(y)


def generate_threat_training_data():
    from app.features.threat_features import build_threat_features
    df = generate_threat_score_training_data()
    X = []
    y = []
    for _, row in df.iterrows():
        features = build_threat_features(row.to_dict())
        X.append(features)
        y.append(row['score'])
    return np.array(X), np.array(y)
