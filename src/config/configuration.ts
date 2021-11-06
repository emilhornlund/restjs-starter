export default () => ({
  env: process.env.NODE_ENV,
  http: {
    port: parseInt(process.env.HTTP_PORT, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
  },
});
