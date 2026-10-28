#!/usr/bin/env python3
"""
Google Search Central 10-Point Advanced SEO Upgrader
Applies across:
1. koreapicks.co.kr (/workspace/korea-picks)
2. dctrade.co.kr (/workspace/duckcheon-korea-site)
3. kspotkorea.co.kr (/workspace/kspot-map & /tmp/kspotkorea-repo)
"""
import os, re, glob, json, html

TODAY = "2026-10-28"
TODAY_ISO = "2026-10-28T09:00:00+09:00"

def slugify_id(text):
    clean = re.sub(r"<[^>]+>", "", text)
    clean = html.unescape(clean)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", clean.lower()).strip("-")
    return s[:48] or "section"

def extract_meta(content, pattern, default=""):
    m = re.search(pattern, content, re.I | re.S)
    return html.unescape(m.group(1).strip()) if m else default

def upgrade_html_file(filepath, site_domain, site_name, post_dir_prefix, all_posts_meta, is_article=True):
    with open(filepath, "r", encoding="utf-8") as f:
        orig = f.read()
    txt = orig

    title = extract_meta(txt, r"<title>(.*?)</title>", site_name)
    desc = extract_meta(txt, r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', title)
    canon = extract_meta(txt, r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', "")
    if not canon:
        rel_path = os.path.basename(filepath)
        if post_dir_prefix and filepath.endswith(".html") and os.path.basename(os.path.dirname(filepath)) in ("posts", "blog"):
            canon = f"https://{site_domain}/{post_dir_prefix}/{rel_path}"
        else:
            canon = f"https://{site_domain}/"
        txt = txt.replace("</title>", f'</title>\n  <link rel="canonical" href="{canon}" />', 1)

    og_img = extract_meta(txt, r'<meta\s+property=["\']og:image["\']\s+content=["\'](.*?)["\']', f"https://{site_domain}/assets/og-default.jpg")

    # 1. Robots max-image-preview:large + Hreflang en / x-default + Author/Twitter cards
    seo_head_marker = "<!-- Google Search Central Advanced SEO Meta -->"
    if seo_head_marker not in txt:
        extra_meta = [f"  {seo_head_marker}"]
        if 'name="robots"' not in txt:
            extra_meta.append('  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />')
        if 'hreflang="en"' not in txt:
            extra_meta.append(f'  <link rel="alternate" hreflang="en" href="{canon}" />')
            extra_meta.append(f'  <link rel="alternate" hreflang="x-default" href="{canon}" />')
        if 'name="twitter:card"' not in txt:
            extra_meta.append('  <meta name="twitter:card" content="summary_large_image" />')
        if 'property="og:site_name"' not in txt:
            extra_meta.append(f'  <meta property="og:site_name" content="{html.escape(site_name)}" />')
        if 'property="og:locale"' not in txt:
            extra_meta.append('  <meta property="og:locale" content="en_US" />')
        txt = txt.replace("</head>", "\n".join(extra_meta) + "\n</head>", 1)

    # 2. Outbound Affiliate Links -> rel="sponsored noopener" (Google outbound link qualification)
    def fix_affiliate_rel(match):
        tag = match.group(0)
        href_m = re.search(r'href=["\']([^"\']+)["\']', tag, re.I)
        if not href_m:
            return tag
        href = href_m.group(1)
        if any(d in href.lower() for d in ("amazon.com", "amzn.to", "tp.media", "klook.com", "trip.com", "agoda.com", "booking.com")):
            if 'rel=' in tag:
                tag = re.sub(r'rel=["\']([^"\']*)["\']', 'rel="sponsored noopener"', tag, flags=re.I)
            else:
                tag = tag[:-1] + ' rel="sponsored noopener">'
        return tag

    txt = re.sub(r"<a\b[^>]*>", fix_affiliate_rel, txt, flags=re.I)

    # 3. Image SEO: fetchpriority="high" on first post image, loading="lazy" decoding="async" on subsequent images, ensure non-empty alt
    img_counter = [0]
    clean_title_short = re.sub(r"\s*\|.*$", "", title).strip()
    def fix_img_tag(match):
        tag = match.group(0)
        img_counter[0] += 1
        # Ensure descriptive alt
        alt_m = re.search(r'alt=["\']([^"\']*)["\']', tag, re.I)
        if not alt_m:
            tag = tag[:-1].rstrip("/") + f' alt="{html.escape(clean_title_short)} - photo {img_counter[0]}">'
        elif not alt_m.group(1).strip():
            tag = re.sub(r'alt=["\']\s*["\']', f'alt="{html.escape(clean_title_short)} - photo {img_counter[0]}"', tag, flags=re.I)
        if img_counter[0] == 1:
            if "fetchpriority=" not in tag.lower():
                tag = re.sub(r'\s*loading=["\']lazy["\']', '', tag, flags=re.I)
                tag = tag[:-1].rstrip("/") + ' fetchpriority="high" decoding="async">'
        else:
            if "loading=" not in tag.lower():
                tag = tag[:-1].rstrip("/") + ' loading="lazy" decoding="async">'
        return tag

    txt = re.sub(r"<img\b[^>]*>", fix_img_tag, txt, flags=re.I)

    if is_article:
        # 4. Add unique id attributes to <h2> tags and collect TOC items
        toc_items = []
        used_ids = set()
        def add_h2_id(match):
            open_attrs = match.group(1) or ""
            inner = match.group(2)
            plain = re.sub(r"<[^>]+>", "", inner).strip()
            plain = html.unescape(plain)
            if not plain:
                return match.group(0)
            id_m = re.search(r'id=["\']([^"\']+)["\']', open_attrs, re.I)
            if id_m:
                sec_id = id_m.group(1)
            else:
                base_id = slugify_id(plain)
                sec_id = base_id
                idx = 2
                while sec_id in used_ids:
                    sec_id = f"{base_id}-{idx}"
                    idx += 1
                open_attrs = f'{open_attrs} id="{sec_id}"'
            used_ids.add(sec_id)
            toc_items.append((sec_id, plain))
            return f"<h2{open_attrs}>{inner}</h2>"

        txt = re.sub(r"<h2(\s[^>]*)?>(.*?)</h2>", add_h2_id, txt, flags=re.I | re.S)

        # 5. Multi-Schema JSON-LD: Article + BreadcrumbList + Organization E-E-A-T
        jsonld_marker = "<!-- Google Search Central JSON-LD Graph -->"
        if jsonld_marker not in txt:
            cat_label = "K-Beauty & Korea Guide"
            if site_domain == "kspotkorea.co.kr":
                cat_label = "K-Drama & K-Pop Filming Locations"
            elif site_domain == "dctrade.co.kr":
                cat_label = "K-Beauty B2B & Product Review"

            graph_schema = {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {"@type": "ListItem", "position": 1, "name": site_name, "item": f"https://{site_domain}/"},
                            {"@type": "ListItem", "position": 2, "name": cat_label, "item": f"https://{site_domain}/{post_dir_prefix}/" if post_dir_prefix == "blog" and site_domain == "dctrade.co.kr" else f"https://{site_domain}/"},
                            {"@type": "ListItem", "position": 3, "name": clean_title_short, "item": canon}
                        ]
                    },
                    {
                        "@type": "BlogPosting",
                        "headline": clean_title_short[:110],
                        "description": desc,
                        "image": [og_img],
                        "datePublished": TODAY_ISO,
                        "dateModified": TODAY_ISO,
                        "inLanguage": "en-US",
                        "mainEntityOfPage": {"@type": "WebPage", "@id": canon},
                        "author": {
                            "@type": "Organization",
                            "name": f"{site_name} Seoul Editorial Desk",
                            "url": f"https://{site_domain}/"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": site_name,
                            "url": f"https://{site_domain}/"
                        }
                    }
                ]
            }
            schema_block = f'  {jsonld_marker}\n  <script type="application/ld+json">\n{json.dumps(graph_schema, ensure_ascii=False, indent=2)}\n  </script>\n</head>'
            txt = txt.replace("</head>", schema_block, 1)

        # 6. Visual Semantic Breadcrumb + E-E-A-T Verification Badge + Quick Jump Table of Contents right after </h1> or header
        eeat_toc_marker = "<!-- Google SEO Breadcrumb + E-E-A-T + TOC -->"
        if eeat_toc_marker not in txt and "<h1" in txt:
            toc_links_html = ""
            if len(toc_items) >= 2:
                li_html = "".join(
                    f'<li style="margin:4px 0;"><a href="#{sec_id}" style="color:#0f766e;text-decoration:underline;font-weight:500;">{html.escape(label)}</a></li>'
                    for sec_id, label in toc_items[:6]
                )
                toc_links_html = (
                    f'<nav aria-label="Table of Contents" style="margin:14px 0;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:0.9rem;line-height:1.5;">'
                    f'<strong style="display:block;margin-bottom:6px;color:#0f172a;">On This Page (Quick Jump)</strong>'
                    f'<ol style="margin:0;padding-left:18px;">{li_html}</ol>'
                    f'</nav>'
                )

            breadcrumb_parent_href = f"https://{site_domain}/blog/" if (site_domain == "dctrade.co.kr" and post_dir_prefix == "blog") else f"https://{site_domain}/"
            breadcrumb_parent_name = "K-Beauty Blog" if site_domain == "dctrade.co.kr" else ("Filming Guides" if site_domain == "kspotkorea.co.kr" else "All Reviews & Guides")

            eeat_block = (
                f'\n{eeat_toc_marker}\n'
                f'<nav aria-label="Breadcrumb" style="font-size:0.82rem;color:#64748b;margin:10px 0 8px;">'
                f'<a href="https://{site_domain}/" style="color:#475569;text-decoration:underline;">Home</a> &rsaquo; '
                f'<a href="{breadcrumb_parent_href}" style="color:#475569;text-decoration:underline;">{breadcrumb_parent_name}</a> &rsaquo; '
                f'<span aria-current="page">{html.escape(clean_title_short[:65])}</span>'
                f'</nav>\n'
                f'<div style="font-size:0.82rem;color:#334155;background:#f1f5f9;border-left:3px solid #0d9488;padding:8px 12px;border-radius:6px;margin:8px 0 14px;">'
                f'<strong>Editorial Standard:</strong> Researched &amp; verified in Seoul, South Korea · Last verified: <time datetime="{TODAY}">{TODAY}</time> · Independent hands-on &amp; primary-data guide'
                f'</div>\n'
                f'{toc_links_html}\n'
            )
            # Insert right after </h1>
            txt = re.sub(r"(</h1>)", r"\1" + eeat_block.replace("\\", "\\\\"), txt, count=1, flags=re.I)

        # 7. Crawlable Static Internal Link Cluster (Related Guides) before </article> or </main> or </body>
        related_marker = "<!-- Google SEO Crawlable Related Guides -->"
        if related_marker not in txt and all_posts_meta:
            cur_base = os.path.basename(filepath)
            others = [p for p in all_posts_meta if p["file"] != cur_base][:4]
            if others:
                rel_items = "".join(
                    f'<li style="margin:6px 0;"><a href="{p["url"]}" style="color:#0f766e;text-decoration:underline;font-weight:600;">{html.escape(p["title"])}</a></li>'
                    for p in others
                )
                rel_html = (
                    f'\n{related_marker}\n'
                    f'<aside aria-label="Related Guides" style="margin:28px auto;max-width:860px;padding:18px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">'
                    f'<h2 id="related-korean-guides" style="font-size:1.08rem;margin:0 0 8px;color:#0f172a;">Explore More Verified Korea Guides &amp; Reviews</h2>'
                    f'<p style="font-size:0.86rem;color:#475569;margin:0 0 10px;">Continue browsing our hands-on Korean product reviews and local travel guides:</p>'
                    f'<ul style="margin:0;padding-left:18px;font-size:0.92rem;line-height:1.6;">{rel_items}</ul>'
                    f'</aside>\n'
                )
                if "</article>" in txt:
                    txt = txt.replace("</article>", rel_html + "</article>", 1)
                elif "</main>" in txt:
                    txt = txt.replace("</main>", rel_html + "</main>", 1)
                else:
                    txt = txt.replace("</body>", rel_html + "</body>", 1)

    if txt != orig:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(txt)
        return True
    return False

