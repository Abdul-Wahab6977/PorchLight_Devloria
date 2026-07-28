import { all, get, run } from "./db";
import { makeId } from "./ids";
import type {
  Favorite,
  Inquiry,
  Property,
  PropertyImage,
  PropertyWithExtras,
  PublicUser,
  SavedSearch,
  SearchCriteria,
  User,
} from "./types";

// ----------------------------- USERS ----------------------------------------

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: User["role"];
  phone?: string | null;
}): Promise<PublicUser> {
  const id = makeId("usr");
  await run(
    `INSERT INTO users (id, name, email, password_hash, role, phone, avatar_seed)
     VALUES ($id, $name, $email, $hash, $role, $phone, $seed)`,
    {
      $id: id,
      $name: input.name,
      $email: input.email.toLowerCase(),
      $hash: input.passwordHash,
      $role: input.role,
      $phone: input.phone ?? null,
      $seed: id,
    }
  );
  return getUserById(id) as Promise<PublicUser>;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return get<User>(`SELECT * FROM users WHERE email = $email`, {
    $email: email.toLowerCase(),
  });
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const row = await get<User>(`SELECT * FROM users WHERE id = $id`, { $id: id });
  if (!row) return null;
  const { password_hash, ...pub } = row;
  return pub;
}

// --------------------------- PROPERTIES -------------------------------------

export async function createProperty(input: {
  agentId: string;
  title: string;
  description: string;
  price: number;
  propertyType: Property["property_type"];
  status: Property["status"];
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number | null;
  yearBuilt?: number | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number | null;
  lng?: number | null;
  images: string[];
}): Promise<string> {
  const id = makeId("prp");
  await run(
    `INSERT INTO properties
      (id, agent_id, title, description, price, property_type, status, bedrooms,
       bathrooms, sqft, lot_size, year_built, address, city, state, zip, lat, lng)
     VALUES
      ($id, $agentId, $title, $description, $price, $propertyType, $status, $bedrooms,
       $bathrooms, $sqft, $lotSize, $yearBuilt, $address, $city, $state, $zip, $lat, $lng)`,
    {
      $id: id,
      $agentId: input.agentId,
      $title: input.title,
      $description: input.description,
      $price: input.price,
      $propertyType: input.propertyType,
      $status: input.status,
      $bedrooms: input.bedrooms,
      $bathrooms: input.bathrooms,
      $sqft: input.sqft,
      $lotSize: input.lotSize ?? null,
      $yearBuilt: input.yearBuilt ?? null,
      $address: input.address,
      $city: input.city,
      $state: input.state,
      $zip: input.zip,
      $lat: input.lat ?? null,
      $lng: input.lng ?? null,
    }
  );

  await setPropertyImages(id, input.images);
  return id;
}

export async function updateProperty(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    price: number;
    propertyType: Property["property_type"];
    status: Property["status"];
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    lotSize: number | null;
    yearBuilt: number | null;
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number | null;
    lng: number | null;
    images: string[];
  }>
) {
  const fields: string[] = [];
  const params: Record<string, unknown> = { $id: id };
  const map: Record<string, string> = {
    title: "title",
    description: "description",
    price: "price",
    propertyType: "property_type",
    status: "status",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    sqft: "sqft",
    lotSize: "lot_size",
    yearBuilt: "year_built",
    address: "address",
    city: "city",
    state: "state",
    zip: "zip",
    lat: "lat",
    lng: "lng",
  };

  for (const [key, column] of Object.entries(map)) {
    if (key in input) {
      const paramKey = `$${key}`;
      fields.push(`${column} = ${paramKey}`);
      params[paramKey] = (input as any)[key];
    }
  }
  fields.push(`updated_at = datetime('now')`);

  if (fields.length) {
    await run(`UPDATE properties SET ${fields.join(", ")} WHERE id = $id`, params);
  }

  if (input.images) {
    await setPropertyImages(id, input.images);
  }
}

export async function deleteProperty(id: string) {
  await run(`DELETE FROM properties WHERE id = $id`, { $id: id });
}

async function setPropertyImages(propertyId: string, urls: string[]) {
  await run(`DELETE FROM property_images WHERE property_id = $id`, { $id: propertyId });
  for (let i = 0; i < urls.length; i++) {
    if (!urls[i]) continue;
    await run(
      `INSERT INTO property_images (id, property_id, url, position) VALUES ($id, $pid, $url, $pos)`,
      { $id: makeId("img"), $pid: propertyId, $url: urls[i], $pos: i }
    );
  }
}

