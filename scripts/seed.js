// Fills MongoDB with sample data. Run with:  npm run seed
// Running it again wipes the four collections and inserts fresh data.
import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';

// Small seeded random generator so every run produces the same data.
let seed = 42;
const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (list) => list[int(0, list.length - 1)];
const picks = (list, n) => {
  const copy = [...list];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(int(0, copy.length - 1), 1)[0]);
  return out;
};
const round = (n, digits = 2) => Number(n.toFixed(digits));
const pad = (n) => String(n).padStart(2, '0');

// ---------- Posts (60) ----------
const openers = ['Here is what I learned about', 'A short story about', 'Why everyone is talking about', 'Five thoughts on', 'My honest take on', 'A beginner guide to'];
const topics = ['learning to code', 'a quiet morning', 'the future of cities', 'travelling on a budget', 'healthy habits', 'open source software', 'a rainy weekend', 'building a small business', 'street food', 'working remotely'];
const sentences = [
  'It started as a simple idea, but it quickly grew into something bigger than expected.',
  'Small daily improvements add up faster than most people realise.',
  'The best way to learn is to build something real and break it a few times.',
  'Everyone looks at the problem differently, and that is what makes it interesting.',
  'After a lot of trial and error, a clear and simple approach finally appeared.',
  'Sharing what you know with others is one of the quickest ways to understand it yourself.',
  'There is always more to discover once you slow down and pay attention.',
  'The results were not perfect, but they were honest and a solid start.',
];
const postTags = ['history', 'american', 'crime', 'technology', 'travel', 'food', 'life', 'health', 'business', 'music', 'nature', 'science'];

const posts = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  title: `${pick(openers)} ${pick(topics)}`,
  body: picks(sentences, 3).join(' '),
  tags: picks(postTags, 3),
  reactions: { likes: int(0, 500), dislikes: int(0, 60) },
  views: int(50, 5000),
  userId: int(1, 40),
}));

// ---------- Products (40) ----------
const catalog = {
  smartphones: ['Aurora X1 Phone', 'Nova Lite Phone', 'Pulse 5G Phone', 'Zenith Pro Phone', 'Orbit Mini Phone'],
  laptops: ['Vertex 14 Laptop', 'Slate Air Laptop', 'Forge 16 Laptop', 'Lumen Book Laptop', 'Atlas Pro Laptop'],
  fragrances: ['Midnight Oud Perfume', 'Citrus Bloom Parfum', 'Amber Noir Cologne', 'Velvet Rose Perfume', 'Ocean Mist Cologne'],
  groceries: ['Organic Honey Jar', 'Basmati Rice 5kg', 'Cold Pressed Olive Oil', 'Roasted Almonds Pack', 'Green Tea Box'],
  furniture: ['Oak Coffee Table', 'Ergonomic Desk Chair', 'Linen Sofa', 'Walnut Bookshelf', 'Standing Desk'],
  'home-decoration': ['Ceramic Table Vase', 'Woven Wall Basket', 'Scented Soy Candle', 'Framed Botanical Print', 'Brass Table Lamp'],
  'sports-accessories': ['Pro Yoga Mat', 'Adjustable Dumbbell Set', 'Trail Running Belt', 'Insulated Sports Bottle', 'Resistance Band Kit'],
  'mens-shoes': ['Canvas Street Sneakers', 'Leather Derby Shoes', 'Trail Hiking Boots', 'Lightweight Runners', 'Classic Loafers'],
};
const brands = ['Northwind', 'Bluefin', 'Orchard', 'Pinecone', 'Summit', 'Harbor', 'Meridian', 'Kestrel'];
const productTags = ['new', 'popular', 'eco', 'premium', 'bestseller', 'limited', 'gift'];

const products = [];
for (const [category, titles] of Object.entries(catalog)) {
  for (const title of titles) {
    const id = products.length + 1;
    const brand = pick(brands);
    products.push({
      id,
      title,
      description: `${title} is a dependable ${category.replace('-', ' ')} pick with great value and solid build quality.`,
      category,
      price: round(5 + rand() * 1495),
      discountPercentage: round(rand() * 20),
      rating: round(3 + rand() * 2, 1),
      stock: int(0, 150),
      brand,
      sku: `${brand.slice(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`,
      tags: picks(productTags, 2),
      thumbnail: `https://picsum.photos/seed/product-${id}/300/300`,
    });
  }
}

