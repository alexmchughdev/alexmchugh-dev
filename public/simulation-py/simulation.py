import random
import time
from environment import Grid, ADRIAN, ASTROPHAGE, HAZARD
from agents import Grace, Rocky, BeetleProbe
from astrophage import AstrophageManager
from taumoeba import TaumoebaCulture
from mission import MissionProtocol

MAX_TURNS = 50
FLASHBACK_PAUSE_SECONDS = 6.0


class Simulation:
    # ties all components together into a turn-based loop

    def __init__(self) -> None:
        self.__grid = Grid()
        grace_x, grace_y = self.__grid.hail_mary_pos
        rocky_x, rocky_y = self.__grid.blip_a_pos
        self.__grace = Grace(grace_x, grace_y)
        self.__rocky = Rocky(rocky_x, rocky_y)
        self.__astrophage = AstrophageManager(self.__grid)
        self.__culture = TaumoebaCulture()
        self.__protocol = MissionProtocol()
        self.__probes: list[BeetleProbe] = []
        self.__turn: int = 0
        self.__visited_adrian: bool = False
        self.__rocky_encountered: bool = False

    @property
    def turn(self) -> int:
        return self.__turn

    @property
    def grid(self) -> Grid:
        return self.__grid

    @property
    def grace(self) -> Grace:
        return self.__grace

    @property
    def rocky(self) -> Rocky:
        return self.__rocky

    @property
    def probes(self) -> list[BeetleProbe]:
        return self.__probes

    @property
    def protocol(self) -> MissionProtocol:
        return self.__protocol

    @property
    def culture(self) -> TaumoebaCulture:
        return self.__culture

    @property
    def astrophage(self) -> AstrophageManager:
        return self.__astrophage

    def consume_pending_flashbacks(self) -> list[dict]:
        return self.__protocol.consume_pending_flashbacks()

    def run(self) -> None:
        print(f"=== Simulation Start ===\n{self.__grid}\n")
        print(self.__grace)
        print(self.__rocky)

        while self.__turn < MAX_TURNS:
            self.__turn += 1
            print(f"\n--- Turn {self.__turn} ---")

            self.__grace_action()
            self.__rocky_action()
            self.__astrophage.spread()
            self.__apply_hazards()
            self.__navigate_probes()
            self.__protocol.check_flashbacks(
                self.__grace.knowledge_score,
                self.__visited_adrian,
                self.__rocky_encountered
            )

            print(self.__grace)

            # pause so the flashback text has time to be read
            if self.__protocol.consume_pending_flashbacks():
                time.sleep(FLASHBACK_PAUSE_SECONDS)

            if self.__protocol.is_mission_failed(grace_alive=self.__grace.is_alive()):
                break

            if self.__is_mission_complete():
                print("\n=== Mission Complete ===")
                print(f"Knowledge transmitted: {self.__grace.knowledge_score}")
                print(f"Probes deployed: {len(self.__probes)}")
                print(f"Viable strain: {self.__culture.viable_strain}")
                break
        else:
            print(f"\n=== Simulation ended after {MAX_TURNS} turns ===")

    def run_turn(self) -> bool:
        # advance one turn, return True if simulation should continue
        if self.__turn >= MAX_TURNS:
            return False
        self.__turn += 1
        self.__grace_action()
        self.__rocky_action()
        self.__astrophage.spread()
        self.__apply_hazards()
        self.__navigate_probes()
        self.__protocol.check_flashbacks(
            self.__grace.knowledge_score,
            self.__visited_adrian,
            self.__rocky_encountered
        )
        if self.__protocol.is_mission_failed(grace_alive=self.__grace.is_alive()):
            return False
        if self.__is_mission_complete():
            return False
        return True

    def __grace_action(self) -> None:
        # simple decision tree — priority order determines Grace's action each turn
        if self.__grace.energy <= 15:
            energy_before = self.__grace.energy
            self.__grace.rest()
            self.__protocol.check_resource_waste("rest", energy_before, self.__grace.energy)

        elif self.__turn >= 40 and len(self.__probes) == 0:
            # fallback: deploy at least one probe late in the mission
            probe = self.__grace.deploy_probe(self.__grid, viable_strain=self.__culture.viable_strain)
            if probe:
                self.__probes.append(probe)

        elif self.__culture.viable_strain and len(self.__probes) < 4:
            # deploy as soon as a viable strain exists
            probe = self.__grace.deploy_probe(self.__grid, viable_strain=True)
            if probe:
                self.__probes.append(probe)

        elif len(self.__grace.inventory) >= 3:
            # experiment when enough samples collected
            self.__grace.conduct_experiment()
            self.__protocol.check_flashbacks(
                self.__grace.knowledge_score,
                self.__visited_adrian,
                self.__rocky_encountered
            )

        elif self.__is_on_adrian():
            self.__grace.collect_sample(self.__grid)
            self.__culture.add_sample()
            if not self.__visited_adrian:
                self.__visited_adrian = True
            # attempt breeding if culture and knowledge are ready
            if (self.__culture.has_enough_samples()
                    and self.__grace.knowledge_score >= 20):
                self.__culture.attempt_breeding(
                    self.__grace.knowledge_score,
                    rocky_assisting=self.__rocky.is_adjacent(self.__grace)
                )

        elif (self.__rocky_encountered
              and self.__rocky.is_adjacent(self.__grace)
              and self.__grace.knowledge_score < 20):
            # only pull knowledge from Rocky when below threshold
            self.__rocky.share_knowledge(self.__grace)

        else:
            self.__move_toward_adrian()

    def __rocky_action(self) -> None:
        # Rocky patrols toward Grace if not yet encountered, then assists
        if not self.__rocky_encountered:
            if self.__rocky.is_adjacent(self.__grace):
                self.__rocky_encountered = True
                print("Rocky encounters Grace.")
            else:
                self.__move_rocky_toward_grace()
        else:
            if self.__rocky.is_adjacent(self.__grace):
                if self.__grace.energy < 30:
                    self.__rocky.provide_fuel(self.__grace)
                else:
                    self.__rocky.share_knowledge(self.__grace)
            else:
                self.__move_rocky_toward_grace()

    def __move_toward_adrian(self) -> None:
        # 15% chance Grace wanders off-plan to explore a neighbouring cell
        if random.random() < 0.15:
            direction = random.choice(["up", "down", "left", "right"])
            self.__grace.move(direction, self.__grid)
            return

        # target the centre of the randomised 3x3 Adrian cluster
        base_x, base_y = self.__grid.adrian_base
        target_x = base_x + 1
        target_y = base_y + 1
        if self.__grace.x > target_x:
            self.__grace.move("left", self.__grid)
        elif self.__grace.x < target_x:
            self.__grace.move("right", self.__grid)
        elif self.__grace.y > target_y:
            self.__grace.move("up", self.__grid)
        elif self.__grace.y < target_y:
            self.__grace.move("down", self.__grid)

    def __move_rocky_toward_grace(self) -> None:
        # Rocky moves one step closer to Grace each turn
        if self.__rocky.x > self.__grace.x:
            self.__rocky.move("left", self.__grid)
        elif self.__rocky.x < self.__grace.x:
            self.__rocky.move("right", self.__grid)
        elif self.__rocky.y > self.__grace.y:
            self.__rocky.move("up", self.__grid)
        elif self.__rocky.y < self.__grace.y:
            self.__rocky.move("down", self.__grid)

    def __apply_hazards(self) -> None:
        # drain energy if Grace is on an astrophage cell
        self.__astrophage.drain_energy(self.__grace)
        # apply damage if Grace is on a hazard cell
        if self.__grid.get_cell(self.__grace.x, self.__grace.y) == HAZARD:
            self.__grace.apply_hazard_damage(5)

    def __navigate_probes(self) -> None:
        for probe in self.__probes:
            probe.navigate(self.__grid)

    def __is_on_adrian(self) -> bool:
        return self.__grid.get_cell(self.__grace.x, self.__grace.y) == ADRIAN

    def __is_mission_complete(self) -> bool:
        # mission complete when a probe has transmitted and strain is viable
        transmitted = any(p.data_transmitted for p in self.__probes)
        return transmitted and self.__culture.viable_strain