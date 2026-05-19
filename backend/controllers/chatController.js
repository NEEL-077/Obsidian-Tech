

// ─── Intent Detection ─────────────────────────────────────────────────────────

const INTENTS = {
  GREETING: 'greeting',
  RECOMMENDATION: 'recommendation',
  PRODUCT_DETAIL: 'product_detail',
  COMPARISON: 'comparison',
  UNKNOWN: 'unknown',
};

function detectIntent(message) {
  const msg = message.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|namaste|hola|sup|yo)\b/.test(msg)) {
    return INTENTS.GREETING;
  }

  // Comparison
  if (/\bvs\.?\b|\bversus\b|\bcompare\b|\bdifference between\b|\bwhich is better\b/.test(msg)) {
    return INTENTS.COMPARISON;
  }

  // Specific product detail
  if (
    /\btell me about\b|\bdetails? (of|about|for)\b|\bspecs? (of|for)\b|\bwhat is the price of\b|\bprice of\b|\bfeatures? of\b/.test(msg) ||
    (/\b(iphone|galaxy|pixel|oneplus|xiaomi|redmi|realme|motorola|nokia|poco|oppo|vivo|iqoo)\b/.test(msg) &&
      !/\brecommend\b|\bsuggest\b|\bbest\b|\bunder\b/.test(msg))
  ) {
    return INTENTS.PRODUCT_DETAIL;
  }

  // Recommendation
  if (
    /\brecommend\b|\bsuggest\b|\bbest (phone|mobile|smartphone)\b|\bgood (phone|mobile)\b|\bunder\b|\bbudget\b|\blooking for\b|\bneed a\b|\bwant a\b|\bwhich phone\b|\bwhat phone\b/.test(msg)
  ) {
    return INTENTS.RECOMMENDATION;
  }

  // Feature / category based — treat as recommendation
  if (/\b(gaming|camera|battery|5g|amoled|performance|photography|selfie|fast charg|waterproof)\b/.test(msg)) {
    return INTENTS.RECOMMENDATION;
  }

  return INTENTS.UNKNOWN;
}

// ─── Extraction Helpers ───────────────────────────────────────────────────────

function extractBudget(message) {
  const msg = message.toLowerCase().replace(/,/g, '');

  // Patterns like "under 20000", "below 15k", "around 30000", "budget of 25000"
  const patterns = [
    /(?:under|below|less than|upto|within|max(?:imum)?|budget (?:of|is|around)?)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?\b/i,
    /(?:rs\.?|₹|inr)\s*(\d+)\s*k?\b/i,
    /(\d+)\s*k\b/i,
    /(\d+)\s*(?:thousand)/i,
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match) {
      let amount = parseInt(match[1]);
      if (msg.includes('k') || msg.includes('thousand')) amount *= 1000;
      if (amount < 500) amount *= 1000; // "20" likely means "20000"
      return amount;
    }
  }
  return null;
}

