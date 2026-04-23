import random
from config import (
    TAUMOEBA_UNLOCK, MIN_SAMPLES,
    BREEDING_BASE_CHANCE, BREEDING_KNOWLEDGE_SCALE,
    BREEDING_KNOWLEDGE_MAX_BONUS, BREEDING_ROCKY_BONUS,
    BREEDING_PARTIAL_RANGE
)


class TaumoebaCulture:
    # tracks Taumoeba samples and breeding experiments

    def __init__(self) -> None:
        self.__samples: int = 0
        self.__viable_strain: bool = False
        self.__breeding_log: list[dict] = []
        self.__mutation_rate: float = 0.0

    @property
    def samples(self) -> int:
        return self.__samples

    @property
    def viable_strain(self) -> bool:
        return self.__viable_strain

    @property
    def breeding_log(self) -> list[dict]:
        return self.__breeding_log

    @property
    def mutation_rate(self) -> float:
        return self.__mutation_rate

    def mutate(self) -> None:
        # placeholder hook for future per-turn drift; currently a no-op
        # so subtle background mutation could be added without touching callers
        pass

    def add_sample(self) -> None:
        self.__samples += 1
        print(f"Taumoeba sample added. Total: {self.__samples}")

    def has_enough_samples(self) -> bool:
        return self.__samples >= MIN_SAMPLES

    def attempt_breeding(self, knowledge_score: int, rocky_assisting: bool = False) -> str:
        if knowledge_score < TAUMOEBA_UNLOCK:
            print(f"Not enough knowledge to attempt breeding. "
                  f"Need {TAUMOEBA_UNLOCK}, have {knowledge_score}.")
            return "locked"

        if not self.has_enough_samples():
            print(f"Not enough samples. Need {MIN_SAMPLES}, have {self.__samples}.")
            return "no_samples"

        knowledge_bonus = min(BREEDING_KNOWLEDGE_MAX_BONUS,
                              (knowledge_score - TAUMOEBA_UNLOCK) * BREEDING_KNOWLEDGE_SCALE)
        rocky_bonus = BREEDING_ROCKY_BONUS if rocky_assisting else 0.0
        success_chance = (BREEDING_BASE_CHANCE + knowledge_bonus
                          + rocky_bonus + self.__mutation_rate)

        self.__samples -= 1
        roll = random.random()

        if roll < success_chance:
            outcome = "success"
            self.__viable_strain = True
            self.__mutation_rate = 0.0
            print(f"Breeding success! Viable strain created. "
                  f"Knowledge: {knowledge_score}")
        elif roll < success_chance + BREEDING_PARTIAL_RANGE:
            outcome = "partial"
            print(f"Partial progress. Strain not yet viable. "
                  f"Knowledge: {knowledge_score}")
        else:
            outcome = "failure"
            self.__mutation_rate = min(0.3, self.__mutation_rate + 0.05)
            print(f"Breeding failed. Strain did not survive. "
                  f"Knowledge: {knowledge_score}")

        self.__breeding_log.append({
            "outcome": outcome,
            "knowledge_at_attempt": knowledge_score,
            "rocky_assisted": rocky_assisting
        })

        return outcome

    def __str__(self) -> str:
        return (f"TaumoebaCulture | samples: {self.__samples} "
                f"| viable strain: {self.__viable_strain} "
                f"| attempts: {len(self.__breeding_log)}")
