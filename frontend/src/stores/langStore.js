import { defineStore } from "pinia";
import { dictionary } from "../utils/i18n";

export const useLangStore = defineStore("lang", {
  state: () => ({
    currentLang: localStorage.getItem("lang") || "VI",
  }),
  getters: {
    isEnglish: (state) => state.currentLang === "EN",
  },
  actions: {
    toggleLang() {
      this.currentLang = this.currentLang === "VI" ? "EN" : "VI";
      localStorage.setItem("lang", this.currentLang);
    },
    setLang(lang) {
      this.currentLang = lang;
      localStorage.setItem("lang", lang);
    },
    t(path) {
      const keys = path.split(".");
      let result = dictionary[this.currentLang];
      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          return path;
        }
      }
      return result;
    },
  },
});
