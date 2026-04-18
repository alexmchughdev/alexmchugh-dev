import random
from environment import Grid, ADRIAN, ASTROPHAGE

# movement directions mapped to (dx, dy)
DIRECTIONS = {
    "up":    (0, -1),
    "down":  (0,  1),
    "left":  (-1, 0),
    "right": (1,  0)
}

# energy costs
MOVE_COST = 1
REST_GAIN = 3
EXPERIMENT_COST = 5

# knowledge gained per experiment outcome
KNOWLEDGE_GAIN = {
    "success": 10,
    "partial": 5,
    "failure": 2  # failures still teach something
}


class Agent:
    # base class for all agents in the simulation

    def __init__(self, name: str, x: int, y: int, health: int = 100, energy: int = 100) -> None:
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
        # move one cell in the given direction, wraps at edges, costs energy
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
        # starts at the Hail Mary with low energy
        super().__init__("Grace", x, y, health=100, energy=50)
        self.__knowledge_score = 0
        self.__inventory: list[str] = []
        self.__experiment_log: list[dict] = []
        self.__probes_deployed: list = []
        self.__fuel: int = 100
        self.__equipment: float = 1.0

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

    def rest(self) -> None:
        # recover some energy, can't exceed 100
        self.energy = min(100, self.energy + REST_GAIN)
        print(f"Grace rests. Energy: {self.energy}")

    def apply_hazard_damage(self, damage: int) -> None:
        self.health = self.health - damage
        self.energy = self.energy - damage
        print(f"Hazard! Grace takes {damage} damage. Health: {self.health}, Energy: {self.energy}")

    def collect_sample(self, grid: Grid) -> None:
        # collect a sample if standing on Adrian or Astrophage
        cell = grid.get_cell(self.x, self.y)
        if cell in (ADRIAN, ASTROPHAGE):
            self.__inventory.append(cell)
            print(f"Grace collects a {cell} sample. Inventory: {len(self.__inventory)}")
        else:
            print("Nothing to collect here.")

    def conduct_experiment(self) -> str:
        # use a sample to run an experiment, costs energy, logs the outcome
        if self.energy < EXPERIMENT_COST:
            print("Not enough energy to run an experiment.")
            return "no_energy"

        if not self.__inventory:
            print("No samples to experiment with.")
            return "no_samples"

        sample = self.__inventory.pop()
        self.energy = self.energy - EXPERIMENT_COST
        self.__fuel = max(0, self.__fuel - 2)
        self.__equipment = max(0.1, self.__equipment - 0.02)

        outcome = self.__determine_outcome()
        self.__knowledge_score += KNOWLEDGE_GAIN[outcome]

        # log everything including failures
        self.__experiment_log.append({
            "sample": sample,
            "outcome": outcome,
            "knowledge_after": self.__knowledge_score
        })

        print(f"Experiment outcome: {outcome}. Knowledge: {self.__knowledge_score}")
        return outcome

    def deploy_probe(self, grid: Grid, viable_strain: bool) -> "BeetleProbe | None":
        # deploy a beetle probe loaded with current knowledge and strain data
        if len(self.__probes_deployed) >= 4:
            print("All 4 probes already deployed.")
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
        # success probability nudges up slightly as knowledge grows
        roll = random.random()
        bonus = min(0.3, self.__knowledge_score * 0.005)
        equipment_penalty = 1.0 - self.__equipment
        if roll < 0.3 + bonus - equipment_penalty:
            return "success"
        elif roll < 0.7 + bonus - equipment_penalty:
            return "partial"
        else:
            return "failure"

    def __str__(self) -> str:
        return (super().__str__()
                + f" | knowledge: {self.__knowledge_score}"
                + f" | samples: {len(self.__inventory)}")


class Rocky(Agent):

    def __init__(self, x: int, y: int) -> None:
        # starts at Blip-A, full health and energy
        super().__init__("Rocky", x, y, health=100, energy=100)
        self.__translation_level = 0
        self.__goals: list[str] = ["share_knowledge", "repair", "patrol"]

    @property
    def translation_level(self) -> int:
        return self.__translation_level

    @property
    def goals(self) -> list[str]:
        return self.__goals

    def is_adjacent(self, other: Agent) -> bool:
        # check if Rocky is on the same cell or next to another agent
        return abs(self.x - other.x) <= 1 and abs(self.y - other.y) <= 1

    def share_knowledge(self, grace: Grace) -> None:
        # only works when close enough, translation improves with each interaction
        if not self.is_adjacent(grace):
            print("Rocky is too far away to share knowledge.")
            return

        # more interactions = better translation = more knowledge transferred
        gain = 3 + self.__translation_level * 2
        grace.knowledge_score = grace.knowledge_score + gain
        self.__translation_level += 1
        print(f"Rocky shares knowledge. Grace gains {gain}. "
              f"Translation level: {self.__translation_level}")

    def repair(self, grace: Grace) -> None:
        # restore some of Grace's health when adjacent
        if not self.is_adjacent(grace):
            print("Rocky is too far away to repair.")
            return

        heal = 15
        grace.health = min(100, grace.health + heal)
        print(f"Rocky repairs Grace. Health restored by {heal}. "
              f"Grace health: {grace.health}")

    def provide_fuel(self, grace: Grace) -> None:
        # transfer energy to Grace, costs Rocky the same amount
        if not self.is_adjacent(grace):
            print("Rocky is too far away to provide fuel.")
            return

        if self.energy < 10:
            print("Rocky doesn't have enough energy to transfer.")
            return

        transfer = 10
        grace.energy = grace.energy + transfer
        self.energy = self.energy - transfer
        print(f"Rocky provides fuel. Grace energy: {grace.energy}, "
              f"Rocky energy: {self.energy}")

    def __str__(self) -> str:
        return (super().__str__()
                + f" | translation: {self.__translation_level}")


class BeetleProbe(Agent):
    # autonomous data-relay drone deployed by Grace

    # probe names in order of deployment
    NAMES = ["John", "Paul", "George", "Ringo"]

    def __init__(self, probe_number: int, x: int, y: int,
                 knowledge: int, viable_strain: bool) -> None:
        name = BeetleProbe.NAMES[probe_number]
        super().__init__(name, x, y, health=100, energy=100)
        self.__knowledge_payload = knowledge
        self.__carries_viable_strain = viable_strain
        self.__data_transmitted = False

    @property
    def knowledge_payload(self) -> int:
        return self.__knowledge_payload

    @property
    def carries_viable_strain(self) -> bool:
        return self.__carries_viable_strain

    @property
    def data_transmitted(self) -> bool:
        return self.__data_transmitted

    def navigate(self, grid: Grid) -> None:
        # probes move toward the right edge (Earth direction) each turn
        if self.x < grid.width - 1:
            self.move("right", grid)
        else:
            self.__transmit()

    def __transmit(self) -> None:
        # probe has reached the edge — data sent to Earth
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