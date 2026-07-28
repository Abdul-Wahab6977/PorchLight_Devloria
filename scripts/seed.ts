/**
 * Seed the Porchlight database with demo data.
 * Run with: npm run seed
 */
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { createUser, getUserByEmail, createProperty, toggleFavorite, createSavedSearch, createInquiry } from "../src/lib/queries";

const DB_FILE = path.join(process.cwd(), "data", "porchlight.sqlite3");

const AGENTS = [
  { name: "Maren Okafor", email: "agent@porchlight.dev", phone: "415-555-0142" },
  { name: "Theo Ashworth", email: "theo@porchlight.dev", phone: "512-555-0188" },
];

const BUYERS = [
  { name: "Priya Shah", email: "buyer@porchlight.dev", phone: "206-555-0120" },
];

const IMG = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

const LISTINGS: Array<{
  title: string;
  description: string;
  price: number;
  propertyType: "SINGLE_FAMILY" | "APARTMENT" | "CONDO" | "TOWNHOUSE" | "LAND";
  status: "FOR_SALE" | "PENDING" | "SOLD";
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  images: string[];
}> = [
  {
    title: "Sunlit Craftsman near the Arboretum",
    description:
      "A lovingly restored 1920s craftsman with original woodwork, a wraparound porch, and a chef's kitchen opening onto a deep backyard. Steps from the arboretum and the Sunday farmers market.",
    price: 875000,
    propertyType: "SINGLE_FAMILY",
    status: "FOR_SALE",
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2350,
    lotSize: 5200,
    yearBuilt: 1924,
    address: "482 Larkspur Ave",
    city: "Seattle",
    state: "WA",
    zip: "98112",
    images: [IMG("photo-1568605114967-8130f3a36994"), IMG("photo-1600585154340-be6161a56a0c"), IMG("photo-1600607687939-ce8a6c25118c")],
  },
  {
    title: "Glass-Walled Modern on the Ridge",
    description:
      "Architect-designed with floor-to-ceiling glass, radiant floors, and a cantilevered deck overlooking the valley. Smart-home wired throughout, three-car garage, and a home office wing.",
    price: 1650000,
    propertyType: "SINGLE_FAMILY",
    status: "FOR_SALE",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4100,
    lotSize: 9800,
    yearBuilt: 2019,
    address: "17 Ridgeline Ct",
    city: "Austin",
    state: "TX",
    zip: "78746",
    images: [IMG("photo-1600596542815-ffad4c1539a9"), IMG("photo-1600047509807-ba8f99d2cdde"), IMG("photo-1600210492486-724fe5c67fb0")],
  },
  {
    title: "Downtown Loft with Skyline Views",
    description:
      "Exposed brick, 12-foot ceilings, and a wall of west-facing windows in this converted textile mill. Building has a rooftop deck, gym, and secure bike storage. Walk to everything.",
    price: 3200,
    propertyType: "APARTMENT",
    status: "FOR_SALE",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 920,
    yearBuilt: 1908,
    address: "210 Mill St, Unit 5B",
    city: "Chicago",
    state: "IL",
    zip: "60607",
    images: [IMG("photo-1502672260266-1c1ef2d93688"), IMG("photo-1493809842364-78817add7ffb")],
  },
  {
    title: "Garden Condo by the Greenway",
    description:
      "Ground-floor two-bedroom with a private patio opening onto shared gardens. Updated kitchen, in-unit laundry, and one deeded parking spot. HOA covers water, landscaping, and roof.",
    price: 415000,
    propertyType: "CONDO",
    status: "FOR_SALE",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1120,
    yearBuilt: 2005,
    address: "88 Greenway Path, Unit 3",
    city: "Portland",
    state: "OR",
    zip: "97214",
    images: [IMG("photo-1560448204-e02f11c3d0e2"), IMG("photo-1560185127-6ed189bf02f4")],
  },
  {
    title: "Brick Townhouse with Rooftop Terrace",
    description:
      "Three-story townhouse with a finished lower level, attached garage, and a private rooftop terrace plumbed for a summer kitchen. Newly renovated primary suite with a soaking tub.",
    price: 749000,
    propertyType: "TOWNHOUSE",
    status: "PENDING",
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 2100,
    yearBuilt: 2011,
    address: "56 Cobblestone Row",
    city: "Boston",
    state: "MA",
    zip: "02118",
    images: [IMG("photo-1570129477492-45c003edd2be"), IMG("photo-1583608205776-bfd35f0d9f83")],
  },
  {
    title: "Mid-Century Ranch, Fully Updated",
    description:
      "Single-level ranch with an open post-and-beam living room, refinished terrazzo floors, and a resurfaced pool. New roof and HVAC in 2023. Zoned for the top elementary school in the district.",
    price: 695000,
    propertyType: "SINGLE_FAMILY",
    status: "FOR_SALE",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    lotSize: 7500,
    yearBuilt: 1962,
    address: "1204 Palomino Dr",
    city: "Phoenix",
    state: "AZ",
    zip: "85018",
    images: [IMG("photo-1512917774080-9991f1c4c750"), IMG("photo-1524758631624-e2822e304c36")],
  },
  {
    title: "Waterfront Cottage on Cedar Lake",
    description:
      "A four-season cottage with 60 feet of private shoreline, a screened porch, and a detached bunkhouse. Dock included. Twenty minutes from town, fully off-grid capable with solar and backup generator.",
    price: 540000,
    propertyType: "SINGLE_FAMILY",
    status: "FOR_SALE",
    bedrooms: 3,
    bathrooms: 1.5,
    sqft: 1400,
    lotSize: 18000,
    yearBuilt: 1978,
    address: "9 Shoreline Ln",
    city: "Duluth",
    state: "MN",
    zip: "55804",
    images: [IMG("photo-1449844908441-8829872d2607"), IMG("photo-1518780664697-55e3ad937233")],
  },
  {
    title: "Sold: Historic Row House Restoration",
    description:
      "A fully restored 1890s row house — this one just closed, shown here as a recent sale example. Original details preserved throughout with a modern kitchen and bath.",
    price: 612000,
    propertyType: "TOWNHOUSE",
    status: "SOLD",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1780,
    yearBuilt: 1891,
    address: "34 Federal St",
    city: "Baltimore",
    state: "MD",
    zip: "21201",
    images: [IMG("photo-1568792923760-d70635a89fdc")],
  },
  {
    title: "Buildable Lot Overlooking the Vineyard",
    description:
      "1.6-acre parcel with vineyard views, perc-tested and ready to build, on a paved road with utilities at the lot line. Sketch plans from a local architect available on request.",
    price: 225000,
    propertyType: "LAND",
    status: "FOR_SALE",
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    lotSize: 69696,
    address: "0 Vineyard View Rd",
    city: "Napa",
    state: "CA",
    zip: "94558",
    images: [IMG("photo-1500382017468-9049fed747ef")],
  },
  {
    title: "Compact Studio, Steps to the Metro",
    description:
      "Efficient studio layout with a Murphy bed, full kitchen, and floor-to-ceiling storage. Building amenities include a fitness room and package concierge. Ideal starter home or investment.",
    price: 265000,
    propertyType: "CONDO",
    status: "FOR_SALE",
    bedrooms: 0,
    bathrooms: 1,
    sqft: 540,
    yearBuilt: 2016,
    address: "500 Transit Plaza, Unit 812",
    city: "Denver",
    state: "CO",
    zip: "80202",
    images: [IMG("photo-1522708323590-d24dbb6b0267")],
  },
];

