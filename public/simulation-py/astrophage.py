import random
from environment import Grid, ASTROPHAGE, EMPTY

# how likely astrophage is to spread to an adjacent empty cell each turn
SPREAD_CHANCE = 0.05

# energy drained per turn based on astrophage intensity at agent's position
MAX_DRAIN = 3

class AstrophageManager:
    # tracks astrophage cells and handles spreading and energy drain

    def __init__(self, grid: Grid) -> None:
        self.__grid = grid
        # intensity map: (x, y) -> float 0.0-1.0
        self.__intensity: dict[tuple[int, int], float] = {}
        self.__seed_from_grid()
        self.__seed_random_clusters()

    @property
    def intensity_map(self) -> dict[tuple[int, int], float]:
        return self.__intensity

    def get_intensity(self, x: int, y: int) -> float:
        # return astrophage intensity at (x, y). 0.0 if none.
        return self.__intensity.get((x, y), 0.0)

    def spread(self) -> None:
        # each astrophage cell has a small chance to infect adjacent cells
        new_cells: dict[tuple[int, int], float] = {}

        for (x, y), intensity in self.__intensity.items():
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx = (x + dx) % self.__grid.width
                ny = (y + dy) % self.__grid.height
                # only spread to empty cells not already infected
                if (nx, ny) not in self.__intensity and random.random() < SPREAD_CHANCE:
                    new_cells[(nx, ny)] = round(intensity * 0.5, 2)

        for pos, val in new_cells.items():
            self.__intensity[pos] = val
            self.__grid.place_item(pos[0], pos[1], ASTROPHAGE)

        # existing cells can grow slightly in intensity over time
        for pos in self.__intensity:
            self.__intensity[pos] = min(1.0, self.__intensity[pos] + 0.01)

    def drain_energy(self, agent) -> None:
        # drain agent energy based on astrophage intensity at their position.
        intensity = self.get_intensity(agent.x, agent.y)
        if intensity > 0:
            drain = round(intensity * MAX_DRAIN)
            agent.energy = agent.energy - drain
            if drain > 0:
                print(f"Astrophage drains {drain} energy from {agent.name}. "
                      f"Energy: {agent.energy}")

    def __seed_from_grid(self) -> None:
        # read existing astrophage cells from the grid and assign intensity
        for y in range(self.__grid.height):
            for x in range(self.__grid.width):
                if self.__grid.get_cell(x, y) == ASTROPHAGE:
                    # petrova line starts at full intensity
                    self.__intensity[(x, y)] = 1.0

    def __seed_random_clusters(self) -> None:
        # add 3-5 small roaming clusters of astrophage away from the petrova line
        num_clusters = random.randint(3, 5)
        placed = 0
        attempts = 0
        while placed < num_clusters and attempts < 100:
            attempts += 1
            x = random.randint(0, self.__grid.width - 1)
            y = random.randint(0, self.__grid.height - 1)
            if (x, y) in self.__intensity:
                continue
            if self.__grid.get_cell(x, y) != EMPTY:
                continue
            intensity = round(random.uniform(0.3, 0.7), 2)
            self.__intensity[(x, y)] = intensity
            self.__grid.place_item(x, y, ASTROPHAGE)
            placed += 1