// ---------- Users (40) ----------
const people = [['Emma', 'female'], ['Liam', 'male'], ['Olivia', 'female'], ['Noah', 'male'], ['Ava', 'female'], ['Ethan', 'male'], ['Sophia', 'female'], ['Mason', 'male'], ['Isabella', 'female'], ['Lucas', 'male'], ['Mia', 'female'], ['Logan', 'male'], ['Amelia', 'female'], ['James', 'male'], ['Harper', 'female'], ['Henry', 'male'], ['Evelyn', 'female'], ['Jack', 'male'], ['Ella', 'female'], ['Owen', 'male']];
const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Young'];
const cities = [['New York', 'New York'], ['Los Angeles', 'California'], ['Chicago', 'Illinois'], ['Houston', 'Texas'], ['Phoenix', 'Arizona'], ['Seattle', 'Washington'], ['Denver', 'Colorado'], ['Boston', 'Massachusetts'], ['Austin', 'Texas'], ['Miami', 'Florida']];
const streets = ['Maple Street', 'Oak Avenue', 'Cedar Lane', 'Pine Road', 'Elm Street', 'Lakeview Drive'];
const companies = ['Northwind Labs', 'Bluefin Systems', 'Orchard Analytics', 'Pinecone Studio', 'Summit Logistics', 'Harbor Health'];
const jobTitles = ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Sales Lead', 'Operations Manager'];
const departments = ['Engineering', 'Product', 'Design', 'Analytics', 'Sales', 'Operations'];

const users = Array.from({ length: 40 }, (_, i) => {
  const [firstName, gender] = people[i % 20];
  const lastName = lastNames[(i * 3 + Math.floor(i / 20)) % 20];
  const age = int(20, 65);
  const [city, state] = pick(cities);
  const job = int(0, 5);
  return {
    id: i + 1,
    firstName,
    lastName,
    age,
    gender,
    email: `${firstName}.${lastName}${i + 1}@example.com`.toLowerCase(),
    phone: `+1 555 01${pad(int(0, 99))} ${int(1000, 9999)}`,
    username: `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}${i + 1}`,
    birthDate: `${2025 - age}-${pad(int(1, 12))}-${pad(int(1, 28))}`,
    image: `https://i.pravatar.cc/128?img=${(i % 70) + 1}`,
    address: { address: `${int(10, 999)} ${pick(streets)}`, city, state, country: 'United States' },
    company: { name: pick(companies), department: departments[job], title: jobTitles[job] },
  };
});