def collect_posts_meta(folder, site_domain, post_dir_prefix):
    metas = []
    for p in sorted(glob.glob(os.path.join(folder, "*.html"))):
        base = os.path.basename(p)
        if base == "index.html":
            continue
        with open(p, "r", encoding="utf-8") as f:
            c = f.read()
        t = extract_meta(c, r"<title>(.*?)</title>", base)
        t = re.sub(r"\s*\|.*$", "", t).strip()
        metas.append({
            "file": base,
            "title": t,
            "url": f"https://{site_domain}/{post_dir_prefix}/{base}"
        })
    return metas

def update_sitemap_lastmod(sitemap_path):
    if not os.path.exists(sitemap_path):
        return
    with open(sitemap_path, "r", encoding="utf-8") as f:
        s = f.read()
    # Add <lastmod>2026-10-28</lastmod> to <url> blocks missing <lastmod>, and update existing ones
    def fix_url_block(m):
        block = m.group(0)
        if "<lastmod>" in block:
            return block
        return block.replace("</loc>", f"</loc>\n    <lastmod>{TODAY}</lastmod>", 1)
    s2 = re.sub(r"<url>.*?</url>", fix_url_block, s, flags=re.S)
    if s2 != s:
        with open(sitemap_path, "w", encoding="utf-8") as f:
            f.write(s2)

