import joplin from "api";
import { SettingItemType } from "api/types";

async function initCustomSettings() {
  await joplin.settings.registerSettings({
    toggleView: {
      value: "list",
      type: SettingItemType.String,
      label: "Toggle between list and tree view",
      public: true,
    },
    togglePanel: {
      value: false,
      type: SettingItemType.Bool,
      label: "Toggle between opening and closing AI Summarisation Panel",
      public: true,
    }
  });
}

module.exports = {
  initCustomSettings,
};
