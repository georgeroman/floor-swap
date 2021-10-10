import { Collection } from "./types";

import collections from "../data/collections.json";

export default collections as unknown as { [slug: string]: Collection };
