import { onRequestPost as __api_kontakt_js_onRequestPost } from "/Users/petomraz/LAB/001projects/mrazosoft/functions/api/kontakt.js"
import { onRequest as __api_kontakt_js_onRequest } from "/Users/petomraz/LAB/001projects/mrazosoft/functions/api/kontakt.js"

export const routes = [
    {
      routePath: "/api/kontakt",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_kontakt_js_onRequestPost],
    },
  {
      routePath: "/api/kontakt",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_kontakt_js_onRequest],
    },
  ]