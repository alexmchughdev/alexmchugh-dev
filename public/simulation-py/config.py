# central configuration for tuning simulation values

# --- simulation ---
MAX_TURNS = 50
FLASHBACK_PAUSE_SECONDS = 6.0

# --- grid ---
GRID_WIDTH = 20
GRID_HEIGHT = 20

# cell type constants
EMPTY = "."
ANCHOR = "A"
ADRIAN = "A"
ASTROPHAGE = "X"
HAIL_MARY = "H"
BLIP_A = "B"
HAZARD = "!"

# randomised placement ranges (inclusive)
ADRIAN_X_RANGE = (2, 6)
ADRIAN_Y_RANGE = (7, 11)
ADRIAN_SIZE = (3, 3)

HAIL_MARY_X_RANGE = (8, 12)
HAIL_MARY_Y_RANGE = (3, 7)

BLIP_A_X_RANGE = (14, 18)
BLIP_A_Y_RANGE = (2, 6)

PETROVA_LINE_Y = 14
PETROVA_BULGE_Y = 15
PETROVA_BULGE_START_RANGE = (0, 10)
PETROVA_BULGE_SPAN_RANGE = (6, 10)

HAZARD_COUNT = 5
HAZARD_MAX_ATTEMPTS = 200

# --- agents ---
DIRECTIONS = {
    "up":    (0, -1),
    "down":  (0,  1),
    "left":  (-1, 0),
    "right": (1,  0)
}

MOVE_COST = 1
REST_GAIN = 3
EXPERIMENT_COST = 5

KNOWLEDGE_GAIN = {
    "success": 10,
    "partial": 5,
    "failure": 2
}

# Grace
GRACE_HEALTH = 100
GRACE_ENERGY = 70
GRACE_MAX_ENERGY = 100
GRACE_FUEL = 100
GRACE_FUEL_PER_EXPERIMENT = 2
GRACE_EQUIPMENT = 1.0
GRACE_EQUIPMENT_DECAY = 0.02
GRACE_EQUIPMENT_MIN = 0.1
GRACE_LOW_ENERGY_THRESHOLD = 15
GRACE_INVENTORY_EXPERIMENT_THRESHOLD = 3
GRACE_KNOWLEDGE_THRESHOLD = 20
GRACE_EXPERIMENT_SUCCESS_BASE = 0.3
GRACE_EXPERIMENT_PARTIAL_BASE = 0.7
GRACE_EXPERIMENT_KNOWLEDGE_BONUS = 0.005
GRACE_EXPERIMENT_MAX_BONUS = 0.3
GRACE_WANDER_CHANCE = 0.15
GRACE_LATE_GAME_TURN = 40

# Rocky
ROCKY_HEALTH = 100
ROCKY_ENERGY = 100
ROCKY_SHARE_BASE_GAIN = 3
ROCKY_SHARE_LEVEL_BONUS = 2
ROCKY_REPAIR_AMOUNT = 15
ROCKY_FUEL_TRANSFER = 10
ROCKY_FUEL_THRESHOLD = 30

# BeetleProbe
PROBE_NAMES = ["John", "Paul", "George", "Ringo"]
MAX_PROBES = 4
PROBE_HEALTH = 100
PROBE_ENERGY = 100

HAZARD_DAMAGE = 5

# --- astrophage ---
SPREAD_CHANCE = 0.05
MAX_DRAIN = 3
INTENSITY_INITIAL = 1.0
INTENSITY_SPREAD_FACTOR = 0.5
INTENSITY_GROWTH = 0.01
INTENSITY_MAX = 1.0
RANDOM_CLUSTER_RANGE = (3, 5)
RANDOM_CLUSTER_INTENSITY_RANGE = (0.3, 0.7)
RANDOM_CLUSTER_MAX_ATTEMPTS = 100

# adaptive spread tuning — added to SPREAD_CHANCE each turn so the
# astrophage gradually becomes more aggressive as the mission drags on
ASTROPHAGE_TURN_GROWTH = 0.001
# extra aggression once the taumoeba countermeasure has been deployed,
# representing an evolutionary response to the new threat
ASTROPHAGE_TAUMOEBA_BONUS = 0.02
# hard ceiling on the per-cell spread probability so late-game blooms
# can't run away entirely
ASTROPHAGE_SPREAD_CAP = 0.18

# --- taumoeba ---
TAUMOEBA_UNLOCK = 20
MIN_SAMPLES = 3
BREEDING_BASE_CHANCE = 0.25
BREEDING_KNOWLEDGE_SCALE = 0.01
BREEDING_KNOWLEDGE_MAX_BONUS = 0.4
BREEDING_ROCKY_BONUS = 0.1
BREEDING_PARTIAL_RANGE = 0.3

# --- mission protocol ---
VIOLATION_PENALTY = 10
RESOURCE_WASTE_PENALTY = 5
INITIAL_COOPERATION = 100
RESOURCE_WASTE_THRESHOLD = 10
FLASHBACK_KNOWLEDGE_10 = 10
FLASHBACK_KNOWLEDGE_30 = 30

FLASHBACKS = {
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
        "Flashback: Grace and Rocky's first contact - sonar chords through the hull.",
        "Establish translation. Knowledge sharing is now available."
    )
}

# --- visualiser ---
CELL_SIZE = 28
PANEL_WIDTH = 200
STEP_DELAY_MS = 300

VIS_CELL_COLOURS = {
    EMPTY:      "",
    ADRIAN:     "#2d5c2a",
    ASTROPHAGE: "#7a1a1a",
    HAIL_MARY:  "#1a3d5c",
    BLIP_A:     "#5c4a1a",
    HAZARD:     "#5c5a10",
}

VIS_CELL_OUTLINE = {
    EMPTY:      "#1a2a1a",
    ADRIAN:     "#4a9a44",
    ASTROPHAGE: "#cc3333",
    HAIL_MARY:  "#3388cc",
    BLIP_A:     "#cc9933",
    HAZARD:     "#aaaa22",
}

VIS_AGENT_COLOURS = {
    "G": "#44cc44",
    "R": "#ff6622",
}

VIS_BG = "#060a14"
VIS_PANEL_BG = "#0d1520"
VIS_BORDER = "#1e2e3e"
VIS_TEXT = "#ccd8e8"
VIS_LABEL = "#7a9ab8"
VIS_FONT = ("Helvetica", 10)
VIS_FONT_BOLD = ("Helvetica", 10, "bold")
VIS_FONT_SMALL = ("Helvetica", 9)
