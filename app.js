import {
  html,
  render,
  Component,
} from "https://cdn.jsdelivr.net/npm/htm@3.1.0/preact/standalone.module.js";

import {
  match,
  P,
} from "https://cdn.jsdelivr.net/npm/ts-pattern@4.0.1/dist/index.module.js";

/**
 * Returns an array containing all integers in the range `[0, n)`.
 * @param n The non-inclusive upper bound of the range.
 * @returns {number[]} An array containing all integers in the range `[0, n)`.
 */
const range = (n) => [...Array(n).keys()];

/**
 * Determines whether two objects are equal.
 * Their keys must be in the same order.
 * @param left An object.
 * @param right An object to compare against.
 * @returns {boolean} Whether the objects are equal.
 */
const isEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

class App extends Component {
  state = {
    avatarPosition: { x: 0, y: 0 },
  };

  render({}, { avatarPosition }) {
    const getTileContent = (at) => {
      const characterEmbed = html`<embed
        type="image/svg+xml"
        width="96"
        height="96"
        class="is-2d"
        alt="adventurer"
        title="adventurer"
        src="images/adventurer.svg"
      />`;

      return isEqual(at, avatarPosition) ? characterEmbed : "";
    };

    const onTileClick = (avatarPosition) => {
      this.setState({ avatarPosition });
    };

    return Grid({
      height: 10,
      width: 10,
      onTileClick,
      getTileContent,
    });
  }
}

function Grid({ width, height, onTileClick, getTileContent }) {
  return html`<div class="n9-grid is-offset is-isometric is-cuboid">
    ${range(height).map(
      (y) =>
        html`<div class="grid-row">
          ${range(width).map(
            (x) => html`<div
              class="grid-col"
              onClick=${() => onTileClick && onTileClick({ x, y })}
            >
              ${getTileContent({ x, y })}
            </div>`
          )}
        </div>`
    )}
  </div>`;
}

render(html`<${App} />`, document.getElementById("app"));