// ---------- Recipes (20) ----------
const dishes = [
  ['Classic Margherita Pizza', 'Italian', 'Dinner', 'Easy', ['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Basil leaves', 'Olive oil', 'Sea salt']],
  ['Chicken Tikka Masala', 'Indian', 'Dinner', 'Medium', ['Chicken breast', 'Yogurt', 'Garam masala', 'Tomato puree', 'Heavy cream', 'Garlic', 'Ginger']],
  ['Vegetable Fried Rice', 'Chinese', 'Lunch', 'Easy', ['Cooked rice', 'Carrots', 'Peas', 'Spring onions', 'Soy sauce', 'Eggs']],
  ['Beef Tacos', 'Mexican', 'Dinner', 'Easy', ['Ground beef', 'Taco shells', 'Cheddar cheese', 'Lettuce', 'Tomato', 'Cumin']],
  ['Creamy Mushroom Risotto', 'Italian', 'Dinner', 'Medium', ['Arborio rice', 'Mushrooms', 'Vegetable stock', 'Parmesan', 'White wine', 'Butter']],
  ['Pad Thai', 'Thai', 'Dinner', 'Medium', ['Rice noodles', 'Shrimp', 'Bean sprouts', 'Peanuts', 'Tamarind paste', 'Lime']],
  ['Greek Salad', 'Greek', 'Lunch', 'Easy', ['Cucumber', 'Tomatoes', 'Feta cheese', 'Kalamata olives', 'Red onion', 'Olive oil']],
  ['Pancakes with Maple Syrup', 'American', 'Breakfast', 'Easy', ['Flour', 'Milk', 'Eggs', 'Baking powder', 'Butter', 'Maple syrup']],
  ['Chicken Biryani', 'Pakistani', 'Dinner', 'Hard', ['Basmati rice', 'Chicken', 'Yogurt', 'Fried onions', 'Biryani masala', 'Saffron']],
  ['Sushi Rolls', 'Japanese', 'Dinner', 'Hard', ['Sushi rice', 'Nori sheets', 'Cucumber', 'Avocado', 'Fresh salmon', 'Rice vinegar']],
  ['Shakshuka', 'Middle Eastern', 'Breakfast', 'Easy', ['Eggs', 'Tomatoes', 'Bell pepper', 'Onion', 'Paprika', 'Cumin']],
  ['French Onion Soup', 'French', 'Lunch', 'Medium', ['Onions', 'Beef stock', 'Gruyere cheese', 'Baguette', 'Thyme', 'Butter']],
  ['Lentil Dal', 'Indian', 'Dinner', 'Easy', ['Red lentils', 'Turmeric', 'Cumin seeds', 'Garlic', 'Tomato', 'Coriander']],
  ['Caesar Salad', 'American', 'Lunch', 'Easy', ['Romaine lettuce', 'Croutons', 'Parmesan', 'Caesar dressing', 'Lemon juice', 'Black pepper']],
  ['Spaghetti Carbonara', 'Italian', 'Dinner', 'Medium', ['Spaghetti', 'Eggs', 'Pecorino cheese', 'Pancetta', 'Black pepper', 'Salt']],
  ['Chocolate Brownies', 'American', 'Dessert', 'Easy', ['Dark chocolate', 'Butter', 'Sugar', 'Eggs', 'Flour', 'Cocoa powder']],
  ['Falafel Wraps', 'Middle Eastern', 'Lunch', 'Medium', ['Chickpeas', 'Parsley', 'Garlic', 'Tahini', 'Pita bread', 'Pickled turnips']],
  ['Korean Bibimbap', 'Korean', 'Dinner', 'Medium', ['Steamed rice', 'Beef strips', 'Spinach', 'Carrots', 'Gochujang', 'Fried egg']],
  ['Mango Lassi', 'Indian', 'Dessert', 'Easy', ['Ripe mango', 'Yogurt', 'Milk', 'Sugar', 'Cardamom', 'Ice cubes']],
  ['Avocado Toast', 'American', 'Breakfast', 'Easy', ['Sourdough bread', 'Avocado', 'Lemon juice', 'Chili flakes', 'Eggs', 'Sea salt']],
];
const recipeTags = ['quick', 'healthy', 'comfort-food', 'vegetarian', 'spicy', 'family', 'high-protein'];

const recipes = dishes.map(([name, cuisine, meal, difficulty, ingredients], i) => ({
  id: i + 1,
  name,
  ingredients,
  instructions: [
    `Prepare the ${ingredients[0].toLowerCase()} and ${ingredients[1].toLowerCase()}.`,
    `Cook everything together with the ${ingredients[2].toLowerCase()} until tender and fragrant.`,
    `Finish with ${ingredients[ingredients.length - 1].toLowerCase()} and serve the ${name.toLowerCase()} warm.`,
  ],
  prepTimeMinutes: int(10, 40),
  cookTimeMinutes: int(10, 60),
  servings: int(2, 6),
  difficulty,
  cuisine,
  caloriesPerServing: int(180, 650),
  tags: picks(recipeTags, 2),
  userId: int(1, 40),
  image: `https://picsum.photos/seed/recipe-${i + 1}/400/300`,
  rating: round(3.5 + rand() * 1.5, 1),
  reviewCount: int(5, 300),
  mealType: [meal],
}));

// ---------- Write to MongoDB ----------
async function run() {
  const db = await connectDB();
  const data = { posts, products, users, recipes };

  for (const [name, docs] of Object.entries(data)) {
    const collection = db.collection(name);
    await collection.deleteMany({});
    await collection.insertMany(docs);
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log(`Seeded ${docs.length} documents into "${name}"`);
  }
}

run()
  .then(() => console.log('Seeding finished.'))
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => closeDB());