async function hydrateProperties(
  rows: (Property & { agent_name: string; agent_email: string; agent_phone: string | null })[],
  viewerId?: string | null
): Promise<PropertyWithExtras[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map((_, i) => `$id${i}`).join(",");
  const imgParams: Record<string, unknown> = {};
  ids.forEach((id, i) => (imgParams[`$id${i}`] = id));

  const images = await all<PropertyImage>(
    `SELECT * FROM property_images WHERE property_id IN (${placeholders}) ORDER BY position ASC`,
    imgParams
  );

  let favoritedSet = new Set<string>();
  if (viewerId) {
    const favs = await all<{ property_id: string }>(
      `SELECT property_id FROM favorites WHERE user_id = $uid AND property_id IN (${placeholders})`,
      { $uid: viewerId, ...imgParams }
    );
    favoritedSet = new Set(favs.map((f) => f.property_id));
  }

  const imagesByProperty = new Map<string, PropertyImage[]>();
  for (const img of images) {
    const list = imagesByProperty.get(img.property_id) ?? [];
    list.push(img);
    imagesByProperty.set(img.property_id, list);
  }

  return rows.map((row) => ({
    ...row,
    images: imagesByProperty.get(row.id) ?? [],
    is_favorited: favoritedSet.has(row.id),
  }));
}

const AGENT_JOIN = `
  SELECT p.*, u.name AS agent_name, u.email AS agent_email, u.phone AS agent_phone
  FROM properties p
  JOIN users u ON u.id = p.agent_id
`;

export async function getPropertyById(
  id: string,
  viewerId?: string | null
): Promise<PropertyWithExtras | null> {
  const row = await get<Property & { agent_name: string; agent_email: string; agent_phone: string | null }>(
    `${AGENT_JOIN} WHERE p.id = $id`,
    { $id: id }
  );
  if (!row) return null;
  const [hydrated] = await hydrateProperties([row], viewerId);
  return hydrated;
}