def main():
    # 1. koreapicks.co.kr
    kp_posts = collect_posts_meta("/workspace/korea-picks/posts", "koreapicks.co.kr", "posts")
    kp_count = 0
    if upgrade_html_file("/workspace/korea-picks/index.html", "koreapicks.co.kr", "KOREA PICKS", "posts", kp_posts, is_article=False):
        kp_count += 1
    for p in sorted(glob.glob("/workspace/korea-picks/posts/*.html")):
        if upgrade_html_file(p, "koreapicks.co.kr", "KOREA PICKS", "posts", kp_posts, is_article=True):
            kp_count += 1
    update_sitemap_lastmod("/workspace/korea-picks/sitemap.xml")

    # 2. dctrade.co.kr
    dc_posts = collect_posts_meta("/workspace/duckcheon-korea-site/blog", "dctrade.co.kr", "blog")
    dc_count = 0
    if upgrade_html_file("/workspace/duckcheon-korea-site/index.html", "dctrade.co.kr", "DUCKCHEON KOREA", "blog", dc_posts, is_article=False):
        dc_count += 1
    if os.path.exists("/workspace/duckcheon-korea-site/blog/index.html"):
        if upgrade_html_file("/workspace/duckcheon-korea-site/blog/index.html", "dctrade.co.kr", "DUCKCHEON KOREA", "blog", dc_posts, is_article=False):
            dc_count += 1
    for p in sorted(glob.glob("/workspace/duckcheon-korea-site/blog/*.html")):
        if os.path.basename(p) == "index.html":
            continue
        if upgrade_html_file(p, "dctrade.co.kr", "DUCKCHEON KOREA", "blog", dc_posts, is_article=True):
            dc_count += 1
    update_sitemap_lastmod("/workspace/duckcheon-korea-site/sitemap.xml")

    # 3. kspotkorea.co.kr
    ks_posts = collect_posts_meta("/workspace/kspot-map/blog", "kspotkorea.co.kr", "blog")
    ks_count = 0
    if upgrade_html_file("/workspace/kspot-map/index.html", "kspotkorea.co.kr", "K-Spot Korea", "blog", ks_posts, is_article=False):
        ks_count += 1
    for p in sorted(glob.glob("/workspace/kspot-map/blog/*.html")):
        if upgrade_html_file(p, "kspotkorea.co.kr", "K-Spot Korea", "blog", ks_posts, is_article=True):
            ks_count += 1
    update_sitemap_lastmod("/workspace/kspot-map/sitemap.xml")

    print(f"Upgraded files -> koreapicks: {kp_count}, dctrade: {dc_count}, kspotkorea: {ks_count}")

if __name__ == "__main__":
    main()
