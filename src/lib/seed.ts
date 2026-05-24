import { prisma } from "./prisma";

type SeedProduct = {
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
};

const defaultProducts: SeedProduct[] = [
  {
    name: "OnePlus Nord 4",
    description: "Flagship smartphone with a bright AMOLED display and fast charging.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    category: "Mobiles",
    price: 32999,
  },
  {
    name: "Samsung Galaxy M55",
    description: "Long-battery mid-range phone with a premium glass finish.",
    image: "https://images.unsplash.com/photo-1536305030016-7522a8333c98",
    category: "Mobiles",
    price: 25999,
  },
  {
    name: "Apple iPhone 15",
    description: "Sleek iPhone with a powerful camera system and smooth performance.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    category: "Mobiles",
    price: 89999,
  },
  {
    name: "Xiaomi Redmi Note 13 Pro",
    description: "Feature-packed phone with a stunning HDR display and fast chipset.",
    image: "https://images.unsplash.com/photo-1516705533699-6bcf71735a6f",
    category: "Mobiles",
    price: 18999,
  },
  {
    name: "HP Pavilion 15 Laptop",
    description: "High-performance notebook for work, streaming, and gaming on the go.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    category: "Laptops",
    price: 62999,
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium noise cancelling headphones for immersive music listening.",
    image: "https://images.unsplash.com/photo-1516705533699-6bcf71735a6f",
    category: "Audio",
    price: 29999,
  },
  {
    name: "boAt Airdopes 801",
    description: "Truly wireless earbuds with rich bass and long battery life.",
    image: "https://images.unsplash.com/photo-1519337265831-281ec6cc8514",
    category: "Audio",
    price: 1999,
  },
  {
    name: "Noise ColorFit Pro 4",
    description: "Smart fitness watch with health tracking and customizable faces.",
    image: "https://images.unsplash.com/photo-1512303452029-36339bd5811d",
    category: "Wearables",
    price: 3499,
  },
  {
    name: "Puma Running Shoes",
    description: "Lightweight running shoes designed for comfort and style.",
    image: "https://images.unsplash.com/photo-1519741491820-58a7ad9d85c7",
    category: "Fashion",
    price: 3499,
  },
  {
    name: "Fastrack Aviator Sunglasses",
    description: "UV-protective sunglasses with a bold aviator frame.",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    category: "Fashion",
    price: 1599,
  },
  {
    name: "Adidas Sports T-Shirt",
    description: "Breathable sports tee built for workouts and everyday wear.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    category: "Fashion",
    price: 1299,
  },
  {
    name: "Samsung 43-inch Smart TV",
    description: "Vibrant 4K display with smart streaming and premium audio.",
    image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c",
    category: "Electronics",
    price: 37999,
  },
  {
    name: "Philips Air Fryer",
    description: "Healthy cooking with rapid air circulation and easy cleanup.",
    image: "https://images.unsplash.com/photo-1513058176-49b3b9d7e0d3",
    category: "Kitchen",
    price: 7999,
  },
  {
    name: "Bajaj Mixer Grinder",
    description: "Powerful 3-jar mixer grinder for everyday cooking needs.",
    image: "https://images.unsplash.com/photo-1515165562835-c0c6cdd1ef08",
    category: "Kitchen",
    price: 2999,
  },
  {
    name: "AmazonBasics Storage Shelf",
    description: "Durable multi-tier shelf for home organization and storage.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    category: "Home",
    price: 2499,
  },
  {
    name: "Havells Water Purifier",
    description: "Compact water purifier with advanced filtration and quick flow.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    category: "Home",
    price: 11999,
  },
  {
    name: "Logitech Wireless Keyboard",
    description: "Compact keyboard with quiet keys and long battery life.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    category: "Accessories",
    price: 1499,
  },
  {
    name: "Logitech Pebble Mouse",
    description: "Slim wireless mouse with silent clicks and modern design.",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    category: "Accessories",
    price: 1299,
  },
  {
    name: "Mi Smart LED Bulb",
    description: "Color-changing smart bulb controllable from your phone.",
    image: "https://images.unsplash.com/photo-1505253218884-7e0a5a7d1a7f",
    category: "Home",
    price: 799,
  },
  {
    name: "Samsung Galaxy Tab A9",
    description: "Lightweight tablet for streaming, reading, and video calls.",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
    category: "Tablets",
    price: 21999,
  },
  {
    name: "JBL Flip 6 Speaker",
    description: "Portable Bluetooth speaker with deep bass and waterproof design.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    category: "Audio",
    price: 6999,
  },
  {
    name: "Nikon Z30 Camera",
    description: "Mirrorless camera for creators, vlogging, and sharp photos.",
    image: "https://images.unsplash.com/photo-1588774063041-2a6d1629c7d0",
    category: "Electronics",
    price: 52999,
  },
  {
    name: "Fitbit Charge 6",
    description: "Advanced fitness tracker with health monitoring and sleep insights.",
    image: "https://images.unsplash.com/photo-1516705533699-6bcf71735a6f",
    category: "Fitness",
    price: 13999,
  },
  {
    name: "Adjustable Dumbbells",
    description: "Space-saving weights with quick adjustment for home workouts.",
    image: "https://images.unsplash.com/photo-1583454110554-21b9b1f9b65a",
    category: "Fitness",
    price: 24999,
  },
  {
    name: "Organic Herbal Tea Pack",
    description: "Assorted wellness tea blends for daily relaxation.",
    image: "https://images.unsplash.com/photo-1515041219749-7f9c9fcd8e21",
    category: "Health",
    price: 799,
  },
];

const defaultWarehouses = [
  { name: "Bangalore Central", city: "Bangalore" },
  { name: "Hyderabad Hub", city: "Hyderabad" },
  { name: "Mumbai Distribution", city: "Mumbai" },
];

export async function seedInventory(force = false) {
  const productCount = await prisma.product.count();
  if (!force && productCount >= 5) {
    return;
  }

  await prisma.reservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const warehouses = await Promise.all(
    defaultWarehouses.map((warehouse) => prisma.warehouse.create({ data: warehouse }))
  );

  for (const product of defaultProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        category: product.category,
        stocks: {
          create: warehouses.map((warehouse) => ({
            warehouseId: warehouse.id,
            totalUnits: Math.floor(Math.random() * 30) + 10,
            reservedUnits: Math.floor(Math.random() * 3),
          })),
        },
      },
    });
  }
}

export async function ensureInventorySeeded() {
  await seedInventory();
}
