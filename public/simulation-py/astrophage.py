import random
from environment import Grid
from config import (
    EMPTY, ASTROPHAGE, SPREAD_CHANCE, MAX_DRAIN,
    INTENSITY_INITIAL, INTENSITY_SPREAD_FACTOR,
    INTENSITY_GROWTH, INTENSITY_MAX,
    RANDOM_CLUSTER_RANGE, RANDOM_CLUSTER_INTENSITY_RANGE,
    RANDOM_CLUSTER_MAX_ATTEMPTS
)


class AstrophageManager:
    # tracks astrophage cells and handles spreading and energy drain

    def __init__(self, grid: Grid) -> None:
        self.__grid = grid
        self.__intensity: dict[tuple[int, int], float] = {}
        self.__turn_counter: int = 0
        self.__taumoeba_deployed: bool = False
        self.__seed_from_grid()
        self.__seed_random_clusters()

    def notify_taumoeba_deployed(self) -> None:
        self.__taumoeba_deployed = True

    @property
    def intensity_map(self) -> dict[tuple[int, int], float]:
        return self.__intensity

    def get_intensity(self, x: int, y: int) -> float:
        return self.__intensity.get((x, y), 0.0)

    def spread(self) -> None:
        self.__turn_counter += 1
        effective_chance = SPREAD_CHANCE + 0.002 * self.__turn_counter
        if self.__taumoeba_deployed:
            effective_chance += 0.03
        effective_chance = min(0.25, effective_chance)

        new_cells: dict[tuple[int, int], float] = {}

        for (x, y), intensity in self.__intensity.items():
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx = (x + dx) % self.__grid.width
                ny = (y + dy) % self.__grid.height
                if (nx, ny) not in self.__intensity and random.random() < effective_chance:
                    new_cells[(nx, ny)] = round(intensity * INTENSITY_SPREAD_FACTOR, 2)

        for pos, val in new_cells.items():
            self.__intensity[pos] = val
            self.__grid.place_item(pos[0], pos[1], ASTROPHAGE)

        for pos in self.__intensity:
            self.__intensity[pos] = min(INTENSITY_MAX,
                                        self.__intensity[pos] + INTENSITY_GROWTH)

    def check_ship_contamination(self, grid: Grid) -> bool:
        hx, hy = grid.hail_mary_pos
        return self.get_intensity(hx, hy) > 0

    def drain_energy(self, agent) -> None:
        intensity = self.get_intensity(agent.x, agent.y)
        if intensity > 0:
            drain = round(intensity * MAX_DRAIN)
            agent.energy = agent.energy - drain
            if drain > 0:
                print(f"Astrophage drains {drain} energy from {agent.name}. "
                      f"Energy: {agent.energy}")

    def __seed_from_grid(self) -> None:
        for y in range(self.__grid.height):
            for x in range(self.__grid.width):
                if self.__grid.get_cell(x, y) == ASTROPHAGE:
                    self.__intensity[(x, y)] = INTENSITY_INITIAL

    def __seed_random_clusters(self) -> None:
        num_clusters = random.randint(*RANDOM_CLUSTER_RANGE)
        placed = 0
        attempts = 0
        while placed < num_clusters and attempts < RANDOM_CLUSTER_MAX_ATTEMPTS:
            attempts += 1
            x = random.randint(0, self.__grid.width - 1)
            y = random.randint(0, self.__grid.height - 1)
            if (x, y) in self.__intensity:
                continue
            if self.__grid.get_cell(x, y) != EMPTY:
                continue
            intensity = round(random.uniform(*RANDOM_CLUSTER_INTENSITY_RANGE), 2)
            self.__intensity[(x, y)] = intensity
            self.__grid.place_item(x, y, ASTROPHAGE)
            placed += 1
