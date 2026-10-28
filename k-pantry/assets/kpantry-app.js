(function () {
  'use strict';

  const LS = (k, v) => {
    try {
      return v === undefined
        ? JSON.parse(localStorage.getItem(k) || 'null')
        : localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      return null;
    }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  const pin4 = (p) => /^\d{4}$/.test(String(p || '').trim());
  const isAdmin = () => LS('kpantry_admin') === true;

  const DIET_TAG_LABELS = {
    gf: '🌾 Gluten-Free / Celiac',
    vegan: '🌱 100% Vegan / No Fish',
    halal: '🌙 Halal / No Pork',
    nutfree: '🥜 Peanut & Tree-Nut Alert',
    scoville: '🌶️ Scoville & Ramen Heat',
    storefind: '🛒 Costco / Trader Joe\'s Find'
  };

  const STORE_LABELS = {
    costco: 'Costco US',
    tj: 'Trader Joe\'s',
    hmart: 'H Mart',
    target: 'Target / Walmart',
    wholefoods: 'Whole Foods',
    amazon: 'Amazon US'
  };

  const SEED_POSTS = [
    {
      id: 'kp-seed-1',
      tag: 'gf',
      store: 'Amazon US / Whole Foods',
      product: 'Chung Jung One O\'Food Gluten-Free Gochujang',
      title: '[Celiac Verified] O\'Food Gluten-Free Gochujang uses brown rice instead of barley malt!',
      body: 'Fellow Celiacs: always double check the tub color when buying Gochujang at H Mart or on Amazon. Standard Korean gochujang almost always uses wheat flour and yeotgireum (barley malt). Chung Jung One O\'Food Gluten-Free Gochujang and Sempio Gluten-Free Gochujang are fermented with rice and certified GF (<20 ppm). Zero reaction and identical spicy-umami flavor for bibimbap!',
      author: 'CeliacFoodieLA',
      pin: '0000',
      likes: 64,
      date: '2026-10-28',
      pinned: true,
      replies: [
        { by: 'GlutenFreeSeattle', text: 'Seconding this! Also pair it with Sempio Organic Gluten-Free Soy Sauce (pea/rice/soy base) for K-BBQ marinades.' },
        { by: 'DrKimNutrition', text: 'Great catch—barley malt (엿기름) is the #1 hidden gluten trap in traditional Korean chili pastes.' }
      ]
    },
    {
      id: 'kp-seed-2',
      tag: 'vegan',
      store: 'Costco / Walmart / Target',
      product: 'Jongga Vegan Kimchi vs Classic Jongga Kimchi',
      title: '[Shellfish & Vegan Alert] Costco Jongga Classic tub has anchovy & shrimp — look for the Green Vegan lid!',
      body: 'If you have a crustacean shellfish allergy or eat 100% plant-based, note that the giant Costco Jongga Sliced Napa Cabbage Kimchi tub contains salted shrimp (saeujeot) and anchovy sauce (myeolchi-aekjeot). For 100% vegan & shellfish-free kimchi, grab Nasoya Plantspired Vegan Kimchi, Mother-in-Law\'s Vegan Kimchi, Cleveland Kitchen Kimchi, or Jongga\'s green-label Vegan Kimchi.',
      author: 'PlantBasedChicago',
      pin: '0000',
      likes: 58,
      date: '2026-10-28',
      pinned: true,
      replies: [
        { by: 'ShellfishAllergyMom', text: 'Thank you!! My son has a severe shrimp allergy and we almost bought the regular restaurant-style tub without checking.' }
      ]
    },
    {
      id: 'kp-seed-3',
      tag: 'halal',
      store: 'H Mart / Amazon US',
      product: 'Samyang Buldak Original & Carbonara (Export Pack)',
      title: '[Halal Check] Why Samyang Buldak "Hot Chicken" Ramen has KMF/JAKIM Halal certification (Artificial Chicken Flavor)',
      body: 'A lot of Muslim friends in the US ask how Samyang Buldak Hot Chicken Flavor Ramen is Halal when it says "Chicken" on the front. Export packages sold in US H Mart & Amazon carrying the green KMF Halal logo use 100% synthetic/artificial chicken flavoring with zero animal slaughter meat! Just check for the Halal seal on the bottom-right corner and note that Carbonara contains dairy/whey.',
      author: 'HalalEatsTX',
      pin: '0000',
      likes: 53,
      date: '2026-10-27',
      pinned: true,
      replies: [
        { by: 'DearbornKFood', text: 'Also Nongshim Soon Veggie Noodle Soup is both 100% Vegan and Halal certified!' }
      ]
    },
    {
      id: 'kp-seed-4',
      tag: 'storefind',
      store: 'Trader Joe\'s',
      product: 'Trader Joe\'s Kimbap (Frozen Tofu & Veggie Roll)',
      title: '[Trader Joe\'s] Frozen Kimbap is 100% Vegan (Yubu Tofu + Burdock), contains Soy, Wheat & Sesame',
      body: 'Scanned the back label of the viral Trader Joe\'s Frozen Kimbap (Product of Korea): the protein strip inside is braised fried tofu (유부/Yubu), NOT fish cake or beef! It is 100% vegan and shellfish-free. However, the soy sauce seasoning contains wheat, soy, and toasted sesame oil, so it is NOT gluten-free or sesame-free.',
      author: 'TJLabelScanner',
      pin: '0000',
      likes: 49,
      date: '2026-10-27',
      replies: []
    },
    {
      id: 'kp-seed-5',
      tag: 'nutfree',
      store: 'Costco / Target',
      product: 'Bibigo Steamed Dumplings & Orion Turtle Chips',
      title: '[Peanut & Tree Nut Check] Bibigo Mandu vs Korean Bakery Snacks — Sesame is mandatory on US labels',
      body: 'Since the FASTER Act made Sesame the 9th major FDA allergen, scanning Korean snacks is much safer. Most savory dumplings like Bibigo Steamed Chicken & Veggie Dumplings are peanut-free and tree-nut-free, but contain Sesame Oil, Wheat, and Soy. Watch out for Korean street hotteok (pancake mixes) which often include crushed peanuts in the brown sugar filling packet!',
      author: 'AllergySafeDadNY',
      pin: '0000',
      likes: 41,
      date: '2026-10-26',
      replies: [
        { by: 'BostonNutFree', text: 'Great point about Hotteok mixes! Always check the sugar filling sachet for 땅콩 (peanuts).' }
      ]
    },
    {
      id: 'kp-seed-6',
      tag: 'scoville',
      store: 'H Mart / Target / Amazon US',
      product: 'Nongshim Shin Ramyun US Beef vs Shin Green Vegan',
      title: '[Beef Broth Alert] US-sold Red Shin Ramyun contains Beef Bone Extract — swap to Shin Green or Soon Veggie!',
      body: 'In the US, standard red-pack Nongshim Shin Ramyun and Shin Black contain beef fat and beef bone extract in the soup base. If you are vegetarian, vegan, Hindu, or Halal-observant, grab Nongshim Shin Green (Tofu & Mushroom, ~2,200 SHU) or Nongshim Soon Veggie (~600 SHU mild) instead!',
      author: 'AustinRamenLab',
      pin: '0000',
      likes: 46,
      date: '2026-10-26',
      replies: []
    },
    {
      id: 'kp-seed-7',
      tag: 'gf',
      store: 'H Mart / Amazon US',
      product: 'Sempio 100% Sweet Potato Glass Noodles (Dangmyeon)',
      title: '[Celiac Safe] Korean Japchae Glass Noodles (Dangmyeon) are 100% Sweet Potato Starch & naturally Gluten-Free!',
      body: 'One of the best naturally gluten-free staples in Korean cuisine is Dangmyeon (당면). Authentic brands like Sempio and Chung Jung One use 100% sweet potato starch and water. Just swap regular soy sauce for Gluten-Free Tamari and toasted sesame oil to make 100% Celiac-safe Japchae at home.',
      author: 'GFKitchenBayArea',
      pin: '0000',
      likes: 38,
      date: '2026-10-25',
      replies: []
    },
    {
      id: 'kp-seed-8',
      tag: 'storefind',
      store: 'Costco US',
      product: 'Pulmuone Crispy Potato & Mozzarella Korean Corn Dogs',
      title: '[Costco Frozen] Pulmuone Korean Corn Dogs: Fish Cake warning on select varieties + Wheat/Milk/Egg',
      body: 'Before tossing Korean corn dogs into the air fryer, read which variety is in the box! All-Mozzarella and Half-Mozzarella/Sausage varieties differ—some Korean street corn dogs use fish cake (eomuk/surimi made with Alaska pollock) instead of beef/pork sausage. Contains Wheat, Milk, Egg, and Soy.',
      author: 'SoCalCostcoMom',
      pin: '0000',
      likes: 33,
      date: '2026-10-25',
      replies: []
    },
    {
      id: 'kp-seed-9',
      tag: 'vegan',
      store: 'Whole Foods / Amazon US',
      product: 'Sempio Yondu Vegetable Umami Seasoning Essence',
      title: '[Clean Swap] How to replace Anchovy Broth & Fish Sauce in Kimchi Jjigae with Sempio Yondu (GF + Vegan)',
      body: 'Whenever a Korean soup or tteokbokki recipe calls for anchovy-kelp stock (멸치육수) or fish sauce, I use 1 tablespoon of Sempio Yondu Umami Seasoning. It is fermented from non-GMO soybeans and vegetable broth—100% Vegan, Gluten-Free certified, and zero shellfish/fish!',
      author: 'BrooklynChefK',
      pin: '0000',
      likes: 44,
      date: '2026-10-24',
      replies: []
    },
    {
      id: 'kp-seed-10',
      tag: 'scoville',
      store: 'H Mart / 7-Eleven / Amazon US',
      product: 'Cantata Pouch Coffee, Binggrae Banana Milk & Lotte Milkis',
      title: '[Dairy & Caffeine] Korean Convenience Store Ice-Cup Pouch Drinks: Which ones have milk/whey?',
      body: 'Viral Korean convenience store drinks breakdown for US shoppers: Binggrae Banana Milk and Lotte Milkis both contain Milk/Skim Milk Powder (not dairy-free). However, Cantata Sweet Americano Pouch, Hazelnut Americano Pouch, Crushed Pear Juice (Bae), and Lotte BongBong Grape Juice are 100% Dairy-Free and Vegan!',
      author: 'KConvenienceAddict',
      pin: '0000',
      likes: 37,
      date: '2026-10-24',
      replies: []
    }
  ];

  const SEED_PROMOS = [
    {
      tier: 'premium',
      cat: 'gf-vegan',
      brand: 'O\'Food & Sempio Clean Pantry Showcase (Sample Slot)',
      badge: 'Certified Gluten-Free & Plant-Based',
      title: '100% Rice-Fermented Gluten-Free Gochujang, Ssamjang & Yondu Umami',
      stores: 'Available on Amazon US, Whole Foods Market, H Mart & Target',
      offer: 'Sample Brand Showcase Slot — Direct Amazon US & Retail Store Locator',
      desc: 'Reach high-intent US shoppers actively filtering for Celiac-safe (<20 ppm gluten), 100% Vegan, and FDA Top-9 allergen-transparent Korean sauces and marinades.',
      sample: true
    },
    {
      tier: 'premium',
      cat: 'vegan-kimchi',
      brand: 'Plant-Based & Shellfish-Free Fermented Kimchi Lab (Sample Slot)',
      badge: '100% Vegan · Zero Fish Sauce · Zero Shellfish',
      title: 'Probiotic Napa Cabbage & Radish Kimchi Crafted Without Anchovy or Shrimp',
      stores: 'Available at Costco, Trader Joe\'s, Sprouts, Target & Amazon Fresh',
      offer: 'Sample Brand Showcase Slot — Featured Clean Swap Placement',
      desc: 'Highlight your vegan, kosher, and crustacean-free Korean kimchi and banchan lineup to US families managing shellfish allergies and plant-based diets.',
      sample: true
    },
    {
      tier: 'premium',
      cat: 'halal-ramen',
      brand: 'Halal-Certified & Vegan K-Ramen Export Showcase (Sample Slot)',
      badge: 'KMF / JAKIM Halal & 100% Plant Broth',
      title: 'Verified Halal & Vegan Korean Instant Noodles, Tteokbokki & Pouch Drinks',
      stores: 'Available on Amazon US, H Mart, Walmart & International Grocers',
      offer: 'Sample Brand Showcase Slot — Scoville & Halal Verification Badge',
      desc: 'Showcase certified Halal, pork-free, and alcohol-free Korean ramen, rice cakes, and convenience store beverages to North American shoppers.',
      sample: true
    },
    {
      tier: 'standard',
      cat: 'kbbq-gear',
      brand: 'Indoor Smokeless K-BBQ Grill & Clean Tableware Partner (Sample Slot)',
      badge: 'PFOA-Free · PTFE-Free · Home K-BBQ',
      title: 'Smokeless Electric Grill Pans, Cast Iron Sotlid & Stainless Banchan Sets',
      stores: 'Available on Amazon US Prime & Specialty Kitchen Retailers',
      offer: 'Sample Brand Showcase Slot — K-BBQ at Home Guide Sponsorship',
      desc: 'Connect directly with US households searching for "Korean BBQ at home", smokeless tabletop grills, and non-toxic ceramic-coated grill plates.',
      sample: true
    },
    {
      tier: 'standard',
      cat: 'nut-free-snacks',
      brand: 'School-Safe Nut-Free K-Snack & Seaweed Box (Sample Slot)',
      badge: 'Peanut-Free · Tree-Nut-Free · USDA Organic',
      title: 'Organic Roasted Korean Gim (Seaweed Snacks) & Rice Poppers in Olive/Avocado Oil',
      stores: 'Available at Costco, Whole Foods, Thrive Market & Amazon US',
      offer: 'Sample Brand Showcase Slot — Allergy-Friendly Snack Directory',
      desc: 'Promote clean-oil, MSG-free, and peanut/tree-nut-safe Korean lunchbox snacks to allergy-conscious US parents.',
      sample: true
    },
    {
      tier: 'standard',
      cat: 'b2b-export',
      brand: 'K-Food FDA Label Compliance & US Retail Distribution Desk (Sample Slot)',
      badge: 'FDA FASTER Act · US Importer & Broker',
      title: 'Korean Food Brand US Market Entry, Allergen Labeling & Amazon Storefront Setup',
      stores: 'B2B Partnership via Duckcheon Industry Co., Ltd.',
      offer: 'Direct B2B Partnership & Sponsored Placement Inquiry',
      desc: 'Exporting K-Food to the United States? Partner with K-Pantry Scanner for clean-label consumer education, product verification cards, and Amazon US conversion.',
      sample: true
    }
  ];

  function getPosts() {
    const saved = LS('kpantry_posts_v1');
    return Array.isArray(saved) && saved.length ? saved : SEED_POSTS;
  }

  function savePosts(list) {
    LS('kpantry_posts_v1', list);
  }

  function getPromos() {
    const saved = LS('kpantry_promos_v1');
    return Array.isArray(saved) && saved.length ? saved : SEED_PROMOS;
  }

  function savePromos(list) {
    LS('kpantry_promos_v1', list);
  }

  function syncTopBar() {
    const member = LS('kpantry_member');
    $$('[data-member-btn]').forEach((b) => {
      b.textContent = member ? `✓ ${member}` : 'Set Shopper Nickname';
      b.classList.toggle('member-active', !!member);
    });
    $$('[data-admin-btn]').forEach((b) => {
      b.textContent = isAdmin() ? 'Admin ON' : 'Admin';
      b.classList.toggle('admin-active', isAdmin());
    });
    const adminPromoBtn = $('#adminAddPromoBtn');
    if (adminPromoBtn) {
      adminPromoBtn.style.display = isAdmin() ? 'inline-flex' : 'none';
    }
  }

  /* 1. Main Page Product Scanner & Diet/Category Filtering */
  function initProductScanner() {
    const grid = $('#productGrid');
    if (!grid) return;

    const searchInput = $('#pantrySearch');
    const storeSelect = $('#storeFilterSelect');
    const countEl = $('#pantryCount');
    let activeDiet = 'all';
    let activeCat = 'all';

    function applyFilter() {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const storeVal = (storeSelect ? storeSelect.value : 'all').toLowerCase();
      let visible = 0;

      $$('.product-card', grid).forEach((card) => {
        const diets = (card.dataset.diets || '').toLowerCase().split(/\s+/);
        const cat = (card.dataset.cat || '').toLowerCase();
        const stores = (card.dataset.stores || '').toLowerCase();
        const text = card.textContent.toLowerCase();

        const matchDiet = activeDiet === 'all' || diets.includes(activeDiet);
        const matchCat = activeCat === 'all' || cat === activeCat;
        const matchStore = storeVal === 'all' || stores.includes(storeVal);
        const matchQ = !q || text.includes(q);

        const show = matchDiet && matchCat && matchStore && matchQ;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (countEl) countEl.textContent = String(visible);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (storeSelect) storeSelect.addEventListener('change', applyFilter);

    $$('.diet-pill[data-diet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.diet-pill[data-diet]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeDiet = btn.dataset.diet || 'all';
        applyFilter();
      });
    });

    $$('.cat-pill[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.cat-pill[data-cat]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.cat || 'all';
        applyFilter();
      });
    });

    $$('[data-hot-query]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.hotQuery || '';
        const targetTab = chip.dataset.jumpTab || '';
        if (targetTab) {
          const tabBtn = $(`[data-qref-tab="${targetTab}"]`);
          if (tabBtn) tabBtn.click();
          const qrefEl = $('#k-quick-reference');
          if (qrefEl) qrefEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        $$('.diet-pill[data-diet]').forEach((b) => b.classList.toggle('active', b.dataset.diet === 'all'));
        $$('.cat-pill[data-cat]').forEach((b) => b.classList.toggle('active', b.dataset.cat === 'all'));
        activeDiet = 'all';
        activeCat = 'all';
        if (storeSelect) storeSelect.value = 'all';
        if (searchInput) {
          searchInput.value = q;
          applyFilter();
          const toolbar = $('#scannerToolbar');
          if (toolbar) toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* 2. K-Size & K-BBQ Quick Reference Interactive Tabs & Size Converter */
  function initQuickReference() {
    const tabBtns = $$('[data-qref-tab]');
    if (!tabBtns.length) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.qrefTab;
        tabBtns.forEach((b) => b.classList.toggle('active', b.dataset.qrefTab === target));
        $$('.qref-panel').forEach((p) => p.classList.toggle('active', p.id === 'qref-' + target));
      });
    });

    const clothSel = $('#krClothSelect');
    const shoeSel = $('#krShoeSelect');
    const outBox = $('#krSizeResultBox');

    const CLOTH_MAP = {
      '44': 'US Women XS (0–2) · Bust ~31–32" · Note: Korean 44 is petite/slim fit.',
      '55': 'US Women S (2–4) · Bust ~33–34" · Standard Korean Women\'s Small/Medium.',
      '66': 'US Women M (6–8) · Bust ~35–36.5" · Order 66 if you wear US Medium.',
      '77': 'US Women L (10–12) · Bust ~37.5–39" · Comfortable US Large equivalent.',
      '88': 'US Women XL (14) · Bust ~40–42" · Korean Plus/Relaxed XL.',
      '90': 'US Unisex XS / Men XS / Women S · Chest ~35" (Height 160–165 cm).',
      '95': 'US Men S / Women M · Chest ~37" (Height 165–170 cm).',
      '100': 'US Men M / Women L · Chest ~39" (Height 170–175 cm) · Most common Korean Men\'s M/L.',
      '105': 'US Men L / Women XL · Chest ~41" (Height 175–180 cm) · Size up to 105 for US Regular L.',
      '110': 'US Men XL–XXL · Chest ~43–45" (Height 180–185 cm).'
    };

    const SHOE_MAP = {
      '225': 'US Women 5.5 · EU 36 · Foot length 22.5 cm (8.85")',
      '230': 'US Women 6.0 · EU 36.5 · Foot length 23.0 cm (9.05")',
      '235': 'US Women 6.5 · EU 37.5 · Foot length 23.5 cm (9.25")',
      '240': 'US Women 7.0 / US Men 5.5 · EU 38 · Foot length 24.0 cm (9.45")',
      '245': 'US Women 7.5 / US Men 6.0 · EU 38.5 · Foot length 24.5 cm (9.65")',
      '250': 'US Women 8.0 / US Men 7.0 · EU 39–40 · Foot length 25.0 cm (9.84")',
      '255': 'US Women 8.5 / US Men 7.5 · EU 40.5 · Foot length 25.5 cm (10.04")',
      '260': 'US Women 9.0 / US Men 8.0 · EU 41 · Foot length 26.0 cm (10.24")',
      '265': 'US Men 8.5 / US Women 10.0 · EU 42 · Foot length 26.5 cm (10.43")',
      '270': 'US Men 9.0 / US Women 10.5 · EU 42.5 · Foot length 27.0 cm (10.63")',
      '275': 'US Men 9.5 · EU 43 · Foot length 27.5 cm (10.83")',
      '280': 'US Men 10.0 · EU 44 · Foot length 28.0 cm (11.02")',
      '285': 'US Men 10.5 · EU 44.5 · Foot length 28.5 cm (11.22")',
      '290': 'US Men 11.0 · EU 45 · Foot length 29.0 cm (11.42")'
    };

    function updateSizeCalc() {
      if (!outBox) return;
      const cVal = clothSel ? clothSel.value : '100';
      const sVal = shoeSel ? shoeSel.value : '250';
      outBox.innerHTML = `
        <div style="margin-bottom:6px;">👕 <strong>KR Size ${esc(cVal)}:</strong> ${esc(CLOTH_MAP[cVal] || '')}</div>
        <div>👟 <strong>KR Shoe ${esc(sVal)} mm:</strong> ${esc(SHOE_MAP[sVal] || '')}</div>
      `;
    }

    if (clothSel) clothSel.addEventListener('change', updateSizeCalc);
    if (shoeSel) shoeSel.addEventListener('change', updateSizeCalc);
    updateSizeCalc();
  }

  /* 3. Render Community Preview on Index */
  function renderRecentCommunityPreview() {
    const wrap = $('#recentCommunityPreview');
    if (!wrap) return;
    const list = getPosts().slice(0, 6);
    wrap.innerHTML = list
      .map(
        (p) => `
      <article class="post-card ${p.pinned ? 'pinned-post' : ''}">
        <div class="post-meta-top">
          <div class="post-badges">
            <span class="badge-diet-tag">${esc(DIET_TAG_LABELS[p.tag] || p.tag)}</span>
            ${p.store ? `<span class="badge-store-tag">🛒 ${esc(p.store)}</span>` : ''}
          </div>
          <span>${esc(p.author)} · ${esc(p.date)}</span>
        </div>
        <h3 class="post-title"><a href="community.html?tag=${esc(p.tag)}" style="color:inherit;">${esc(p.title)}</a></h3>
        <p class="post-body" style="margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.body)}</p>
        <div style="font-size:0.78rem;color:#059669;font-weight:700;">
          <a href="community.html?tag=${esc(p.tag)}">Read Full Label Breakdown &amp; Replies (${(p.replies || []).length}) →</a>
        </div>
      </article>`
      )
      .join('');
  }

  /* 4. Community Page Rendering & Filtering */
  let activeCommTag = 'all';

  function renderCommunityBoard() {
    const listEl = $('#communityPostList');
    if (!listEl) return;

    const searchQ = (($('#commSearchInput') || {}).value || '').trim().toLowerCase();
    const all = getPosts();
    const filtered = all.filter((p) => {
      const tMatch = activeCommTag === 'all' || p.tag === activeCommTag;
      const qMatch =
        !searchQ ||
        (p.title + ' ' + p.body + ' ' + (p.product || '') + ' ' + (p.store || ''))
          .toLowerCase()
          .includes(searchQ);
      return tMatch && qMatch;
    });

    const headerLabel = $('#commCurrentFilterLabel');
    if (headerLabel) {
      headerLabel.textContent =
        activeCommTag === 'all'
          ? `All US K-Food Label Q&A & Allergen Reports (${filtered.length})`
          : `${DIET_TAG_LABELS[activeCommTag] || activeCommTag} Reports (${filtered.length})`;
    }

    if (!filtered.length) {
      listEl.innerHTML = `<div class="post-card" style="text-align:center;padding:32px 16px;">
        <p style="font-weight:700;color:#14532d;margin:0 0 8px;">No label reports match this filter yet.</p>
        <p style="font-size:0.85rem;color:#4b5563;margin:0 0 14px;">Spotted a hidden allergen or found a great Gluten-Free / Vegan K-Food product at Costco, Trader Joe's, or H Mart?</p>
        <button class="btn btn-emerald" data-open-modal="writePostModal">+ Share First Label Report</button>
      </div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((p) => {
        const realIdx = all.findIndex((x) => x.id === p.id);
        const liked = LS('kpantry_liked_' + p.id);
        const replies = p.replies || [];
        return `
      <article class="post-card ${p.pinned ? 'pinned-post' : ''}">
        <div class="post-meta-top">
          <div class="post-badges">
            ${p.pinned ? '<span class="badge-diet-tag" style="background:#fef3c7;color:#92400e;border-color:#fde68a;">📌 Verified Alert</span>' : ''}
            <span class="badge-diet-tag">${esc(DIET_TAG_LABELS[p.tag] || p.tag)}</span>
            ${p.store ? `<span class="badge-store-tag">🛒 ${esc(p.store)}</span>` : ''}
            ${p.product ? `<span class="badge-store-tag">🏷️ ${esc(p.product)}</span>` : ''}
          </div>
          <span>✍ ${esc(p.author)} · ${esc(p.date)}</span>
        </div>
        <h3 class="post-title">${esc(p.title)}</h3>
        <p class="post-body">${esc(p.body)}</p>
        <div class="post-actions">
          <button class="action-chip ${liked ? 'liked' : ''}" data-like-id="${esc(p.id)}">♥ Helpful ${p.likes || 0}</button>
          <button class="action-chip" data-toggle-reply="${realIdx}">💬 Replies ${replies.length}</button>
          <button class="action-chip" data-del-post="${realIdx}">🗑 Delete (PIN/Admin)</button>
        </div>
        <div class="replies-box" id="replyBox-${realIdx}">
          ${replies
            .map(
              (r) =>
                `<div class="reply-item"><b>${esc(r.by)}</b>: ${esc(r.text)}</div>`
            )
            .join('')}
          <form data-reply-idx="${realIdx}" style="display:flex;gap:6px;margin-top:8px;">
            <input class="search-input" name="replyText" placeholder="Add a verified ingredient note or store sighting..." style="padding:7px 10px;font-size:0.82rem;" required>
            <button class="btn btn-forest" style="padding:7px 12px;font-size:0.8rem;white-space:nowrap;">Post Reply</button>
          </form>
        </div>
      </article>`;
      })
      .join('');
  }

  function initCommunityPage() {
    if (!$('#communityPostList')) return;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const tParam = (params.get('tag') || '').toLowerCase();
      if (tParam && DIET_TAG_LABELS[tParam]) {
        activeCommTag = tParam;
      }
    } catch (e) {}

    $$('[data-comm-tag]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.commTag === activeCommTag);
      btn.addEventListener('click', () => {
        activeCommTag = btn.dataset.commTag;
        $$('[data-comm-tag]').forEach((b) =>
          b.classList.toggle('active', b.dataset.commTag === activeCommTag)
        );
        renderCommunityBoard();
      });
    });

    const sInput = $('#commSearchInput');
    if (sInput) sInput.addEventListener('input', renderCommunityBoard);

    renderCommunityBoard();
  }

  /* 5. Promotions / Clean Brand Showcase Rendering */
  let activePromoCat = 'all';
  function renderPromos() {
    const grid = $('#promosGrid');
    if (!grid) return;
    const all = getPromos();
    const filtered = all.filter(
      (p) => activePromoCat === 'all' || p.cat === activePromoCat || p.tier === activePromoCat
    );
    grid.innerHTML = filtered
      .map((p, idx) => {
        return `
      <article class="partner-card ${p.tier === 'premium' ? 'tier-premium' : ''}">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
            <span class="badge-diet-tag">${esc(p.badge || 'Clean K-Food Partner')}</span>
            <span class="badge-sample-ad">${p.sample ? 'Sample Ad Slot' : 'Verified Brand Partner'}</span>
          </div>
          <div style="font-size:0.78rem;color:#059669;font-weight:800;margin-bottom:4px;">${esc(p.brand)}</div>
          <h3 style="font-size:1.02rem;font-weight:800;color:#111827;margin:0 0 8px;">${esc(p.title)}</h3>
          <div style="font-size:0.78rem;color:#374151;background:#f3f3ec;padding:5px 9px;border-radius:6px;margin-bottom:8px;">🛒 <strong>Retail Channels:</strong> ${esc(p.stores)}</div>
          <p style="font-size:0.84rem;color:#4b5563;margin:0 0 10px;">${esc(p.desc)}</p>
        </div>
        <div>
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 10px;border-radius:7px;font-size:0.79rem;font-weight:700;color:#065f46;margin-bottom:10px;">
            ✨ ${esc(p.offer)}
          </div>
          <div style="display:flex;gap:6px;">
            <a class="btn btn-forest" style="flex:1;padding:8px 10px;font-size:0.8rem;" href="mailto:duckcheonkorea@gmail.com?subject=${encodeURIComponent('[K-Pantry Scanner Brand Showcase Inquiry] ' + p.brand)}">
              ${p.sample ? '📩 Inquire About This Slot' : '📩 Brand Partnership Inquiry'}
            </a>
            ${isAdmin() ? `<button class="btn btn-outline" data-del-promo="${idx}" style="padding:8px 10px;font-size:0.8rem;">Delete</button>` : ''}
          </div>
        </div>
      </article>`;
      })
      .join('');
  }

  function initPromosPage() {
    if (!$('#promosGrid')) return;
    $$('[data-promo-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePromoCat = btn.dataset.promoFilter;
        $$('[data-promo-filter]').forEach((b) =>
          b.classList.toggle('active', b.dataset.promoFilter === activePromoCat)
        );
        renderPromos();
      });
    });
    renderPromos();
  }

  /* 6. Per-Article Comments */
  function renderArticleComments() {
    const box = $('#articleCmtList');
    if (!box) return;
    const key = 'kpantry_cmt_' + location.pathname;
    const list = LS(key) || [];
    if (!list.length) {
      box.innerHTML = '<p style="font-size:0.85rem;color:#6b7280;">No reader label notes yet. Leave the first question or store sighting below (4-digit PIN required)!</p>';
      return;
    }
    box.innerHTML = list
      .map(
        (c, i) => `
      <div class="reply-item" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;">
        <div>
          <b>${esc(c.author || 'US Shopper')}</b> <span class="badge-diet-tag">${esc(c.type || 'Label Tip')}</span> <small style="color:#6b7280;">${esc(c.date)}</small>
          <div style="margin-top:4px;color:#111827;">${esc(c.text)}</div>
        </div>
        <button class="action-chip" data-del-cmt="${i}">Delete</button>
      </div>`
      )
      .join('');
  }

  /* Global Click & Submit Listeners */
  document.addEventListener('click', (e) => {
    const mBtn = e.target.closest('[data-member-btn]');
    if (mBtn) {
      if (LS('kpantry_member')) {
        LS('kpantry_member', null);
      } else {
        const name = prompt('Enter your shopper nickname for Community Q&A & Comments:');
        if (name && name.trim()) LS('kpantry_member', name.trim().slice(0, 22));
      }
      syncTopBar();
    }

    const aBtn = e.target.closest('[data-admin-btn]');
    if (aBtn) {
      if (isAdmin()) {
        LS('kpantry_admin', false);
      } else {
        const pw = prompt('Enter Admin Password:');
        if (pw === 'duckcheonadmin') {
          LS('kpantry_admin', true);
        } else if (pw !== null) {
          alert('Invalid Admin password.');
        }
      }
      syncTopBar();
      renderCommunityBoard();
      renderPromos();
    }

    const openBtn = e.target.closest('[data-open-modal]');
    if (openBtn) {
      const mId = openBtn.dataset.openModal;
      if (mId === 'promoModal' && !isAdmin()) {
        alert('Admin access required. For Clean K-Food Brand Showcase inquiries, please email duckcheonkorea@gmail.com.');
        return;
      }
      const modal = $('#' + mId);
      if (modal) modal.classList.add('open');
    }

    const closeBtn = e.target.closest('.kp-modal-close');
    if (closeBtn) {
      closeBtn.closest('.kp-modal-backdrop')?.classList.remove('open');
    }

    const likeBtn = e.target.closest('[data-like-id]');
    if (likeBtn) {
      const id = likeBtn.dataset.likeId;
      const list = getPosts();
      const item = list.find((x) => x.id === id);
      if (item) {
        const k = 'kpantry_liked_' + id;
        const was = LS(k);
        item.likes = (item.likes || 0) + (was ? -1 : 1);
        LS(k, !was);
        savePosts(list);
        renderCommunityBoard();
      }
    }

    const delPostBtn = e.target.closest('[data-del-post]');
    if (delPostBtn) {
      const idx = +delPostBtn.dataset.delPost;
      const list = getPosts();
      const target = list[idx];
      if (!target) return;
      if (isAdmin() || prompt('Enter the 4-digit PIN set when creating this post:') === target.pin) {
        list.splice(idx, 1);
        savePosts(list);
        renderCommunityBoard();
        renderRecentCommunityPreview();
      } else {
        alert('Incorrect 4-digit PIN.');
      }
    }

    const delPromoBtn = e.target.closest('[data-del-promo]');
    if (delPromoBtn) {
      if (!isAdmin()) return;
      const idx = +delPromoBtn.dataset.delPromo;
      const list = getPromos();
      list.splice(idx, 1);
      savePromos(list);
      renderPromos();
    }

    const delCmtBtn = e.target.closest('[data-del-cmt]');
    if (delCmtBtn) {
      const key = 'kpantry_cmt_' + location.pathname;
      const list = LS(key) || [];
      const idx = +delCmtBtn.dataset.delCmt;
      if (!list[idx]) return;
      if (isAdmin() || prompt('Enter your 4-digit comment PIN:') === list[idx].pin) {
        list.splice(idx, 1);
        LS(key, list);
        renderArticleComments();
      } else {
        alert('Incorrect 4-digit PIN.');
      }
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'writePostForm') {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!pin4(d.pin)) {
        alert('Please enter a 4-digit numeric PIN (e.g. 1234) so you can edit or delete your post.');
        return;
      }
      const list = getPosts();
      list.unshift({
        id: 'post-' + Date.now(),
        tag: d.tag || 'gf',
        store: d.store || 'US Grocery',
        product: d.product || '',
        title: d.title,
        body: d.body,
        author: LS('kpantry_member') || d.author || 'USLabelScanner',
        pin: d.pin,
        likes: 1,
        date: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10),
        replies: []
      });
      savePosts(list);
      f.reset();
      f.closest('.kp-modal-backdrop')?.classList.remove('open');
      renderCommunityBoard();
      renderRecentCommunityPreview();
    }

    if (f.dataset.replyIdx !== undefined) {
      e.preventDefault();
      const idx = +f.dataset.replyIdx;
      const txt = (f.replyText.value || '').trim();
      if (!txt) return;
      const list = getPosts();
      if (list[idx]) {
        list[idx].replies = list[idx].replies || [];
        list[idx].replies.push({
          by: LS('kpantry_member') || 'KFoodShopper',
          text: txt
        });
        savePosts(list);
        renderCommunityBoard();
      }
    }

    if (f.id === 'promoForm') {
      e.preventDefault();
      if (!isAdmin()) {
        alert('Admin authorization (duckcheonadmin) required.');
        return;
      }
      const d = Object.fromEntries(new FormData(f));
      const list = getPromos();
      list.unshift({
        tier: d.tier || 'standard',
        cat: d.cat || 'gf-vegan',
        brand: d.brand,
        badge: d.badge || 'Verified Clean Partner',
        title: d.title,
        stores: d.stores,
        offer: d.offer || 'Featured Partner Showcase',
        desc: d.desc,
        sample: false
      });
      savePromos(list);
      f.reset();
      f.closest('.kp-modal-backdrop')?.classList.remove('open');
      renderPromos();
    }

    if (f.id === 'articleCmtForm') {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!pin4(d.pin)) {
        alert('Please enter a 4-digit numeric PIN.');
        return;
      }
      const key = 'kpantry_cmt_' + location.pathname;
      const list = LS(key) || [];
      list.unshift({
        author: LS('kpantry_member') || d.author || 'US Shopper',
        type: d.type || 'Label Tip',
        text: d.text,
        pin: d.pin,
        date: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
      });
      LS(key, list);
      f.reset();
      renderArticleComments();
    }
  });

  function init() {
    syncTopBar();
    initProductScanner();
    initQuickReference();
    renderRecentCommunityPreview();
    initCommunityPage();
    initPromosPage();
    renderArticleComments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
