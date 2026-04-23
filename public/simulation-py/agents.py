import random
from environment import Grid
from config import (
    ADRIAN, ASTROPHAGE,
    DIRECTIONS, MOVE_COST, REST_GAIN, EXPERIMENT_COST, KNOWLEDGE_GAIN,
    GRACE_HEALTH, GRACE_ENERGY, GRACE_MAX_ENERGY,
    GRACE_FUEL, GRACE_FUEL_PER_EXPERIMENT,
    GRACE_EQUIPMENT, GRACE_EQUIPMENT_DECAY, GRACE_EQUIPMENT_MIN,
    GRACE_EXPERIMENT_SUCCESS_BASE, GRACE_EXPERIMENT_PARTIAL_BASE,
    GRACE_EXPERIMENT_KNOWLEDGE_BONUS, GRACE_EXPERIMENT_MAX_BONUS,
    ROCKY_HEALTH, ROCKY_ENERGY,
    ROCKY_SHARE_BASE_GAIN, ROCKY_SHARE_LEVEL_BONUS,
    ROCKY_REPAIR_AMOUNT, ROCKY_FUEL_TRANSFER,
    PROBE_NAMES, MAX_PROBES, PROBE_HEALTH, PROBE_ENERGY
)


class Agent:
    # base class for all agents in the simulation

    def __init__(self, name: str, x: int, y: int,
                 health: int = 100, energy: int = 100) -> None:
        self.__name = name
        self.__x = x
        self.__y = y
        self.__health = health
        self.__energy = energy

    @property
    def name(self) -> str:
        return self.__name

    @property
    def x(self) -> int:
        return self.__x

    @property
    def y(self) -> int:
        return self.__y

    @property
    def health(self) -> int:
        return self.__health

    @property
    def energy(self) -> int:
        return self.__energy

    @health.setter
    def health(self, value: int) -> None:
        self.__health = max(0, value)

    @energy.setter
    def energy(self, value: int) -> None:
        self.__energy = max(0, value)

    def move(self, direction: str, grid: Grid) -> None:
        if direction not in DIRECTIONS:
            print(f"Unknown direction: {direction}")
            return

        if self.__energy <= 0:
            print(f"{self.__name} is out of energy and cannot move.")
            return

        dx, dy = DIRECTIONS[direction]
        self.__x = (self.__x + dx) % grid.width
        self.__y = (self.__y + dy) % grid.height
        self.__energy -= MOVE_COST

    def is_alive(self) -> bool:
        return self.__health > 0 and self.__energy > 0

    def __str__(self) -> str:
        return (f"{self.__name} | pos: ({self.__x},{self.__y}) "
                f"| health: {self.__health} | energy: {self.__energy}")


