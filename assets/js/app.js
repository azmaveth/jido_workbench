// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";
import CopyToClipboard from "./hooks/copy_to_clipboard";
import Highlight from "./hooks/highlight";
import ColorSchemeHook from "./hooks/color-scheme-hook";
import ScrollSpy from "./hooks/scroll_spy";

// Menu state persistence hooks
const PersistMenuState = {
  mounted() {
    this.el.addEventListener("menu:toggled", (e) => {
      const menuKey = e.detail.key;
      const submenuId = e.target.getAttribute("data-submenu-id");
      const isOpen =
        document.getElementById(submenuId).style.display !== "none";
      localStorage.setItem(menuKey, isOpen);
    });
  },
};

const InitMenuState = {
  mounted() {
    const menuKey = this.el.getAttribute("data-menu-key");
    const isOpen = localStorage.getItem(menuKey) === "true";

    if (isOpen) {
      this.el.style.display = "block";
      // Find and rotate the associated icon
      const parentButton = this.el.previousElementSibling;
      const icon = parentButton.querySelector("svg");
      if (icon) {
        icon.classList.add("rotate-90");
      }
    } else {
      this.el.style.display = "none";
    }
  },
};

let Hooks = {
  CopyToClipboard,
  Highlight,
  ColorSchemeHook,
  ScrollSpy,
  PersistMenuState,
  InitMenuState,
};

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  params: { _csrf_token: csrfToken },
  dom: {
    onBeforeElUpdated(from, to) {
      if (from._x_dataStack) {
        window.Alpine.clone(from, to);
      }
    },
  },
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;
