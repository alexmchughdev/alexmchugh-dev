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
        self.__setup()

    @property
    def width(self) -> int:
        return self.__width

    @property 
    def height(self) -> int:
        return self.__height

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
        for dx in range(3):
            for dy in range(3):
                self.place_item(3 + dx, 8 + dy, ADRIAN)

    def __place_hail_mary(self) -> None:
        self.place_item(10, 10, HAIL_MARY)

    def __place_blip_a(self) -> None:
        self.place_item(16, 4, BLIP_A)

    def __place_petrova_line(self) -> None:
        for x in range(self.__width):
            self.place_item(x, 14, ASTROPHAGE)
        for x in range(6, 14):
            self.place_item(x, 15, ASTROPHAGE)

    def __place_hazards(self) -> None:
        hazard_positions = [(1, 1), (18, 2), (7, 17), (15, 12), (2, 18)]
        for x, y in hazard_positions:
            self.place_item(x, y, HAZARD)