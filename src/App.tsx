import { createSignal, Show } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { createForm } from "@tanstack/solid-form";
import Flex from "./assets/Flex";

// Rounds to the nearest 0.25 (e.g., for weight plate precision)
function round(num: number): number {
  return Math.round(num * 4) / 4;
}

// Conversion functions (using 2.2 for simplicity; exact is 2.20462)
function kgToLb(kg: number): number {
  return kg * 2.2;
}

function lbToKg(lb: number): number {
  return lb / 2.2;
}

// Calculates 1RM extra weight in KG
function calc1rm(bodyweight: number, extraweight: number, reps: number): number {
  return round(extraweight + bodyweight * (reps / 30));
}

// Calculates extra weight for X reps in KG based on 1RM extra weight
function calcXrm(oneRepMax: number, bodyweight: number, reps: number): number {
  return round(oneRepMax - (bodyweight * reps / 30));
}

// Determines strength level based on 1RM in the current unit
function getLevel(orm: number, unit: string): { level: string; nextLevel: number; levelIndex: number } {
  const increment = unit === "KG" ? 5 : 10;
  const index = Math.floor(orm / increment);

  if (index >= levels.length) {
    return { level: levels[levels.length - 1], nextLevel: 0, levelIndex: levels.length };
  }

  const nextThreshold = (index + 1) * increment;
  return { level: levels[index], nextLevel: nextThreshold, levelIndex: index };
}

const levels = [
  "Featherweight", "Novice", "Apprentice", "Striker", "Gladiator",
  "Warrior", "Brawler", "Vanguard", "Titan", "Champion",
  "Powerhouse", "Juggernaut", "Behemoth", "Colossus", "Herculean",
  "Monster", "Overlord", "Superhuman", "Unbreakable", "Legendary"
];

