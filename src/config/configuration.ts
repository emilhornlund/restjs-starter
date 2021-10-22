export default () => ({
  http: {
    port: parseInt(process.env.HTTP_PORT, 10),
  },
});
