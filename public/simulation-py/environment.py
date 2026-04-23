import random
from config import (
    EMPTY, ADRIAN, ASTROPHAGE, HAIL_MARY, BLIP_A, HAZARD,
    GRID_WIDTH, GRID_HEIGHT,
    ADRIAN_X_RANGE, ADRIAN_Y_RANGE, ADRIAN_SIZE,
    HAIL_MARY_X_RANGE, HAIL_MARY_Y_RANGE,
    BLIP_A_X_RANGE, BLIP_A_Y_RANGE,
    PETROVA_LINE_Y, PETROVA_BULGE_Y,
    PETROVA_BULGE_START_RANGE, PETROVA_BULGE_SPAN_RANGE,
    HAZARD_COUNT, HAZARD_MAX_ATTEMPTS
)


class Grid:
    # 20x20 grid

    def __init__(self, width: int = GRID_WIDTH, height: int = GRID_HEIGHT) -> None:
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
        self.__cells[y % self.__height][x % self.__width] = cell_type

    def get_cell(self, x: int, y: int) -> str:
        return self.__cells[y % self.__height][x % self.__width]

    def __str__(self) -> str:
        rows = []
        for row in self.__cells:
            rows.append(" ".join(row))
        return "\n".join(rows)

    # private methods

    def __setup(self) -> None:
        self.__place_adrian()
        self.__place_hail_mary()
        self.__place_blip_a()
        self.__place_petrova_line()
        self.__place_hazards()

    def __place_adrian(self) -> None:
        base_x = random.randint(*ADRIAN_X_RANGE)
        base_y = random.randint(*ADRIAN_Y_RANGE)
        self.__adrian_base = (base_x, base_y)
        w, h = ADRIAN_SIZE
        for dx in range(w):
            for dy in range(h):
                self.place_item(base_x + dx, base_y + dy, ADRIAN)

    def __place_hail_mary(self) -> None:
        x = random.randint(*HAIL_MARY_X_RANGE)
        y = random.randint(*HAIL_MARY_Y_RANGE)
        self.__hail_mary_pos = (x, y)
        self.place_item(x, y, HAIL_MARY)

    def __place_blip_a(self) -> None:
        x = random.randint(*BLIP_A_X_RANGE)
        y = random.randint(*BLIP_A_Y_RANGE)
        self.__blip_a_pos = (x, y)
        self.place_item(x, y, BLIP_A)

    def __place_petrova_line(self) -> None:
        for x in range(self.__width):
            self.place_item(x, PETROVA_LINE_Y, ASTROPHAGE)
        start_x = random.randint(*PETROVA_BULGE_START_RANGE)
        span = random.randint(*PETROVA_BULGE_SPAN_RANGE)
        for x in range(start_x, start_x + span):
            self.place_item(x, PETROVA_BULGE_Y, ASTROPHAGE)

    def __place_hazards(self) -> None:
        placed = 0
        attempts = 0
        while placed < HAZARD_COUNT and attempts < HAZARD_MAX_ATTEMPTS:
            attempts += 1
            x = random.randint(0, self.__width - 1)
            y = random.randint(0, self.__height - 1)
            if self.get_cell(x, y) != EMPTY:
                continue
            self.place_item(x, y, HAZARD)
            placed += 1