class Grace(Agent):

    def __init__(self, x: int, y: int) -> None:
        super().__init__("Grace", x, y, health=GRACE_HEALTH, energy=GRACE_ENERGY)
        self.__knowledge_score = 0
        self.__inventory: list[str] = []
        self.__experiment_log: list[dict] = []
        self.__probes_deployed: list = []
        self.__fuel: int = GRACE_FUEL
        self.__equipment: float = GRACE_EQUIPMENT
        self.__failure_streak: int = 0

    @property
    def knowledge_score(self) -> int:
        return self.__knowledge_score

    @knowledge_score.setter
    def knowledge_score(self, value: int) -> None:
        self.__knowledge_score = max(0, value)

    @property
    def inventory(self) -> list[str]:
        return self.__inventory

    @property
    def experiment_log(self) -> list[dict]:
        return self.__experiment_log

    @property
    def fuel(self) -> int:
        return self.__fuel

    @property
    def equipment(self) -> float:
        return self.__equipment

    @property
    def failure_streak(self) -> int:
        return self.__failure_streak

    def rest(self) -> None:
        self.energy = min(GRACE_MAX_ENERGY, self.energy + REST_GAIN)
        print(f"Grace rests. Energy: {self.energy}")

    def apply_hazard_damage(self, damage: int) -> None:
        self.health = self.health - damage
        self.energy = self.energy - damage
        print(f"Hazard! Grace takes {damage} damage. "
              f"Health: {self.health}, Energy: {self.energy}")

    def collect_sample(self, grid: Grid) -> None:
        cell = grid.get_cell(self.x, self.y)
        if cell in (ADRIAN, ASTROPHAGE):
            self.__inventory.append(cell)
            print(f"Grace collects a {cell} sample. Inventory: {len(self.__inventory)}")
        else:
            print("Nothing to collect here.")

    def conduct_experiment(self) -> str:
        if self.energy < EXPERIMENT_COST:
            print("Not enough energy to run an experiment.")
            return "no_energy"

        if not self.__inventory:
            print("No samples to experiment with.")
            return "no_samples"

        sample = self.__inventory.pop()
        self.energy = self.energy - EXPERIMENT_COST
        self.__fuel = max(0, self.__fuel - GRACE_FUEL_PER_EXPERIMENT)
        self.__equipment = max(GRACE_EQUIPMENT_MIN,
                               self.__equipment - GRACE_EQUIPMENT_DECAY)

        outcome = self.__determine_outcome()
        self.__knowledge_score += KNOWLEDGE_GAIN[outcome]

        if outcome == "failure":
            self.__failure_streak += 1
        else:
            self.__failure_streak = 0

        self.__experiment_log.append({
            "sample": sample,
            "outcome": outcome,
            "knowledge_after": self.__knowledge_score
        })

        print(f"Experiment outcome: {outcome}. Knowledge: {self.__knowledge_score}")
        return outcome

    def deploy_probe(self, grid: Grid, viable_strain: bool) -> "BeetleProbe | None":
        if len(self.__probes_deployed) >= MAX_PROBES:
            print(f"All {MAX_PROBES} probes already deployed.")
            return None

        probe = BeetleProbe(
            probe_number=len(self.__probes_deployed),
            x=self.x,
            y=self.y,
            knowledge=self.__knowledge_score,
            viable_strain=viable_strain
        )
        self.__probes_deployed.append(probe)
        print(f"Grace deploys probe {probe.name}. "
              f"Total deployed: {len(self.__probes_deployed)}")
        return probe

    def __determine_outcome(self) -> str:
        roll = random.random()
        bonus = min(GRACE_EXPERIMENT_MAX_BONUS,
                    self.__knowledge_score * GRACE_EXPERIMENT_KNOWLEDGE_BONUS)
        equipment_penalty = 1.0 - self.__equipment
        if roll < GRACE_EXPERIMENT_SUCCESS_BASE + bonus - equipment_penalty:
            return "success"
        elif roll < GRACE_EXPERIMENT_PARTIAL_BASE + bonus - equipment_penalty:
            return "partial"
        else:
            return "failure"

    def __str__(self) -> str:
        return (super().__str__()
                + f" | knowledge: {self.__knowledge_score}"
                + f" | samples: {len(self.__inventory)}")


