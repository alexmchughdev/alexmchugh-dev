# mission protocol enforcement and flashback event system

# cooperation score penalty for protocol violations
VIOLATION_PENALTY = 10
RESOURCE_WASTE_PENALTY = 5


class MissionProtocol:
    # tracks protocol compliance, fires flashback events, enforces consequences

    def __init__(self) -> None:
        self.__cooperation_score: int = 100
        self.__violations: list[str] = []
        self.__flashbacks_seen: set[str] = set()
        self.__flashback_log: list[dict] = []
        self.__pending_flashbacks: list[dict] = []

        # flashback events: condition key -> (message, new objective)
        self.__flashbacks: dict[str, tuple[str, str]] = {
            "knowledge_10": (
                "Flashback: Eva Stratt briefs Grace on the Astrophage threat. "
                "Earth has decades at most.",
                "Prioritise experiments over movement."
            ),
            "knowledge_30": (
                "Flashback: Grace remembers volunteering for the mission. "
                "He knew he wasn't coming back.",
                "Deploy a beetle probe before resources run out."
            ),
            "first_adrian": (
                "Flashback: Grace recalls first detecting Taumoeba in Adrian's atmosphere. "
                "It was eating the Astrophage.",
                "Collect Taumoeba samples and begin breeding experiments."
            ),
            "rocky_met": (
                "Flashback: Grace and Rocky's first contact — sonar chords through the hull.",
                "Establish translation. Knowledge sharing is now available."
            )
        }

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
        # check conditions each turn and fire any unseen flashbacks
        if knowledge >= 10 and "knowledge_10" not in self.__flashbacks_seen:
            self.__trigger("knowledge_10")

        if knowledge >= 30 and "knowledge_30" not in self.__flashbacks_seen:
            self.__trigger("knowledge_30")

        if visited_adrian and "first_adrian" not in self.__flashbacks_seen:
            self.__trigger("first_adrian")

        if rocky_encountered and "rocky_met" not in self.__flashbacks_seen:
            self.__trigger("rocky_met")

    def record_violation(self, violation: str) -> None:
        # log a protocol breach and penalise cooperation score
        self.__violations.append(violation)
        self.__cooperation_score = max(0, self.__cooperation_score - VIOLATION_PENALTY)
        print(f"Protocol violation: {violation}. "
              f"Cooperation score: {self.__cooperation_score}")

    def check_resource_waste(self, action: str, energy_before: int,
                              energy_after: int) -> None:
        # flag actions that cost disproportionate energy for low priority tasks
        cost = energy_before - energy_after
        if cost > 10:
            self.record_violation(f"Excessive energy spent on '{action}': {cost}")

    def is_mission_failed(self, grace_alive: bool = True) -> bool:
        # mission fails if cooperation is lost or Grace has no energy/health
        if not grace_alive:
            print("Mission aborted — Grace has no energy or health remaining.")
            return True
        if self.__cooperation_score <= 0:
            print("Mission failed — cooperation with Rocky lost.")
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