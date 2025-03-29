import { createSignal, Show } from "solid-js";
import { makePersisted } from "@solid-primitives/storage"
import { createForm } from "@tanstack/solid-form"

function calc1rm(bodyweight: number, extraweight: number, reps: number): number {
  return Math.round((extraweight + bodyweight * (1 + reps/30) - bodyweight) * 4) / 4
}

function calcXrm(oneRepMax: number, bodyweight: number, reps: number): number {
  return Math.round((oneRepMax - (bodyweight * reps / 30)) * 4) / 4;
}

export default function OneRepMaxDip() {
  const [bodyWeight, setBodyweight] = makePersisted(createSignal(70), {storage: sessionStorage})
  const [unit, setUnit] = makePersisted(createSignal("KG"), {storage: sessionStorage})
  const [onerepmax, setOnerepmax] = createSignal(0)

  const form = createForm(() => ({
    defaultValues: {
      extraweight: 20,
      reps: 6,
    },
    onSubmit: async ({ value }) => {
      const { extraweight, reps } = value
      const onermextraweight = calc1rm(bodyWeight(), extraweight, reps)
      setOnerepmax(onermextraweight);
    },
  }))

  return (
    <div class="max-w-[500px] px-4 mx-auto ">

    <div class="flex justify-between py-[15vh]">
    <div class="flex items-center gap-4">
    <select
    id="unit"
    class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
    value={unit()}
    onChange={(e) => setUnit(e.currentTarget.value)}
    >
      <option value="KG">KG</option>;
      <option value="LB">LB</option>;
    </select>
    <label for="unit" class="block text-sm font-medium">Unit:</label>
    </div>

    <div class="flex items-center gap-4">
    <label for="bodyweight" class="block text-sm font-medium">Bodyweight ({unit()}):</label>
      <select
    id="bodyweight"
    class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
    value={bodyWeight()}
    onChange={(e) => setBodyweight(parseInt(e.currentTarget.value))}
    >
    {[...Array(71).keys()].map((n) => {
      const weight = unit() == "KG" ? 50 + n : 110 + 2 * n;
      return <option value={weight}>{weight}</option>;
    })}
    </select>
    </div>
    </div>

    <h1 class="text-3xl font-black text-center">Rep Max calculator</h1>
    <h3 class="font-bold text-center">(Weighted Dips)</h3>
    <form
    class="border-gray-800 grid gap-4 py-4 rounded-lg"
    onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }}
    >
    <form.Field
    name="reps"
    validators={{
      onChange: ({ value }) =>
      !value ? 'Reps is required' :
        value < 0 ? 'input a higher rep amount' :
        value > 50 ? 'input a lower rep amount' : undefined,
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
      <Show when={field().state.meta.errors[0]}><p>{field().state.meta.errors[0]}</p></Show>
      </label>
    )}
    />

    <form.Field
    name="extraweight"
    validators={{
      onChange: ({ value }) =>
      !value ? 'Extraweight is required' :
        value < 0 ? 'input a valid weight' :
        value > 140 ? 'input a valid weight' : undefined,
    }}
    children={(field) => (
      <label for={field().name} class="grid">
      <span class="text-sm font-medium text-gray-700">Extra Weight</span>
      <input
      name={field().name}
      value={field().state.value}
      onBlur={field().handleBlur}
      type="number"
      onInput={(e) => field().handleChange(e.target.valueAsNumber)}
      class="p-2 bg-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <Show when={field().state.meta.errors[0]}><p>{field().state.meta.errors[0]}</p></Show>
      </label>
    )}
    />
    <button type="submit" class="border-2 border-gray-600 px-8 py-4 rounded-md font-bold">CALCULATE</button>
    <Show when={onerepmax() != 0}>
    <div class="text-3xl">1RM: <span class="font-bold">{onerepmax()} {unit()}s</span></div>
    <div class="text-xl grid gap-2 mt-4">
    <p>3RM: <span class="font-bold">{calcXrm(onerepmax(), bodyWeight(), 3)} {unit()}s</span></p>
    <p>5RM: <span class="font-bold">{calcXrm(onerepmax(), bodyWeight(), 5)} {unit()}s</span></p>
    <p>7RM: <span class="font-bold">{calcXrm(onerepmax(), bodyWeight(), 7)} {unit()}s</span></p>
    <p>9RM: <span class="font-bold">{calcXrm(onerepmax(), bodyWeight(), 9)} {unit()}s</span></p>
    </div>
    </Show>
    </form>
    </div>
  );
}

