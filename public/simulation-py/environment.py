import random

# Cell type constants
EMPTY = "."
ADRIAN = "A"        # the planet and its atmosphere
ASTROPHAGE = "X"    # astrophage cloud / petrova line
HAIL_MARY = "H"     # Grace's ship
BLIP_A = "B"        # Rocky's ship
HAZARD = "!"        # radiation zone or debris


class Grid:
    # 20x20 grid

    def __init__(self, width: int = 20, height: int = 20) -> None:
        self.__width = width
        self.__height = height
        self.__cells: list[list[str]] = [
            [EMPTY for _ in range(width)] for _ in range(height)
        ]
        self.__adrian_base: tuple[int, int] = (3, 8)
        self.__hail_mary_pos: tuple[int, int] = (10, 10)
        self.__blip_a_pos: tuple[int, int] = (16, 4)
        self.__setup()

    @property
    def width(self) -> int:
        return self.__width

    @property
    def height(self) -> int:
        return self.__height

    @property
    def adrian_base(self) -> tuple[int, int]:
        return self.__adrian_base

    @property
    def hail_mary_pos(self) -> tuple[int, int]:
        return self.__hail_mary_pos

    @property
    def blip_a_pos(self) -> tuple[int, int]:
        return self.__blip_a_pos

    # public methods

    def place_item(self, x: int, y: int, cell_type: str) -> None:
        # place a cell type at (x, y). Wraps at edges.
        self.__cells[y % self.__height][x % self.__width] = cell_type

    def get_cell(self, x: int, y: int) -> str:
        # return the cell type at (x, y). Wraps at edges
        return self.__cells[y % self.__height][x % self.__width]

    def __str__(self) -> str:
        # print the grid row by row — handy for quick console checks.
        rows = []
        for row in self.__cells:
            rows.append(" ".join(row))
        return "\n".join(rows)

    # private methods

    def __setup(self) -> None:
        # place starting features on the grid.
        self.__place_adrian()
        self.__place_hail_mary()
        self.__place_blip_a()
        self.__place_petrova_line()
        self.__place_hazards()

    def __place_adrian(self) -> None:
        base_x = random.randint(2, 6)
        base_y = random.randint(7, 11)
        self.__adrian_base = (base_x, base_y)
        for dx in range(3):
            for dy in range(3):
                self.place_item(base_x + dx, base_y + dy, ADRIAN)

    def __place_hail_mary(self) -> None:
        x = random.randint(8, 12)
        y = random.randint(8, 12)
        self.__hail_mary_pos = (x, y)
        self.place_item(x, y, HAIL_MARY)

    def __place_blip_a(self) -> None:
        x = random.randint(14, 18)
        y = random.randint(2, 6)
        self.__blip_a_pos = (x, y)
        self.place_item(x, y, BLIP_A)

    def __place_petrova_line(self) -> None:
        for x in range(self.__width):
            self.place_item(x, 14, ASTROPHAGE)
        start_x = random.randint(0, 10)
        span = random.randint(6, 10)
        for x in range(start_x, start_x + span):
            self.place_item(x, 15, ASTROPHAGE)

    def __place_hazards(self) -> None:
        placed = 0
        attempts = 0
        # skip cells already taken by Adrian / Hail Mary / Blip-A / Astrophage
        while placed < 5 and attempts < 200:
            attempts += 1
            x = random.randint(0, self.__width - 1)
            y = random.randint(0, self.__height - 1)
            if self.get_cell(x, y) != EMPTY:
                continue
            self.place_item(x, y, HAZARD)
            placed += 1