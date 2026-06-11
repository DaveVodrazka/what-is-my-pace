import { registerHandlers } from "./registrar";
import { loadState } from "./state";

function init() {
  loadState();
  registerHandlers();
}

init();
