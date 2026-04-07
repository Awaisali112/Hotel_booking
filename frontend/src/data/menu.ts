export interface MenuItem {
  name: string;
  description: string;
  price: string;
}

export interface MenuCategory {
  category: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  {
    category: 'Breakfast Mains',
    meal: 'Breakfast',
    items: [
      { name: 'Halwa Puri',         description: 'Crispy fried puri with semolina halwa, chana masala & achar',         price: '$10' },
      { name: 'Paratha & Omelette', description: 'Flaky layered paratha served with a spiced egg omelette',              price: '$8'  },
      { name: 'Nihari (Morning)',   description: 'Slow-cooked beef shank stew — a Lahori breakfast classic',             price: '$14' },
      { name: 'Paye',               description: 'Slow-braised trotters in aromatic spiced broth with naan',             price: '$13' },
      { name: 'Chana Masala',       description: 'Spiced chickpea curry served with bhatura or puri',                    price: '$9'  },
    ],
  },
  {
    category: 'Breakfast Sides & Drinks',
    meal: 'Breakfast',
    items: [
      { name: 'Lassi (Sweet/Salty)', description: 'Thick chilled yogurt drink, Lahori style',                           price: '$5'  },
      { name: 'Doodh Pati Chai',    description: 'Strong milk tea simmered with cardamom & ginger',                     price: '$4'  },
      { name: 'Aloo Bhujia',        description: 'Spiced potato stir-fry, perfect with paratha',                        price: '$6'  },
      { name: 'Fruit Chaat',        description: 'Seasonal fruits tossed with chaat masala & lemon',                    price: '$7'  },
    ],
  },

  // ── LUNCH ───────────────────────────────────────────────────────────────────
  {
    category: 'Lunch Starters',
    meal: 'Lunch',
    items: [
      { name: 'Samosa Chaat',       description: 'Crispy samosas topped with yogurt, tamarind chutney & sev',           price: '$9'  },
      { name: 'Dahi Bhalle',        description: 'Lentil dumplings in spiced yogurt with chutneys',                     price: '$8'  },
      { name: 'Chicken Tikka',      description: 'Tandoor-marinated chicken pieces with mint raita',                    price: '$13' },
      { name: 'Seekh Kebab',        description: 'Minced beef & lamb skewers with green chutney',                       price: '$12' },
    ],
  },
  {
    category: 'Lunch Mains',
    meal: 'Lunch',
    items: [
      { name: 'Daal Mash',          description: 'Creamy white lentils tempered with garlic & dried red chilli',        price: '$14' },
      { name: 'Aloo Gosht',         description: 'Tender mutton & potato curry in a rich tomato-onion gravy',           price: '$18' },
      { name: 'Chicken Karahi',     description: 'Wok-cooked chicken with tomatoes, ginger & green chillies',           price: '$17' },
      { name: 'Palak Paneer',       description: 'Fresh cottage cheese in spiced spinach gravy',                        price: '$15' },
      { name: 'Daal Makhani',       description: 'Black lentils slow-cooked overnight with butter & cream',             price: '$14' },
      { name: 'Biryani (Lunch)',    description: 'Fragrant basmati rice with saffron & your choice of chicken or beef', price: '$16' },
    ],
  },
  {
    category: 'Lunch Breads & Rice',
    meal: 'Lunch',
    items: [
      { name: 'Tandoori Roti',      description: 'Whole-wheat bread baked in clay oven',                                price: '$3'  },
      { name: 'Garlic Naan',        description: 'Leavened bread brushed with garlic butter & coriander',               price: '$5'  },
      { name: 'Steamed Rice',       description: 'Plain basmati rice',                                                  price: '$4'  },
    ],
  },

  // ── DINNER ──────────────────────────────────────────────────────────────────
  {
    category: 'Dinner Starters',
    meal: 'Dinner',
    items: [
      { name: 'Boti Kebab',         description: 'Marinated beef cubes grilled over charcoal, served with raita',       price: '$14' },
      { name: 'Reshmi Kebab',       description: 'Silky minced chicken kebabs with cream & cashew marinade',            price: '$13' },
      { name: 'Peshwari Chapli',    description: 'Flat minced beef patties with pomegranate seeds & coriander',         price: '$12' },
      { name: 'Shami Kebab',        description: 'Soft lentil & mince patties pan-fried golden',                        price: '$11' },
    ],
  },
  {
    category: 'Dinner Mains',
    meal: 'Dinner',
    items: [
      { name: 'Nihari (Dinner)',    description: 'Slow-braised beef shank in rich spiced gravy, served with naan',      price: '$26' },
      { name: 'Karahi Gosht',       description: 'Tender lamb cooked in a wok with tomatoes & ginger',                  price: '$28' },
      { name: 'Butter Chicken',     description: 'Tandoor chicken in creamy tomato-fenugreek sauce',                    price: '$24' },
      { name: 'Mutton Biryani',     description: 'Slow-dum basmati rice layered with spiced mutton & caramelised onion',price: '$27' },
      { name: 'Handi Chicken',      description: 'Creamy yogurt-based chicken curry cooked in a clay pot',              price: '$22' },
      { name: 'Beef Paya Handi',    description: 'Trotters slow-cooked in aromatic spices, served with naan',           price: '$24' },
      { name: 'Saag Gosht',         description: 'Mustard greens & spinach cooked with tender mutton',                  price: '$23' },
    ],
  },
  {
    category: 'Dinner Breads',
    meal: 'Dinner',
    items: [
      { name: 'Tandoori Naan',      description: 'Classic leavened bread from the clay oven',                           price: '$4'  },
      { name: 'Peshwari Naan',      description: 'Sweet naan filled with coconut, almonds & sultanas',                  price: '$6'  },
      { name: 'Paratha',            description: 'Flaky whole-wheat layered bread',                                     price: '$4'  },
      { name: 'Roghni Naan',        description: 'Soft naan brushed with egg wash & sesame seeds',                      price: '$5'  },
    ],
  },
  {
    category: 'Desserts',
    meal: 'Dinner',
    items: [
      { name: 'Gulab Jamun',        description: 'Soft milk-solid dumplings in rose-cardamom syrup',                    price: '$8'  },
      { name: 'Kheer',              description: 'Slow-cooked rice pudding with pistachios & saffron',                  price: '$8'  },
      { name: 'Gajar Halwa',        description: 'Warm carrot pudding with khoya & almonds',                            price: '$9'  },
      { name: 'Shahi Tukray',       description: 'Fried bread soaked in saffron milk & topped with rabri',              price: '$10' },
      { name: 'Firni',              description: 'Chilled ground rice pudding set in clay bowls',                       price: '$8'  },
    ],
  },
  {
    category: 'Drinks',
    meal: 'Dinner',
    items: [
      { name: 'Mango Lassi',        description: 'Chilled yogurt drink blended with Alphonso mango',                    price: '$7'  },
      { name: 'Rose Sharbat',       description: 'Chilled rose syrup with basil seeds & lemon',                         price: '$6'  },
      { name: 'Masala Chai',        description: 'Spiced milk tea with cardamom, ginger & cinnamon',                    price: '$5'  },
      { name: 'Rooh Afza Cooler',   description: 'Rose & herb syrup with chilled milk & ice',                           price: '$6'  },
    ],
  },
];
