import {
  html,
  render,
  Component,
} from "https://cdn.jsdelivr.net/npm/htm@3.1.0/preact/standalone.module.js";
import {
  range,
  isEqual,
} from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js";

class App extends Component {
  state = {
    isCuboid: true,
    isBordered: true,
    isIsometric: true,
    isOffset: true,
    isLabeled: true,
    avatarPosition: { x: 0, y: 0 },
  };

  linkEventListener(stateKey, element) {
    const listener = () => {
      this.setState({
        [stateKey]: !!element.checked,
      });
    };

    element.addEventListener("change", listener);
    element.addEventListener("load", listener);

    return listener();
  }

  componentDidMount() {
    this.linkEventListener("isCuboid", document.getElementById("is-cuboid"));
    this.linkEventListener(
      "isBordered",
      document.getElementById("is-bordered")
    );
    this.linkEventListener(
      "isIsometric",
      document.getElementById("is-isometric")
    );
    this.linkEventListener("isOffset", document.getElementById("is-offset"));
    this.linkEventListener("isLabeled", document.getElementById("is-labeled"));
  }

  render(
    {},
    { isCuboid, isBordered, isIsometric, isOffset, isLabeled, avatarPosition }
  ) {
    return HexGrid({
      height: 7,
      width: 7,
      isCuboid,
      isBordered,
      isIsometric,
      isOffset,
      isLabeled,

      avatarPosition,
      onTileClick: (avatarPosition) => {
        this.setState({ avatarPosition });
      },
    });
  }
}

function HexGrid({
  width,
  height,
  isCuboid,
  isBordered,
  isIsometric,
  isOffset,
  isLabeled,
  avatarPosition,
  onTileClick,
}) {
  return html`<div
    class="hex-grid ${isIsometric && "is-isometric"} ${isOffset &&
    "is-offset-even-r"} ${isBordered && "is-bordered"} ${isCuboid &&
    "is-cuboid"} ${isLabeled && "is-labeled"}"
  >
    ${range(height).map(
      (y) =>
        html`<div class="grid-row">
          ${range(width).map(
            (x) => html`<div
              class="grid-col at-${y}-${x}"
              onClick=${() => onTileClick && onTileClick({ x, y })}
            >
              ${isEqual(avatarPosition, { x, y })
                ? html`<img src="images/alien.png" />`
                : html`<label>${y}:${x}</label>`}
            </div>`
          )}
        </div>`
    )}
  </div>`;
}

render(html` <${App} />`, document.getElementById("app"));
