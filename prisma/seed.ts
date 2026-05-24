
import { seedInventory } from "../src/lib/seed";

async function main() {
  await seedInventory(true);
  console.log("Inventory seeded successfully.");
}

main();