/** The core search/filter engine — builds a parameterized SQL query from criteria. */
export async function searchProperties(
  criteria: SearchCriteria,
  viewerId?: string | null
): Promise<{ results: PropertyWithExtras[]; total: number }> {
  const where: string[] = [];
  const params: Record<string, unknown> = {};

  if (criteria.q) {
    where.push(`(p.title LIKE $q OR p.city LIKE $q OR p.address LIKE $q OR p.zip LIKE $q)`);
    params.$q = `%${criteria.q}%`;
  }
  if (criteria.city) {
    where.push(`p.city LIKE $city`);
    params.$city = `%${criteria.city}%`;
  }
  if (criteria.state) {
    where.push(`p.state = $state`);
    params.$state = criteria.state.toUpperCase();
  }
  if (criteria.minPrice != null) {
    where.push(`p.price >= $minPrice`);
    params.$minPrice = criteria.minPrice;
  }
  if (criteria.maxPrice != null) {
    where.push(`p.price <= $maxPrice`);
    params.$maxPrice = criteria.maxPrice;
  }
  if (criteria.propertyType && criteria.propertyType !== "ANY") {
    where.push(`p.property_type = $propertyType`);
    params.$propertyType = criteria.propertyType;
  }
  if (criteria.minBeds != null) {
    where.push(`p.bedrooms >= $minBeds`);
    params.$minBeds = criteria.minBeds;
  }
  if (criteria.minBaths != null) {
    where.push(`p.bathrooms >= $minBaths`);
    params.$minBaths = criteria.minBaths;
  }
  if (criteria.status && criteria.status !== "ANY") {
    where.push(`p.status = $status`);
    params.$status = criteria.status;
  } else if (!criteria.status) {
    where.push(`p.status != 'SOLD'`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sortMap: Record<string, string> = {
    newest: "p.created_at DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    sqft_desc: "p.sqft DESC",
  };
  const orderSql = sortMap[criteria.sort ?? "newest"] ?? sortMap.newest;

  const pageSize = criteria.pageSize ?? 12;
  const page = criteria.page ?? 1;
  const offset = (page - 1) * pageSize;

  const totalRow = await get<{ count: number }>(
    `SELECT COUNT(*) as count FROM properties p ${whereSql}`,
    params
  );
  const total = totalRow?.count ?? 0;

  const rows = await all<Property & { agent_name: string; agent_email: string; agent_phone: string | null }>(
    `${AGENT_JOIN} ${whereSql} ORDER BY ${orderSql} LIMIT $limit OFFSET $offset`,
    { ...params, $limit: pageSize, $offset: offset }
  );

  const results = await hydrateProperties(rows, viewerId);
  return { results, total };
}

export async function getPropertiesByAgent(agentId: string): Promise<PropertyWithExtras[]> {
  const rows = await all<Property & { agent_name: string; agent_email: string; agent_phone: string | null }>(
    `${AGENT_JOIN} WHERE p.agent_id = $agentId ORDER BY p.created_at DESC`,
    { $agentId: agentId }
  );
  return hydrateProperties(rows);
}

// --------------------------- FAVORITES --------------------------------------

export async function toggleFavorite(userId: string, propertyId: string): Promise<boolean> {
  const existing = await get<Favorite>(
    `SELECT * FROM favorites WHERE user_id = $uid AND property_id = $pid`,
    { $uid: userId, $pid: propertyId }
  );
  if (existing) {
    await run(`DELETE FROM favorites WHERE id = $id`, { $id: existing.id });
    return false;
  }
  await run(
    `INSERT INTO favorites (id, user_id, property_id) VALUES ($id, $uid, $pid)`,
    { $id: makeId("fav"), $uid: userId, $pid: propertyId }
  );
  return true;
}

export async function getFavoritesForUser(userId: string): Promise<PropertyWithExtras[]> {
  const rows = await all<Property & { agent_name: string; agent_email: string; agent_phone: string | null }>(
    `${AGENT_JOIN}
     JOIN favorites f ON f.property_id = p.id
     WHERE f.user_id = $uid
     ORDER BY f.created_at DESC`,
    { $uid: userId }
  );
  return hydrateProperties(rows, userId);
}

// ------------------------- SAVED SEARCHES ------------------------------------

export async function createSavedSearch(userId: string, name: string, criteria: SearchCriteria) {
  const id = makeId("srch");
  await run(
    `INSERT INTO saved_searches (id, user_id, name, criteria_json) VALUES ($id, $uid, $name, $criteria)`,
    { $id: id, $uid: userId, $name: name, $criteria: JSON.stringify(criteria) }
  );
  return id;
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  return all<SavedSearch>(
    `SELECT * FROM saved_searches WHERE user_id = $uid ORDER BY created_at DESC`,
    { $uid: userId }
  );
}

export async function deleteSavedSearch(id: string, userId: string) {
  await run(`DELETE FROM saved_searches WHERE id = $id AND user_id = $uid`, {
    $id: id,
    $uid: userId,
  });
}

/** Count of properties currently matching a saved search's criteria — powers "new matches" badges. */
export async function countMatchesForCriteria(criteria: SearchCriteria): Promise<number> {
  const { total } = await searchProperties({ ...criteria, page: 1, pageSize: 1 });
  return total;
}

// ---------------------------- INQUIRIES ---------------------------------------

export async function createInquiry(input: {
  propertyId: string;
  agentId: string;
  buyerId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): Promise<string> {
  const id = makeId("inq");
  await run(
    `INSERT INTO inquiries (id, property_id, agent_id, buyer_id, name, email, phone, message)
     VALUES ($id, $pid, $aid, $bid, $name, $email, $phone, $message)`,
    {
      $id: id,
      $pid: input.propertyId,
      $aid: input.agentId,
      $bid: input.buyerId ?? null,
      $name: input.name,
      $email: input.email,
      $phone: input.phone ?? null,
      $message: input.message,
    }
  );
  return id;
}

export async function getInquiriesForAgent(agentId: string) {
  return all<Inquiry & { property_title: string; property_id: string }>(
    `SELECT i.*, p.title AS property_title
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     WHERE i.agent_id = $aid
     ORDER BY i.created_at DESC`,
    { $aid: agentId }
  );
}

export async function getInquiryCountsByProperty(agentId: string): Promise<Record<string, number>> {
  const rows = await all<{ property_id: string; count: number }>(
    `SELECT property_id, COUNT(*) as count FROM inquiries WHERE agent_id = $aid GROUP BY property_id`,
    { $aid: agentId }
  );
  const map: Record<string, number> = {};
  for (const row of rows) map[row.property_id] = row.count;
  return map;
}

export async function markInquiryStatus(id: string, agentId: string, status: Inquiry["status"]) {
  await run(`UPDATE inquiries SET status = $status WHERE id = $id AND agent_id = $aid`, {
    $id: id,
    $aid: agentId,
    $status: status,
  });
}

export async function getAgentStats(agentId: string) {
  const listings = await get<{ count: number }>(
    `SELECT COUNT(*) as count FROM properties WHERE agent_id = $aid`,
    { $aid: agentId }
  );
  const active = await get<{ count: number }>(
    `SELECT COUNT(*) as count FROM properties WHERE agent_id = $aid AND status = 'FOR_SALE'`,
    { $aid: agentId }
  );
  const inquiries = await get<{ count: number }>(
    `SELECT COUNT(*) as count FROM inquiries WHERE agent_id = $aid`,
    { $aid: agentId }
  );
  const newInquiries = await get<{ count: number }>(
    `SELECT COUNT(*) as count FROM inquiries WHERE agent_id = $aid AND status = 'NEW'`,
    { $aid: agentId }
  );
  const portfolioValue = await get<{ total: number }>(
    `SELECT COALESCE(SUM(price),0) as total FROM properties WHERE agent_id = $aid AND status != 'SOLD'`,
    { $aid: agentId }
  );

  return {
    totalListings: listings?.count ?? 0,
    activeListings: active?.count ?? 0,
    totalInquiries: inquiries?.count ?? 0,
    newInquiries: newInquiries?.count ?? 0,
    portfolioValue: portfolioValue?.total ?? 0,
  };
}
