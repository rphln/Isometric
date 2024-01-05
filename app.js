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
    tiles: {},
  };

  componentDidMount() {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${scheme}://${window.location.host}/api`;

    this.ws = new WebSocket(url);
    this.ws.addEventListener("message", (event) => {
      const { type, state, team, events } = JSON.parse(event.data);

      switch (type) {
        case "Bootstrap":
          return this.#bootstrap({ ...state, team });
        case "History":
          return this.#history(events);
      }
    });
  }

  #bootstrap(content) {
    const tiles = {};
    for (const character of Object.values(content.characters)) {
      const [y, x] = character.position;
      tiles[`${x}:${y}`] = character;
    }

    this.setState({ ...content, tiles });

    console.log(content);
  }

  #history(content) {
    console.log(content);
  }

  render({}, state) {
    const current = state.queue?.[0]?.character;

    const onTileClick = ({ x, y }) => {
      const selected = `${x}:${y}`;
      const current = state.queue?.[0]?.character;

      let message;

      if (!state.tiles[selected]?.key) {
        message = { type: "Move", position: [y, x] };
      } else if (state.tiles[selected]?.key === current) {
        message = { type: "Wait" };
      } else {
        message = { type: "Attack", position: [y, x] };
      }

      this.ws.send(JSON.stringify(message));
    };

    const getTileContent = ({ x, y }) => {
      const key = `${x}:${y}`;
      const character = state.tiles[key];

      const healthiness = 100 * (1 - character?.damage / character?.health);

      const characterEmbed = html`<div
        class="is-2d"
        style=${{
          "pointer-events": "none",
          opacity: current !== character?.key ? "50%" : "100%",
          "z-index": "100",
        }}
      >
        <img
          width="96"
          height="96"
          alt="${character?.name}"
          title="${character?.name}"
          src="assets/characters/${character?.name}.png"
          class="my-1"
        />
        <div
          style=${{
            width: "80%",
            height: "8px",
            background: "var(--bs-danger)",
            margin: "0 auto",
            border: "2px solid var(--bs-dark)",
          }}
        >
          <div
            style=${{
              width: `${healthiness}%`,
              height: "100%",
              background:
                character?.team === state.team
                  ? "var(--bs-success)"
                  : "var(--bs-warning)",
            }}
          ></div>
        </div>
      </div>`;

      // return isEqual(at, avatarPosition) ? characterEmbed : "";
      return !character ? "" : characterEmbed;
    };

    return Grid({
      height: 5,
      width: 5,
      selected: state.selected,
      queue: state.queue,
      characters: state.characters,
      onTileClick,
      getTileContent,
    });
  }
}

function Grid({
  width,
  height,
  onTileClick,
  getTileContent,
  selected,
  queue,
  characters,
}) {
  const sortedQueue = queue?.sort((a, b) => {
    const { round: a_round, priority: a_priority } = a;
    const { round: b_round, priority: b_priority } = b;

    if (a_round < b_round) {
      return -1;
    } else if (a_round > b_round) {
      return 1;
    } else {
      return a_priority - b_priority;
    }
  });

  const groupedQueue =
    sortedQueue?.reduce((acc, { round, priority, character }) => {
      if (!acc[round]) {
        acc[round] = [];
      }

      acc[round].push(character);

      return acc;
    }, {}) || {};

  return html`
    <div class="d-flex flex-row">
      ${Object.entries(groupedQueue).map(([_, round]) => {
        return html`<div
          class="d-flex flex-row rpgui-container framed position-relative"
        >
          ${round.map((key) => {
            const character = characters[key];
            return html`<div class="">
              <img
                width="48"
                height="48"
                src="assets/characters/avatar-${character?.name}.png"
                class="mx-2"
                alt="${character?.name}"
                title="${character?.name}"
              />
            </div>`;
          })}
        </div> `;
      })}
    </div>
    <div class="n9-grid is-isometric is-cuboid">
      ${range(height).map(
        (y) =>
          html`<div class="grid-row">
            ${range(width).map(
              (x) =>
                html`<div
                  class="grid-col ${`${x}:${y}` == selected ? "is-raised" : ""}"
                  onClick=${() => onTileClick && onTileClick({ x, y })}
                >
                  ${getTileContent({ x, y })}
                </div>`,
            )}
          </div>`,
      )}
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("app"));