export default function OneRepMaxDip() {
  // Persisted signals in KG
  const [bodyWeightKG, setBodyWeightKG] = makePersisted(createSignal(70), { storage: sessionStorage, name: "bodyWeightKG" });
  const [extraWeightKG, setExtraWeightKG] = makePersisted(createSignal(25), { storage: sessionStorage, name: "extraWeightKG" });
  const [reps, setReps] = makePersisted(createSignal(6), { storage: sessionStorage, name: "reps" });
  const [unit, setUnit] = makePersisted(createSignal("KG"), { storage: sessionStorage, name: "unit" });
  const [oneRepMaxKG, setOneRepMaxKG] = createSignal(0);

  // Computed display values based on current unit
  const bodyWeightDisplay = () => (unit() === "KG" ? bodyWeightKG() : round(kgToLb(bodyWeightKG())));
  const extraWeightDisplay = () => (unit() === "KG" ? extraWeightKG() : round(kgToLb(extraWeightKG())));
  const oneRepMaxDisplay = () => (unit() === "KG" ? oneRepMaxKG() : round(kgToLb(oneRepMaxKG())));

  // Handle body weight selection and convert to KG
  const handleBodyWeightChange = (value: number) => {
    const valueKG = unit() === "KG" ? value : lbToKg(value);
    setBodyWeightKG(round(valueKG));
  };

    const handleExtraWeightChange = (value: number) => {
    const valueKG = unit() === "KG" ? value : lbToKg(value);
    setExtraWeightKG(round(valueKG));
  };


  // Form setup with dynamic default values and submission
  const form = createForm(() => ({
    defaultValues: {
      extraweight: extraWeightDisplay(),
      reps: reps(),
    },
    onSubmit: async ({ value }) => {
      const { extraweight, reps } = value;
      const extraweightKG = unit() === "KG" ? extraweight : lbToKg(extraweight);
      handleExtraWeightChange(round(extraweightKG));
      setReps(reps);
      const onermextraweightKG = calc1rm(bodyWeightKG(), extraweightKG, reps);
      setOneRepMaxKG(onermextraweightKG);
    },
  }));

  return (
    <div class="max-w-lg px-4 mx-auto  sm:pt-[20vh]">
      <div class="flex justify-between py-8">
        <div class="flex items-center gap-4">
          <select
            id="unit"
            class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            value={unit()}
            onChange={(e) => setUnit(e.currentTarget.value as "KG" | "LB")}
          >
            <option value="KG">KG</option>
            <option value="LB">LB</option>
          </select>
          <label for="unit" class="block text-sm font-medium">
            Unit:
          </label>
        </div>

        <div class="flex items-center gap-4">
          <label for="bodyweight" class="block text-sm font-medium">
            Bodyweight:
          </label>
          <select
            id="bodyweight"
            class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            value={bodyWeightDisplay()}
            onChange={(e) => handleBodyWeightChange(parseFloat(e.currentTarget.value))}
          >
            {[...Array(71).keys()].map((n) => {
              const weight = unit() === "KG" ? 50 + n : round(110 + 2 * n);
              return <option value={weight}>{weight}</option>;
            })}
          </select>
        </div>
      </div>

      <h1 class="text-3xl font-black text-center">Rep Max Calculator</h1>
      <h3 class="font-bold text-center">(Weighted Dips)</h3>
      <form
        class="border-gray-800 grid gap-4 py-4 rounded-lg"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="reps"
          validators={{
            onChange: ({ value }) =>
              !value
                ? "Reps is required"
                : value < 0
                ? "Input a higher rep amount"
                : value > 50
                ? "Input a lower rep amount"
                : undefined,
          }}
          children={(field) => (
            <label for={field().name} class="grid">
              <span class="text-sm font-medium text-gray-700">Reps</span>
              <select
                name={field().name}
                value={field().state.value}
                onBlur={field().handleBlur}
                onInput={(e) => field().handleChange(parseInt(e.currentTarget.value))}
                class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12).keys()].map((n) => (
                  <option value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </label>
          )}
        />

        <form.Field
          name="extraweight"
          validators={{
            onChange: ({ value }) =>
              !value
                ? "Extra weight is required"
                : value < 0
                ? "Input a bigger weight"
                : value > 140
                ? "Input a smaller weight"
                : value % 0.25 !== 0
                ? "Weight must be a multiple of 0.25"
                : undefined,
          }}
          children={(field) => (
            <label for={field().name} class="grid">
              <span class="text-sm font-medium text-gray-700">Extra Weight</span>
              <input
                name={field().name}
                value={field().state.value}
                onBlur={field().handleBlur}
                type="number"
                step="0.25"
                inputMode="decimal"
                onInput={(e) => field().handleChange(e.target.valueAsNumber)}
                class={`p-2 bg-white border ${
                  field().state.meta.errors[0]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-blue-500"
                } focus:ring-2 rounded-md`}
              />
              <Show when={field().state.meta.errors[0]}>
                <p class="text-red-500">{field().state.meta.errors[0]}</p>
              </Show>
            </label>
          )}
        />
        <button
          type="submit"
          class="relative flex items-center justify-center border-2 border-gray-600 px-8 py-4 gap-4 rounded-md font-bold"
        >
          CALCULATE <Flex class="w-8 absolute right-4" />
        </button>
      </form>

      <Show when={oneRepMaxKG() !== 0}>
        <div class="text-3xl">
          1RM: <span class="font-bold">{oneRepMaxDisplay()} {unit()}s</span>
        </div>

        <div class="text-lg">
          Level:{" "}
          <span class="font-bold">{getLevel(oneRepMaxDisplay(), unit()).level}</span>{" "}
          {getLevel(oneRepMaxDisplay(), unit()).levelIndex}/{levels.length}
        </div>

        <div class="overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-2 rounded-full bg-blue-500"
            style={`width: ${(getLevel(oneRepMaxDisplay(), unit()).levelIndex / levels.length) * 100}%;`}
          ></div>
        </div>

        <div class="text-sm">
          {getLevel(oneRepMaxDisplay(), unit()).nextLevel > 0
            ? `${getLevel(oneRepMaxDisplay(), unit()).nextLevel} ${unit()} (${(
                getLevel(oneRepMaxDisplay(), unit()).nextLevel - oneRepMaxDisplay()
              ).toFixed(2)} ${unit()}) to reach the next level!`
            : "You're at the highest level"}
        </div>

        <div class="text-xl grid gap-2 mt-4">
          {calcXrm(oneRepMaxKG(), bodyWeightKG(), 3) > 0 ? (
            <p>
              3RM:{" "}
              <span class="font-bold">
                {unit() === "KG"
                  ? calcXrm(oneRepMaxKG(), bodyWeightKG(), 3)
                  : round(kgToLb(calcXrm(oneRepMaxKG(), bodyWeightKG(), 3)))}{" "}
                {unit()}s
              </span>
            </p>
          ) : null}
          {calcXrm(oneRepMaxKG(), bodyWeightKG(), 5) > 0 ? (
            <p>
              5RM:{" "}
              <span class="font-bold">
                {unit() === "KG"
                  ? calcXrm(oneRepMaxKG(), bodyWeightKG(), 5)
                  : round(kgToLb(calcXrm(oneRepMaxKG(), bodyWeightKG(), 5)))}{" "}
                {unit()}s
              </span>
            </p>
          ) : null}
          {calcXrm(oneRepMaxKG(), bodyWeightKG(), 7) > 0 ? (
            <p>
              7RM:{" "}
              <span class="font-bold">
                {unit() === "KG"
                  ? calcXrm(oneRepMaxKG(), bodyWeightKG(), 7)
                  : round(kgToLb(calcXrm(oneRepMaxKG(), bodyWeightKG(), 7)))}{" "}
                {unit()}s
              </span>
            </p>
          ) : null}
          {calcXrm(oneRepMaxKG(), bodyWeightKG(), 9) > 0 ? (
            <p>
              9RM:{" "}
              <span class="font-bold">
                {unit() === "KG"
                  ? calcXrm(oneRepMaxKG(), bodyWeightKG(), 9)
                  : round(kgToLb(calcXrm(oneRepMaxKG(), bodyWeightKG(), 9)))}{" "}
                {unit()}s
              </span>
            </p>
          ) : null}
        </div>
      </Show>
    </div>
  );
}