class Rocky(Agent):

    def __init__(self, x: int, y: int) -> None:
        super().__init__("Rocky", x, y, health=ROCKY_HEALTH, energy=ROCKY_ENERGY)
        self.__translation_level = 0
        self.__goals: list[str] = ["share_knowledge", "repair", "patrol"]
        self.__stress_level: int = 0

    @property
    def translation_level(self) -> int:
        return self.__translation_level

    @property
    def goals(self) -> list[str]:
        return self.__goals

    @property
    def stress_level(self) -> int:
        return self.__stress_level

    def increase_stress(self) -> None:
        self.__stress_level += 1

    def decrease_stress(self) -> None:
        self.__stress_level = max(0, self.__stress_level - 1)

    def is_adjacent(self, other: Agent) -> bool:
        return abs(self.x - other.x) <= 1 and abs(self.y - other.y) <= 1

    def share_knowledge(self, grace: Grace) -> None:
        if not self.is_adjacent(grace):
            print("Rocky is too far away to share knowledge.")
            return

        gain = ROCKY_SHARE_BASE_GAIN + self.__translation_level * ROCKY_SHARE_LEVEL_BONUS
        grace.knowledge_score = grace.knowledge_score + gain
        self.__translation_level += 1
        print(f"Rocky shares knowledge. Grace gains {gain}. "
              f"Translation level: {self.__translation_level}")

    def repair(self, grace: Grace) -> None:
        if not self.is_adjacent(grace):
            print("Rocky is too far away to repair.")
            return

        grace.health = min(GRACE_MAX_ENERGY, grace.health + ROCKY_REPAIR_AMOUNT)
        print(f"Rocky repairs Grace. Health restored by {ROCKY_REPAIR_AMOUNT}. "
              f"Grace health: {grace.health}")

    def provide_fuel(self, grace: Grace) -> None:
        if not self.is_adjacent(grace):
            print("Rocky is too far away to provide fuel.")
            return

        if self.energy < ROCKY_FUEL_TRANSFER:
            print("Rocky doesn't have enough energy to transfer.")
            return

        grace.energy = grace.energy + ROCKY_FUEL_TRANSFER
        self.energy = self.energy - ROCKY_FUEL_TRANSFER
        print(f"Rocky provides fuel. Grace energy: {grace.energy}, "
              f"Rocky energy: {self.energy}")

    def __str__(self) -> str:
        return (super().__str__()
                + f" | translation: {self.__translation_level}")


class BeetleProbe(Agent):
    # autonomous data-relay drone deployed by Grace

    NAMES = PROBE_NAMES
    TRAJECTORIES = ["east", "northeast", "southeast", "north"]

    def __init__(self, probe_number: int, x: int, y: int,
                 knowledge: int, viable_strain: bool) -> None:
        name = BeetleProbe.NAMES[probe_number]
        super().__init__(name, x, y, health=PROBE_HEALTH, energy=PROBE_ENERGY)
        self.__knowledge_payload = knowledge
        self.__carries_viable_strain = viable_strain
        self.__data_transmitted = False
        self.__trajectory = BeetleProbe.TRAJECTORIES[
            probe_number % len(BeetleProbe.TRAJECTORIES)
        ]
        self.__step = 0

    @property
    def knowledge_payload(self) -> int:
        return self.__knowledge_payload

    @property
    def carries_viable_strain(self) -> bool:
        return self.__carries_viable_strain

    @property
    def data_transmitted(self) -> bool:
        return self.__data_transmitted

    @property
    def trajectory(self) -> str:
        return self.__trajectory

    def navigate(self, grid: Grid) -> None:
        if self.__at_edge(grid):
            self.__transmit()
            return

        direction = self.__next_direction()
        self.__step += 1
        self.move(direction, grid)

    def __at_edge(self, grid: Grid) -> bool:
        return (self.x == 0 or self.x == grid.width - 1
                or self.y == 0 or self.y == grid.height - 1)

    def __next_direction(self) -> str:
        if self.__trajectory == "east":
            return "right"
        if self.__trajectory == "north":
            return "up"
        if self.__trajectory == "northeast":
            return "right" if self.__step % 2 == 0 else "up"
        if self.__trajectory == "southeast":
            return "right" if self.__step % 2 == 0 else "down"
        return "right"

    def __transmit(self) -> None:
        if not self.__data_transmitted:
            self.__data_transmitted = True
            print(f"Probe {self.name} transmits data to Earth. "
                  f"Knowledge: {self.__knowledge_payload}, "
                  f"Viable strain: {self.__carries_viable_strain}")

    def __str__(self) -> str:
        return (super().__str__()
                + f" | payload: {self.__knowledge_payload}"
                + f" | strain: {self.__carries_viable_strain}"
                + f" | transmitted: {self.__data_transmitted}")