async function ensureUser(input: { name: string; email: string; phone?: string; role: "AGENT" | "BUYER" }) {
  const existing = await getUserByEmail(input.email);
  if (existing) return existing.id;
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await createUser({ ...input, passwordHash });
  return user.id;
}

async function main() {
  if (fs.existsSync(DB_FILE)) {
    console.log("ℹ︎  Existing database found — seed will add to it (safe to re-run).");
  }

  const agentIds: string[] = [];
  for (const a of AGENTS) agentIds.push(await ensureUser({ ...a, role: "AGENT" }));

  const buyerIds: string[] = [];
  for (const b of BUYERS) buyerIds.push(await ensureUser({ ...b, role: "BUYER" }));

  console.log(`✔ Users ready (${agentIds.length} agents, ${buyerIds.length} buyers)`);

  const propertyIds: string[] = [];
  for (let i = 0; i < LISTINGS.length; i++) {
    const agentId = agentIds[i % agentIds.length];
    const id = await createProperty({ agentId, ...LISTINGS[i] });
    propertyIds.push(id);
  }
  console.log(`✔ ${propertyIds.length} listings published`);

  if (buyerIds[0]) {
    await toggleFavorite(buyerIds[0], propertyIds[0]);
    await toggleFavorite(buyerIds[0], propertyIds[2]);
    await createSavedSearch(buyerIds[0], "Seattle homes under $1M", {
      city: "Seattle",
      maxPrice: 1000000,
      propertyType: "SINGLE_FAMILY",
    });
    await createSavedSearch(buyerIds[0], "Move-in ready condos", {
      propertyType: "CONDO",
      minBeds: 1,
    });
    console.log("✔ Sample favorites + saved searches added");

    await createInquiry({
      propertyId: propertyIds[0],
      agentId: agentIds[0],
      buyerId: buyerIds[0],
      name: BUYERS[0].name,
      email: BUYERS[0].email,
      phone: BUYERS[0].phone,
      message: "Is this still available? I'd love to see it this weekend if possible.",
    });
    console.log("✔ Sample inquiry added");
  }

  console.log("\nDone. Demo logins (password: password123):");
  for (const a of AGENTS) console.log(`  agent · ${a.email}`);
  for (const b of BUYERS) console.log(`  buyer · ${b.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
