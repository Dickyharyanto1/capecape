export default {
  async fetch(request, env, ctx) {
    // File ini akan meneruskan request ke Pages Functions
    return await env.ASSETS.fetch(request);
  }
};
