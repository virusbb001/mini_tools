import { createEffect, createSignal } from 'solid-js'
import './App.css'

const initialFont = "Fira Code,Hack, monospace";

function App() {
  const fontSizeRectColor = "rgba(255, 0, 0, 0.5)";
  const fontBoundingBoxColor = "rgba(0, 255, 0, 0.5)";
  const actualBoundingBoxColor = "rgba(0, 0, 255, 0.5)";

  const canvas = <canvas width="900" height="160" />;
  const ctx = canvas.getContext("2d");

  const [fontSize, setFontSize] = createSignal(50);
  const [fontFamily, setFontFamily] = createSignal(initialFont);
  const [renderText, setRenderText] = createSignal("ABCmあいう🇻y∮🆙");
  const baselines: CanvasTextBaseline[] = [
    "top",
    "hanging",
    "middle",
    "alphabetic",
    "ideographic",
    "bottom"
  ]
  const [baseline, setBaseline] = createSignal(baselines[2]);
  const [textMetrics, setTextMetrics]= createSignal("");
  const [renderRect, setRenderRect] = createSignal<RenderRect>({height: 0, widthSingle: 0, widthDouble: 0});

  const htmlPreviewStyle = () => {
    return {
      "font-family": fontFamily(),
      "font-size": `${fontSize()}px`,
    }
  }
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  if (!ctx) {
    throw new Error("failed to get context");
  }
  createEffect(() => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.font = `${fontSize()}px ${fontFamily()}`;
    ctx.textBaseline = baseline();

    const y = Math.floor(canvasHeight / 2);
    ctx.strokeStyle = "rgba(0, 0, 0, .1)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();

    const metrix = ctx.measureText(renderText());
    const actualHeight = metrix.actualBoundingBoxAscent+metrix.actualBoundingBoxDescent;
    const fontHeight = metrix.fontBoundingBoxAscent + metrix.fontBoundingBoxDescent;

    ctx.strokeStyle = fontSizeRectColor;
    ctx.strokeRect(0, y - Math.floor(fontSize()/2), canvasWidth, fontSize());

    // fontHeight
    ctx.strokeStyle =fontBoundingBoxColor;
    ctx.strokeRect(0, y - metrix.fontBoundingBoxAscent, canvasWidth, fontHeight);
    // actual
    ctx.strokeStyle = actualBoundingBoxColor;
    ctx.strokeRect(0, y - metrix.actualBoundingBoxAscent, canvasWidth, fontSize());

    ctx.fillStyle = "black";
    ctx.fillText(renderText(), 0, y);

    const metricsText = stringifyTextMetrics(metrix) + `actualHeight: ${actualHeight}\nfontHeight: ${fontHeight}\n`;
    setTextMetrics(metricsText);
    setRenderRect(calculateRenderRect(ctx, ["A", "m", "あ", "い", "👪", "🆙"]));
  });

  return (
    <>
      <details open>
        <summary>control panels</summary>
        <form action="#">
          <label>size:
            <input
              type="number"
              value={fontSize()}
              onInput={e => setFontSize(Number(e.target.value))}
            />
            px
          </label>
          <br />
          <label>
            font:
            <input
              type="text"
              value={fontFamily()}
              onInput={e => setFontFamily(e.target.value)}
            />
          </label>
          <br />
          RenderText: <br />
          <textarea
            rows="3"
            onInput={e => setRenderText(e.target.value)}
          >
            {renderText()}
          </textarea>
          <br />
          textBaseline:
          <select
            value={baseline()}
            onInput={e => setBaseline(e.currentTarget.value as CanvasTextBaseline)}
          >
            {
              baselines.map(b => {
                return <option value={b}>{b}</option>
              })
            }
          </select>
          <br />
        </form>
      </details>
      Info:
      <div>
        height: {renderRect().height }
        <br />
        widthSingle: {renderRect().widthSingle }
        <br />
        widthDouble: {renderRect().widthDouble }
      </div>
      <hr />
      <div class="metrics">
        {textMetrics()}
      </div>
      {canvas}
      <div style={htmlPreviewStyle()}>
        {renderText()}
      </div>
    </>
  )
}

export function stringifyTextMetrics(metrics: TextMetrics): string {
  let results = "";
  for (let key in metrics) {
    results += `${key}: ${metrics[key as keyof TextMetrics]}\n`
  }
  return results;
}

interface RenderRect {
  height: number,
  widthSingle: number,
  widthDouble: number,
}

function calculateRenderRect (
  ctx: CanvasRenderingContext2D,
  sampleCharacters: string[],
): RenderRect {
  return sampleCharacters.reduce((prev, targetCh) => {
    const measure = ctx.measureText(targetCh);
    const height = Math.max(
      prev.height,
      measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent,
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent,
    );
    const charCode = targetCh.charCodeAt(0);
    // if character is in ASCII, it should single width character.
    const isSingle = charCode <= 0x7F;
    const widthSingle = Math.max(
      prev.widthSingle,
      isSingle ? measure.width : 0
    );
    const widthDouble = Math.max(
      prev.widthDouble,
      isSingle ? 0 : measure.width
    );
    return {
      height,
      widthSingle,
      widthDouble,
    }
  }, {
      height: 0,
      widthSingle: 0,
      widthDouble: 0,
  });
}

export default App
