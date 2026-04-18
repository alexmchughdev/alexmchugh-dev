import random

# knowledge threshold before breeding attempts are unlocked
TAUMOEBA_UNLOCK = 20

# how many samples needed before breeding can begin
MIN_SAMPLES = 3


class TaumoebaCulture:
    # tracks Taumoeba samples and breeding experiments

    def __init__(self) -> None:
        self.__samples: int = 0
        self.__viable_strain: bool = False
        self.__breeding_log: list[dict] = []

    @property
    def samples(self) -> int:
        return self.__samples

    @property
    def viable_strain(self) -> bool:
        return self.__viable_strain

    @property
    def breeding_log(self) -> list[dict]:
        return self.__breeding_log

    def add_sample(self) -> None:
        # collect a Taumoeba sample from an Adrian cell
        self.__samples += 1
        print(f"Taumoeba sample added. Total: {self.__samples}")

    def has_enough_samples(self) -> bool:
        return self.__samples >= MIN_SAMPLES

    def attempt_breeding(self, knowledge_score: int, rocky_assisting: bool = False) -> str:
        # try to breed a strain that survives in a nitrogen-rich atmosphere
        if knowledge_score < TAUMOEBA_UNLOCK:
            print(f"Not enough knowledge to attempt breeding. "
                  f"Need {TAUMOEBA_UNLOCK}, have {knowledge_score}.")
            return "locked"

        if not self.has_enough_samples():
            print(f"Not enough samples. Need {MIN_SAMPLES}, have {self.__samples}.")
            return "no_samples"

        # success chance improves with knowledge and Rocky's help
        base_chance = 0.2
        knowledge_bonus = min(0.4, (knowledge_score - TAUMOEBA_UNLOCK) * 0.01)
        rocky_bonus = 0.1 if rocky_assisting else 0.0
        success_chance = base_chance + knowledge_bonus + rocky_bonus

        self.__samples -= 1  # one sample consumed per attempt
        roll = random.random()

        if roll < success_chance:
            outcome = "success"
            self.__viable_strain = True
            print(f"Breeding success! Viable strain created. "
                  f"Knowledge: {knowledge_score}")
        elif roll < success_chance + 0.3:
            outcome = "partial"
            print(f"Partial progress. Strain not yet viable. "
                  f"Knowledge: {knowledge_score}")
        else:
            outcome = "failure"
            print(f"Breeding failed. Strain did not survive. "
                  f"Knowledge: {knowledge_score}")

        # log everything including failures
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