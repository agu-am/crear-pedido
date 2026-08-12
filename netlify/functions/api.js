import serverless from "serverless-http";
import app from "../../server/app.js";

export const config = {
  timeout: 26,
};

const wrapped = serverless(app);

// Netlify entrega event.path con el prefijo /.netlify/functions/api
export const handler = (event, context) => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, "") || "/";
  return wrapped({ ...event, path }, context);
};
