import { db } from './db';
import { products, reviews, deployments, users, purchases } from './schema';
import { eq, and, desc } from 'drizzle-orm';

// Product operations
export async function getProduct(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function getProductBySlug(slug: string) {
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  return product;
}

export async function getProducts() {
  return await db.select().from(products).orderBy(desc(products.created_at));
}

export async function getUserProducts(userId: string) {
  return await db.select().from(products).where(eq(products.uploaded_by, userId));
}

export async function createProduct(data: typeof products.$inferInsert) {
  const [product] = await db.insert(products).values(data).returning();
  return product;
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
  const [product] = await db.update(products)
    .set({ ...data, updated_at: new Date() })
    .where(eq(products.id, id))
    .returning();
  return product;
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// Purchase operations
export async function checkProductPurchase(userId: string, productId: string) {
  const [purchase] = await db.select()
    .from(purchases)
    .where(and(
      eq(purchases.user_id, userId),
      eq(purchases.product_id, productId)
    ));
  return !!purchase;
}

export async function createPurchase(data: typeof purchases.$inferInsert) {
  const [purchase] = await db.insert(purchases).values(data).returning();
  return purchase;
}

// Review operations
export async function getProductReviews(productId: string) {
  return await db.select().from(reviews).where(eq(reviews.product_id, productId));
}

export async function createReview(data: typeof reviews.$inferInsert) {
  const [review] = await db.insert(reviews).values(data).returning();
  return review;
}

export async function getUserReview(userId: string, productId: string) {
  const [review] = await db.select().from(reviews)
    .where(and(eq(reviews.user_id, userId), eq(reviews.product_id, productId)));
  return review;
}

// Deployment operations
export async function getDeployments(userId: string) {
  return await db.select().from(deployments).where(eq(deployments.user_id, userId));
}

export async function getDeployment(id: string) {
  const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
  return deployment;
}

export async function createDeployment(data: typeof deployments.$inferInsert) {
  const [deployment] = await db.insert(deployments).values(data).returning();
  return deployment;
}

// User operations
export async function getUser(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserPurchases(userId: string) {
  return await db.select().from(products)
    .innerJoin(purchases, eq(products.id, purchases.product_id))
    .where(eq(purchases.user_id, userId));
}

// Trending products
export async function getTrendingProducts(limit = 10) {
  return await db.select()
    .from(products)
    .orderBy(desc(products.download_count))
    .limit(limit);
} 