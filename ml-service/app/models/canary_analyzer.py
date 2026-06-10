
import numpy as np
import json
import os
from typing import List, Dict, Tuple, Optional
from collections import defaultdict, Counter


class CanaryAnalyzer:
    def __init__(self):
        self.transition_matrix_normal = None
        self.transition_matrix_attack = None
        self.states = ["idle", "read", "write", "rename", "delete", "encrypt"]
        self.known_signatures = self._load_signatures()
        self.state_to_idx = {state: i for i, state in enumerate(self.states)}
        self.idx_to_state = {i: state for i, state in enumerate(self.states)}
        self.attack_stages = [
            "reconnaissance",
            "initial_access",
            "encryption",
            "exfiltration"
        ]
        self.is_trained = False

    def _load_signatures(self) -> Dict:
        """Load known attack signatures."""
        return {
            "rename_encrypt": ["read", "rename", "write", "encrypt"],
            "delete_after_read": ["read", "delete"],
            "mass_rename": ["rename", "rename", "rename"],
            "encrypt_attempt": ["encrypt"],
            "exfiltration": ["read", "read", "read", "write"]
        }

    def train(self, normal_sequences: List[List[str]], attack_sequences: List[List[str]]) -> Dict:
        """Train Markov chain models."""
        self.transition_matrix_normal = self._build_transition_matrix(normal_sequences)
        self.transition_matrix_attack = self._build_transition_matrix(attack_sequences)
        self.is_trained = True
        return {
            "normal_sequences": len(normal_sequences),
            "attack_sequences": len(attack_sequences),
            "states": self.states
        }

    def _build_transition_matrix(self, sequences: List[List[str]]) -> np.ndarray:
        """Build Markov transition matrix from sequences."""
        n_states = len(self.states)
        matrix = np.ones((n_states, n_states))  # Laplace smoothing
        for seq in sequences:
            if len(seq) < 2:
                continue
            for i in range(len(seq) - 1):
                curr = seq[i]
                next_state = seq[i + 1]
                if curr in self.state_to_idx and next_state in self.state_to_idx:
                    i_curr = self.state_to_idx[curr]
                    i_next = self.state_to_idx[next_state]
                    matrix[i_curr][i_next] += 1
        # Normalize
        row_sums = matrix.sum(axis=1, keepdims=True)
        matrix = matrix / row_sums
        return matrix

    def analyze_sequence(self, access_sequence: List[Dict]) -> Tuple[float, float, List[str], str]:
        """Analyze a sequence of canary access events."""
        # Extract access types
        types = [event["access_type"] for event in access_sequence]
        
        llr = self._calculate_llr(types)
        matched = self._match_signatures(types)
        stage = self._determine_stage(types)
        
        attack_prob = min(1.0, max(0.0, (llr + 10) / 20))
        confidence = attack_prob if attack_prob > 0.5 else (1 - attack_prob)
        
        return attack_prob, llr, matched, stage

    def _calculate_llr(self, sequence: List[str]) -> float:
        """Calculate log-likelihood ratio between attack and normal."""
        if len(sequence) < 2 or self.transition_matrix_normal is None or self.transition_matrix_attack is None:
            return 0.0
        
        log_likelihood = 0.0
        for i in range(len(sequence) - 1):
            curr = sequence[i]
            next_state = sequence[i + 1]
            if curr not in self.state_to_idx or next_state not in self.state_to_idx:
                continue
                
            i_curr = self.state_to_idx[curr]
            i_next = self.state_to_idx[next_state]
            
            prob_attack = self.transition_matrix_attack[i_curr][i_next]
            prob_normal = self.transition_matrix_normal[i_curr][i_next]
            
            log_likelihood += np.log(prob_attack / prob_normal)
        
        return log_likelihood

    def _match_signatures(self, sequence: List[str]) -> List[str]:
        """Match sequence against known attack signatures."""
        matched = []
        for name, sig in self.known_signatures.items():
            if self._is_subsequence(sig, sequence):
                matched.append(name)
        return matched

    def _is_subsequence(self, sig: List[str], seq: List[str]) -> bool:
        """Check if signature is a subsequence."""
        it = iter(seq)
        return all(item in it for item in sig)

    def _determine_stage(self, sequence: List[str]) -> str:
        """Determine attack stage from sequence."""
        if "encrypt" in sequence:
            return "encryption"
        if sequence.count("read") > 3 and "write" in sequence:
            return "exfiltration"
        if len(sequence) <= 2 and "read" in sequence:
            return "reconnaissance"
        return "initial_access"

    def fast_check_single(self, access_event: Dict) -> Tuple[bool, str, Optional[str]]:
        """Fast single-event check using rules only."""
        access_type = access_event["access_type"]
        
        if access_type == "encrypt":
            return True, "critical", "encrypt_attempt"
        if access_type == "delete":
            return True, "medium", "delete_after_read"
        if access_type == "rename" and access_event.get("file_size_change_bytes", 0) > 10000:
            return True, "high", "mass_rename"
        
        return False, "low", None

    def save(self, base_dir: str) -> None:
        """Save model to disk."""
        os.makedirs(base_dir, exist_ok=True)
        if self.transition_matrix_normal is not None:
            np.save(os.path.join(base_dir, "transition_matrix_normal.npy"), self.transition_matrix_normal)
        if self.transition_matrix_attack is not None:
            np.save(os.path.join(base_dir, "transition_matrix_attack.npy"), self.transition_matrix_attack)
        with open(os.path.join(base_dir, "signatures.json"), "w") as f:
            json.dump(self.known_signatures, f)

    def build_markov_chains(self, normal_sequences: List[List[str]], attack_sequences: List[List[str]]) -> Dict:
        """Alias for train() for compatibility with tests."""
        return self.train(normal_sequences, attack_sequences)

    def analyze(self, input_data) -> Dict:
        """Analyze input (either list of events or list of strings) for compatibility with tests."""
        # Handle both cases: list of dicts (events) or list of strings (sequence)
        if len(input_data) > 0 and isinstance(input_data[0], dict):
            # Events with access_type
            attack_prob, llr, matched, stage = self.analyze_sequence(input_data)
            sequence = [event["access_type"] for event in input_data]
        else:
            # List of strings
            sequence = input_data
            # Create dummy events
            dummy_events = [{"access_type": s} for s in sequence]
            attack_prob, llr, matched, stage = self.analyze_sequence(dummy_events)
        
        # Build rules_fired
        rules_fired = []
        if "encrypt_attempt" in matched:
            rules_fired.append({"rule_id": "RULE_001", "name": "Encrypt Attempt"})
        if "mass_rename" in matched or sequence.count("rename") >= 3:
            rules_fired.append({"rule_id": "RULE_004", "name": "Mass Rename"})
        
        return {
            "llr": llr,
            "attack_probability": attack_prob,
            "matched_signatures": matched,
            "rules_fired": rules_fired,
            "attack_stage": stage
        }

    def load(self, base_dir: str) -> None:
        """Load model from disk."""
        normal_path = os.path.join(base_dir, "transition_matrix_normal.npy")
        attack_path = os.path.join(base_dir, "transition_matrix_attack.npy")
        sig_path = os.path.join(base_dir, "signatures.json")
        
        if os.path.exists(normal_path):
            self.transition_matrix_normal = np.load(normal_path)
        if os.path.exists(attack_path):
            self.transition_matrix_attack = np.load(attack_path)
        if os.path.exists(sig_path):
            with open(sig_path, "r") as f:
                self.known_signatures = json.load(f)
        self.is_trained = True