function extractBrand(message) {
  const brands = [
    'apple', 'iphone', 'samsung', 'galaxy', 'oneplus', 'google', 'pixel',
    'xiaomi', 'redmi', 'motorola', 'nokia', 'realme', 'oppo', 'vivo', 'poco', 'iqoo',
  ];
  const msg = message.toLowerCase();
  for (const brand of brands) {
    if (msg.includes(brand)) {
      // Normalise to stored brand names
      if (brand === 'iphone') return 'Apple';
      if (brand === 'galaxy') return 'Samsung';
      if (brand === 'pixel') return 'Google';
      if (brand === 'redmi' || brand === 'poco') return 'Xiaomi';
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }
  return null;
}

function extractFeatures(message) {
  const msg = message.toLowerCase();
  const features = [];
  if (/\bgaming\b|\bgamer\b/.test(msg)) features.push('gaming');
  if (/\bcamera\b|\bphoto\b|\bphotograph\b|\bpicture\b/.test(msg)) features.push('camera');
  if (/\bbattery\b/.test(msg)) features.push('battery');
  if (/\b5g\b/.test(msg)) features.push('5g');
  if (/\bamoled\b/.test(msg)) features.push('amoled');
  if (/\bfast charg\b|\bquick charg\b/.test(msg)) features.push('fast charging');
  if (/\bperformance\b|\bspeed\b|\bsnapdragon\b|\bdimensity\b/.test(msg)) features.push('performance');
  if (/\bselfie\b|\bfront camera\b/.test(msg)) features.push('selfie');
  if (/\bwaterproof\b|\bip6[78]\b/.test(msg)) features.push('waterproof');
  return features;
}

function extractPhoneNames(message) {
  // Extract 2+ proper-noun sequences that look like phone model names
  const matches = message.match(/([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,4})/g);
  return matches ? matches.filter(m => m.length > 3) : [];
}

// ─── DB Queries ───────────────────────────────────────────────────────────────

async function getRecommendations({ budget, brand, features, limit = 5 }) {
  const query = { countInStock: { $gt: 0 } };

  if (budget) {
    query.price = { $lte: budget };
  }

  if (brand) {
    query.brand = { $regex: new RegExp(brand, 'i') };
  }

  let products = await Product.find(query)
    .sort({ rating: -1, isBestSeller: -1 })
    .limit(limit * 3) // over-fetch to allow feature filtering
    .lean();

  // Feature-based text filtering
  if (features.length > 0) {
    products = products.filter(p => {
      const text = `${p.name} ${p.description} ${JSON.stringify(p.specs)}`.toLowerCase();
      return features.some(f => text.includes(f));
    });
  }

  return products.slice(0, limit);
}

async function getProductDetail(name) {
  const words = name.split(' ').filter(w => w.length > 2);
  const regexParts = words.map(w => `(?=.*${w})`).join('');
  const regex = new RegExp(regexParts, 'i');

  const product = await Product.findOne({
    name: { $regex: regex },
    countInStock: { $gt: 0 },
  }).lean();

  return product;
}

async function getComparisonProducts(message) {
  // Split on vs/versus/compare
  const parts = message
    .replace(/compare|versus|vs\.?/gi, '|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 2);

  const products = [];
  for (const part of parts.slice(0, 2)) {
    const words = part.split(/\s+/).filter(w => w.length > 2);
    if (!words.length) continue;

    const regexParts = words.map(w => `(?=.*${w})`).join('');
    const regex = new RegExp(regexParts, 'i');
    const p = await Product.findOne({ name: { $regex: regex } }).lean();
    if (p) products.push(p);
  }

  return products;
}

// ─── Response Builders ────────────────────────────────────────────────────────

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function getSpecSummary(product) {
  const specs = product.specs || {};
  const lines = [];
  if (specs.camera || specs.rear_camera) lines.push(`📸 ${specs.camera || specs.rear_camera}`);
  if (specs.battery) lines.push(`🔋 ${specs.battery}`);
  if (specs.processor || specs.chipset) lines.push(`⚡ ${specs.processor || specs.chipset}`);
  if (specs.display || specs.screen) lines.push(`🖥️ ${specs.display || specs.screen}`);
  return lines.join('\n');
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const intent = detectIntent(message);
    const budget = extractBudget(message);
    const brand = extractBrand(message);
    const features = extractFeatures(message);

    // ── Greeting ──────────────────────────────────────────────────────────────
    if (intent === INTENTS.GREETING) {
      return res.json({
        type: 'greeting',
        reply:
          "👋 Hey there! Welcome to **OBSIDIAN TECH**! I'm your AI shopping assistant.\n\nI can help you:\n• 🔍 Find the perfect smartphone\n• 📊 Compare phones side-by-side\n• 📱 Get detailed specs on any phone\n\nWhat are you looking for today?",
        products: [],
        suggestions: [
          'Best phones under ₹30,000',
          'Best camera phone',
          'Gaming phones',
          'Best 5G phones',
          'Samsung vs iPhone',
        ],
      });
    }

    // ── Recommendation ────────────────────────────────────────────────────────
    if (intent === INTENTS.RECOMMENDATION) {
      const products = await getRecommendations({ budget, brand, features });

      if (products.length === 0) {
        // Fallback — remove strict filters
        const fallback = await getRecommendations({ budget: budget ? budget * 1.3 : null, brand: null, features: [] });
        const budgetText = budget ? ` around ${formatPrice(budget)}` : '';
        return res.json({
          type: 'no_results',
          reply: `😕 I couldn't find phones matching your exact criteria${budgetText}. Here are some great alternatives:`,
          products: fallback,
          suggestions: ['Show all phones', 'Phones under ₹20,000', 'Best rated phones'],
        });
      }

      let replyParts = [];
      if (budget) replyParts.push(`under ${formatPrice(budget)}`);
      if (brand) replyParts.push(`from ${brand}`);
      if (features.length) replyParts.push(`great for ${features.join(', ')}`);
      const qualifier = replyParts.length ? ` ${replyParts.join(', ')}` : '';

      return res.json({
        type: 'recommendation',
        reply: `📱 Here are the best phones${qualifier} I found for you:`,
        products,
        suggestions: budget
          ? ['Show more options', `${brand || 'All brands'} under ₹${Math.round((budget * 1.5) / 1000)}k`]
          : ['Best under ₹20,000', 'Best under ₹50,000'],
      });
    }

    // ── Comparison ────────────────────────────────────────────────────────────
    if (intent === INTENTS.COMPARISON) {
      const products = await getComparisonProducts(message);

      if (products.length < 2) {
        const fallback = await getRecommendations({ budget: null, brand, features, limit: 4 });
        return res.json({
          type: 'comparison_fallback',
          reply: `🔍 I couldn't find both phones to compare. Here are some top picks to help you decide:`,
          products: fallback,
          suggestions: ['iPhone 16 vs Samsung S25', 'OnePlus 12 vs Pixel 9'],
        });
      }

      const [p1, p2] = products;

      const comparison = `📊 **${p1.name} vs ${p2.name}**

| Feature | ${p1.name} | ${p2.name} |
|---------|------------|------------|
| 💰 Price | ${formatPrice(p1.price)} | ${formatPrice(p2.price)} |
| ⭐ Rating | ${p1.rating}/5 | ${p2.rating}/5 |
| 📸 Camera | ${p1.specs?.camera || p1.specs?.rear_camera || 'N/A'} | ${p2.specs?.camera || p2.specs?.rear_camera || 'N/A'} |
| 🔋 Battery | ${p1.specs?.battery || 'N/A'} | ${p2.specs?.battery || 'N/A'} |
| ⚡ Processor | ${p1.specs?.processor || p1.specs?.chipset || 'N/A'} | ${p2.specs?.processor || p2.specs?.chipset || 'N/A'} |

✅ **Verdict**: ${p1.rating >= p2.rating ? p1.name : p2.name} wins on overall rating!`;

      return res.json({
        type: 'comparison',
        reply: comparison,
        products,
        suggestions: ['More comparisons', 'Best phones under ₹50,000'],
      });
    }

    // ── Product Detail ────────────────────────────────────────────────────────
    if (intent === INTENTS.PRODUCT_DETAIL) {
      // Try to extract phone name from message
      const cleanedMsg = message
        .replace(/tell me about|details? of|details? about|specs? of|price of|features? of|what is the/gi, '')
        .trim();

      const product = await getProductDetail(cleanedMsg);

      if (!product) {
        const suggestions = await getRecommendations({ budget, brand, features, limit: 3 });
        return res.json({
          type: 'no_results',
          reply: `😕 I couldn't find that specific phone. It might be out of stock or not in our catalog. Here are some similar options:`,
          products: suggestions,
          suggestions: ['Browse all phones', 'Best sellers'],
        });
      }

      const specText = getSpecSummary(product) || 'Full specs available on the product page.';
      const reply = `📱 **${product.name}**\n\n💰 **Price**: ${formatPrice(product.price)}\n${specText}\n\n${product.description ? product.description.slice(0, 200) + '...' : ''}`;

      return res.json({
        type: 'product_detail',
        reply,
        products: [product],
        suggestions: ['Compare with another phone', `More ${product.brand} phones`],
      });
    }

    // ── Unknown / Fallback ────────────────────────────────────────────────────
    const topPicks = await getRecommendations({ budget: null, brand: null, features: [], limit: 4 });
    return res.json({
      type: 'unknown',
      reply:
        "🤔 I'm not sure I understood that. I can help you find smartphones, compare them, or get details on a specific phone. Here are our top picks:",
      products: topPicks,
      suggestions: [
        'Recommend a phone under ₹30,000',
        'Best camera phones',
        'Compare iPhone vs Samsung',
        'Gaming phones',
      ],
    });
  } catch (error) {
    console.error('[ChatController] Error:', error);
    res.status(500).json({ message: 'Chat service error. Please try again.' });
  }
};

module.exports = { chat };
