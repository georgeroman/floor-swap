# Floor Swap

NFT floor orders powered by 0x v3.

#### Setup

The app depends on a Postgres database instance. This is conveniently provided via `docker-compose` when running locally and can be boot up via `docker-compose up`. Before running, make sure to expose the `DATABASE_URL` environment variable (see `.env.example`) which is needed for running/checking the database migration. Afterwards, install dependencies via `npm install` and start a local instance via `npm run dev`.
