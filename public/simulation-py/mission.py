from config import (
    VIOLATION_PENALTY, INITIAL_COOPERATION, RESOURCE_WASTE_THRESHOLD,
    FLASHBACKS, FLASHBACK_KNOWLEDGE_10, FLASHBACK_KNOWLEDGE_30
)


class MissionProtocol:
    # tracks protocol compliance, fires flashback events, enforces consequences

    def __init__(self) -> None:
        self.__cooperation_score: int = INITIAL_COOPERATION
        self.__violations: list[str] = []
        self.__flashbacks_seen: set[str] = set()
        self.__flashback_log: list[dict] = []
        self.__pending_flashbacks: list[dict] = []
        self.__flashbacks: dict[str, tuple[str, str]] = FLASHBACKS

    @property
    def cooperation_score(self) -> int:
        return self.__cooperation_score

    @property
    def violations(self) -> list[str]:
        return self.__violations

    @property
    def flashback_log(self) -> list[dict]:
        return self.__flashback_log

    def consume_pending_flashbacks(self) -> list[dict]:
        pending = self.__pending_flashbacks[:]
        self.__pending_flashbacks = []
        return pending

    def check_flashbacks(self, knowledge: int, visited_adrian: bool,
                         rocky_encountered: bool) -> None:
        if knowledge >= FLASHBACK_KNOWLEDGE_10 and "knowledge_10" not in self.__flashbacks_seen:
            self.__trigger("knowledge_10")

        if knowledge >= FLASHBACK_KNOWLEDGE_30 and "knowledge_30" not in self.__flashbacks_seen:
            self.__trigger("knowledge_30")

        if visited_adrian and "first_adrian" not in self.__flashbacks_seen:
            self.__trigger("first_adrian")

        if rocky_encountered and "rocky_met" not in self.__flashbacks_seen:
            self.__trigger("rocky_met")

    def record_violation(self, violation: str) -> None:
        self.__violations.append(violation)
        self.__cooperation_score = max(0, self.__cooperation_score - VIOLATION_PENALTY)
        print(f"Protocol violation: {violation}. "
              f"Cooperation score: {self.__cooperation_score}")

    def check_resource_waste(self, action: str, energy_before: int,
                              energy_after: int) -> None:
        cost = energy_before - energy_after
        if cost > RESOURCE_WASTE_THRESHOLD:
            self.record_violation(f"Excessive energy spent on '{action}': {cost}")

    def is_mission_failed(self, grace_alive: bool = True,
                          ship_destroyed: bool = False) -> bool:
        if ship_destroyed:
            print("MISSION FAILURE: Hail Mary destroyed by Astrophage")
            return True
        if not grace_alive:
            print("Mission aborted - Grace has no energy or health remaining.")
            return True
        if self.__cooperation_score <= 0:
            print("Mission failed - cooperation with Rocky lost.")
            return True
        return False

    def __trigger(self, key: str) -> None:
        self.__flashbacks_seen.add(key)
        message, objective = self.__flashbacks[key]
        entry = {"key": key, "message": message, "objective": objective}
        self.__flashback_log.append(entry)
        self.__pending_flashbacks.append(entry)
        print(f"\n[FLASHBACK] {message}")
        print(f"[OBJECTIVE] {objective}\n")

    def __str__(self) -> str:
        return (f"MissionProtocol | cooperation: {self.__cooperation_score} "
                f"| violations: {len(self.__violations)} "
                f"| flashbacks seen: {len(self.__flashbacks_seen)}")
