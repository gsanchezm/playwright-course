export type RunState = "idle" | "running" | "passed";

type Props = {
  state: RunState;
  testName: string;
};

const Spinner = (
  <span
    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-code-base/30 border-t-code-string animate-qaa-spin"
    aria-hidden="true"
  />
);

/** Panel TERMINAL del editor: idle / running / passed (siempre oscuro). */
export default function Terminal({ state, testName }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-code-border bg-code-bg">
      <div className="flex items-center gap-2 border-b border-code-border bg-[#0b1220] px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-code-base/60">
          Terminal
        </span>
        {state === "passed" && (
          <span className="ml-auto font-mono text-[11px] text-code-success">
            ✓ 1 passed
          </span>
        )}
      </div>

      <div className="px-4 py-4 font-mono text-[12.5px] leading-[1.8]">
        {state === "idle" && (
          <p className="text-code-base/60">
            <span className="text-code-comment">$ </span>
            Pulsa «Correr tests» para ejecutar el spec.
          </p>
        )}

        {state === "running" && (
          <div className="space-y-1">
            <p className="text-code-base">
              <span className="text-code-comment">$ </span>
              <span className="text-code-keyword">npx</span> playwright test
            </p>
            <p className="flex items-center gap-2 text-code-base">
              {Spinner}
              Ejecutando {testName}…
            </p>
          </div>
        )}

        {state === "passed" && (
          <div className="space-y-1">
            <p className="text-code-base">
              <span className="text-code-comment">$ </span>
              <span className="text-code-keyword">npx</span> playwright test
            </p>
            <p className="text-code-success">✓ {testName}</p>
            <p className="text-code-base">
              <span className="text-code-success">1 passed</span>{" "}
              <span className="text-code-comment">(1.2s)</span>
              <span
                className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-code-success animate-qaa-blink"
                aria-hidden="true"
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
