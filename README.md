# Floor Swap

NFT floor orders powered by 0x v3 [property-based orders](https://github.com/0xProject/0x-protocol-specification/blob/master/order-types/property-based.md).

Verifier contracts:

- mainnet: https://etherscan.io/address/0x1f9cefbd982de43be11f24c671e0504b31e36414#code
- rinkeby: https://rinkeby.etherscan.io/address/0x4c0d3aFcA131bC9723E91f08C898ceaAf98953a0#code

#### Setup

The app depends on a Postgres database instance. This is conveniently provided via `docker-compose` when running locally and can be boot up via `docker-compose up`. Before running, make sure to expose the `DATABASE_URL` environment variable (see `.env.example`) which is needed for running/checking the database migration. Afterwards, install dependencies via `npm install` and start a local instance via `npm run dev`.
