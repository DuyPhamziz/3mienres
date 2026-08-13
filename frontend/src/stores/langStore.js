import { defineStore } from "pinia";

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
  },
});
