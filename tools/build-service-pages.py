#!/usr/bin/env python3
"""
Build the service pages for archatsrenovation.com.

One page per service, each with its own title, H1, meta description, copy,
FAQ schema and internal links. Content is written by hand in CONTENT — this
script only handles chrome, schema and layout so the pages stay consistent.

Run from the repo root:  python3 tools/build-service-pages.py
"""
import json
import os
import html

OUT = os.getcwd()

PHONE = "(917) 780-9790"
TEL = "+19177809790"
EMAIL = "archatsllc@gmail.com"
SITE = "https://archatsrenovation.com"

NAV = [
    ("Services", "/#services"),
    ("About", "/#about"),
    ("Our Work", "/#work"),
    ("Process", "/#process"),
    ("Service Areas", "/#areas"),
    ("Contact", "/#contact"),
]

PIN = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
       'stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>'
       '<circle cx="12" cy="10" r="3"/></svg>')


CONTENT = [
    {
        "slug": "kitchen-remodeling",
        "nav": "Kitchen Remodeling",
        "h1": "Kitchen Remodeling in Queens, NY",
        "title": "Kitchen Remodeling in Queens, NY | Archats LLC",
        "desc": "Full kitchen remodels in Queens: cabinets, countertops, layout changes, plumbing and electrical. Family owned, licensed and insured. Free estimate.",
        "img": "/images/service-kitchen.webp",
        "alt": "Kitchen remodel with new cabinets and island",
        "lede": "Most Queens kitchens were laid out for a different decade, in a different kind of household. We rebuild them around how the room actually gets used — and we stay on the job until the last piece of trim is back on.",
        "body": [
            ("What a kitchen remodel actually involves",
             ["A kitchen is the one room where every trade shows up. We run it as a single job instead of handing you off between a cabinet guy, a plumber and an electrician who never speak to each other.",
              "That means one schedule, one point of contact, and a written scope before anything gets demoed."]),
        ],
        "includes": [
            "Full gut demolition and haul-away, including old soffits and dropped ceilings",
            "Cabinet layout changes — moving a sink, adding an island, opening a wall that was closing the room off",
            "Plumbing and gas rough-in for relocated sinks, dishwashers and ranges",
            "New electrical circuits, under-cabinet lighting, and outlets where you actually need them",
            "Countertop templating and install — quartz, granite, or butcher block",
            "Backsplash, flooring, trim, and paint to finish the room",
        ],
        "steps": [
            ("Walkthrough", "We measure the room, look at what's behind the walls, and talk through what you want to change. You get a line-item estimate, not a lump sum."),
            ("Plan", "If walls are moving or plumbing is relocating, we sort out what needs a filing and what doesn't before demo starts."),
            ("Build", "Demo, rough-ins, inspections, then cabinets and finishes. You get a daily update and the site gets swept every night."),
            ("Close-out", "We walk the finished kitchen with you, fix the punch list, and leave the warranty in writing."),
        ],
        "price": [
            "Whether the layout changes or stays put — moving a sink or a gas line costs more than swapping cabinets in place.",
            "Cabinet grade and whether you're going stock, semi-custom, or fully built.",
            "Countertop material and square footage, especially if there's an island or a waterfall edge.",
            "Whether the electrical panel has room for new circuits, which is common in older Queens homes.",
        ],
        "faqs": [
            ("How long does a kitchen remodel take?",
             "A straightforward kitchen runs three to four weeks. Once you move plumbing, gas, or a load-bearing wall, plan on five to seven. We give you a start and end date before demo and tell you the same day if something changes it."),
            ("Can you work while we're still living in the house?",
             "Yes, and most of our clients do. We seal off the work area, keep a temporary sink or microwave setup if you need one, and clean up at the end of every day. It's loud for the demo week and calmer after that."),
            ("Do you handle the permits?",
             "Yes. When a job needs a DOB filing or a licensed trade sign-off, we handle it as part of the job. If you're in a co-op or condo, we'll also give you the paperwork your board asks for."),
        ],
        "related": ["bathroom-renovation", "flooring", "painting"],
    },
    {
        "slug": "bathroom-renovation",
        "nav": "Bathroom Renovation",
        "h1": "Bathroom Renovation in Queens, NY",
        "title": "Bathroom Renovation in Queens, NY | Archats LLC",
        "desc": "Bathroom remodeling in Queens — tile, showers, vanities, layout changes and leak repairs. Waterproofing done properly. Licensed and insured, free estimate.",
        "img": "/images/service-bathroom.webp",
        "alt": "Renovated bathroom with tiled shower",
        "lede": "A bathroom is the smallest room in the house and the one where shortcuts cost the most. Almost every bathroom we're called in to fix was failed waterproofing, not bad tile.",
        "body": [
            ("Why bathrooms go wrong",
             ["Water doesn't announce itself. It gets behind a tile, sits on a cement board that wasn't sealed at the seams, and shows up six months later as a soft spot in the hallway ceiling.",
              "We build the wet area properly — substrate, membrane, flood test — before a single tile goes up. That's the part you never see, and it's the part that decides whether the job lasts."]),
        ],
        "includes": [
            "Full demo, including old mud beds and cast iron tubs",
            "Subfloor and joist repair where water has done damage",
            "Cement board and roll-on or sheet waterproofing with a flood test",
            "Tile install — floor, walls, niche, curb, and a proper drain slope",
            "Shower valve, tub-to-shower conversion, and new fixtures",
            "Vanity, vanity top, mirror, lighting and exhaust fan vented to the outside",
        ],
        "steps": [
            ("Inspect", "We open up the wet wall and look for the real problem before quoting. If there's rot or a slow leak, you find out now, not mid-job."),
            ("Select", "Tile, fixtures and layout get picked before demo, so nothing sits half-finished waiting on a delivery."),
            ("Build", "Rough-in, inspection, waterproofing, flood test, then tile. The flood test is non-negotiable on our jobs."),
            ("Finish", "Fixtures, glass, caulk, paint, and a walkthrough with you before we call it done."),
        ],
        "price": [
            "Whether the layout moves — relocating a drain or a toilet is a different job than replacing them in place.",
            "Tile choice and pattern; large-format and herringbone take longer to set.",
            "Whether there's water damage under the floor, which you can't know until demo.",
            "Glass vs curtain, and whether you want a curbless shower, which needs the floor rebuilt.",
        ],
        "faqs": [
            ("How long does a bathroom take?",
             "One to two weeks for a standard hall bath. A primary bath with a layout change runs two to three. The flood test adds a day and we don't skip it."),
            ("My ceiling below the bathroom is stained. Is that a tile problem?",
             "Usually not the tile — it's the waterproofing, a failed shower pan, or a supply line. We open the ceiling, find the source, and fix that before we touch the surface. Otherwise you're paying twice."),
            ("Can you convert my tub to a walk-in shower?",
             "Yes, and it's one of the most common jobs we do in Queens rowhouses. It requires moving the drain and usually re-framing the floor, so it's priced as a layout change, not a swap."),
        ],
        "related": ["kitchen-remodeling", "basement-finishing", "painting"],
    },
    {
        "slug": "roofing",
        "nav": "Roofing",
        "h1": "Roofing & Roof Repair in Queens, NY",
        "title": "Roofing & Roof Repair in Queens, NY | Archats LLC",
        "desc": "Flat roof replacement, shingle roofs, leak repair and flashing in Queens and Brooklyn. Honest diagnosis, written warranty. Licensed and insured.",
        "img": "/images/service-roofing.webp",
        "alt": "Roof replacement in progress",
        "lede": "Most Queens rowhouses have a flat roof, and most flat roof leaks come from the same three places: a seam, a drain, or where the roof meets a wall. Finding which one is the whole job.",
        "body": [
            ("Repair first, replace when it's earned",
             ["Not every leak needs a new roof, and we'll tell you when a repair will hold. What we won't do is patch the same spot every spring for three years.",
              "We get on the roof, photograph what we find, and show you before recommending anything."]),
        ],
        "includes": [
            "Flat roof systems — modified bitumen and EPDM — plus asphalt shingle on pitched roofs",
            "Tear-off and disposal, or a second layer where code and condition allow it",
            "Flashing at chimneys, skylights, parapet walls and bulkheads",
            "Drains, scuppers and gutters cleared and re-pitched",
            "Sheathing and fascia repair where water has been getting in",
            "Written workmanship warranty on full replacements",
        ],
        "steps": [
            ("Diagnose", "We go up, photograph the membrane, seams and flashings, and trace the water back to where it's actually entering."),
            ("Quote", "You get two numbers when both are honest: what a repair costs, and what a replacement costs. No pressure toward the bigger one."),
            ("Work", "Most repairs are done in a day. A full flat roof on a rowhouse is typically one to three days, weather permitting."),
            ("Check", "We water-test the repaired area and walk you through photos of the finished roof."),
        ],
        "price": [
            "Square footage and how many penetrations — skylights, vents, chimneys — have to be flashed.",
            "Tear-off vs going over an existing layer, which depends on code and the condition underneath.",
            "Whether the decking is sound or has soft spots that need replacing.",
            "Access — a roof you can reach from a bulkhead is a different day than one that needs a lift.",
        ],
        "faqs": [
            ("Can you tell if I need a full replacement?",
             "Usually yes, on the first visit. If the membrane is brittle, the seams are failing across the whole roof, or there's standing water, patching is throwing money at it. If it's one bad seam, we'll repair it and say so."),
            ("Do you do emergency leaks?",
             "We get out as fast as we can for active leaks, and we'll do a temporary seal to stop the damage while we schedule the real repair."),
            ("Will you work with my insurance?",
             "Yes. We document the damage with photos and a written scope, which is what an adjuster needs to process a storm claim."),
        ],
        "related": ["siding-exterior", "home-additions", "painting"],
    },
    {
        "slug": "siding-exterior",
        "nav": "Siding & Exterior",
        "h1": "Siding & Exterior Work in Queens, NY",
        "title": "Siding, Trim & Exterior Work in Queens, NY | Archats LLC",
        "desc": "Siding replacement, house wrap, trim, fascia and exterior repairs in Queens and Brooklyn. Curb appeal that also stops water. Licensed and insured.",
        "img": "/images/service-siding.webp",
        "alt": "New siding and exterior trim on a house",
        "lede": "Siding is two jobs in one: it's what the house looks like, and it's what keeps the weather out of the walls. Doing the second one badly is how you end up with rotten sheathing behind a wall that still looks fine.",
        "body": [
            ("What's behind the siding matters more than the siding",
             ["We strip the old material, check the sheathing, and repair what's soft before anything new goes on. House wrap and flashing get done properly, because that's the layer actually doing the work.",
              "Then the finish goes on, and the house looks like it should."]),
        ],
        "includes": [
            "Vinyl and fiber cement siding, plus trim and corner boards",
            "House wrap, flashing and sheathing repair",
            "Fascia, soffit and rake boards",
            "Window and door trim, and replacing rotted sills",
            "Stoop, porch and bulkhead repairs",
            "Exterior painting and caulking where the job calls for it",
        ],
        "steps": [
            ("Look", "We walk the exterior and point out where water is getting in — usually at trim, sills and the bottom course, not the middle of a wall."),
            ("Scope", "You get a written scope that separates repairs from the siding itself, so you can decide how far to go."),
            ("Install", "Strip, repair, wrap, flash, then siding. Most houses take one to two weeks."),
            ("Finish", "Trim, caulk, paint where needed, and a final walk around the house with you."),
        ],
        "price": [
            "How much sheathing and trim repair is hiding under the old siding.",
            "Material — vinyl is the budget choice, fiber cement costs more and lasts longer.",
            "How much of the job is height and access, which slows everything down.",
            "Whether windows and doors need new trim and flashing while the walls are open.",
        ],
        "faqs": [
            ("Is fiber cement worth the extra cost over vinyl?",
             "If you're staying in the house, usually yes — it holds paint longer and doesn't get brittle in the sun. If you're prepping to sell in a couple of years, vinyl gets you the look for less."),
            ("Can you match my existing siding for a partial job?",
             "Sometimes, but matching a weathered profile is hard. We'll tell you honestly whether a partial patch will blend or whether it'll always be visible."),
            ("Do you repair rot, or just cover it?",
             "We repair it. Covering soft sheathing is how a small repair becomes a structural problem two winters later."),
        ],
        "related": ["roofing", "painting", "home-additions"],
    },
    {
        "slug": "home-additions",
        "nav": "Additions",
        "h1": "Home Additions & Extensions in Queens, NY",
        "title": "Home Additions & Extensions in Queens, NY | Archats LLC",
        "desc": "Rear extensions, dormers and second-floor additions in Queens and Brooklyn. Permits, plans and build handled as one job. Licensed and insured.",
        "img": "/images/service-additions.webp",
        "alt": "Home addition under construction",
        "lede": "An addition is the most paperwork-heavy thing you can do to a house in New York, and the paperwork is not the annoying part — it's the part that decides whether the job is legal and insurable when it's done.",
        "body": [
            ("Zoning comes before design",
             ["How far back you can build, how tall, and how much floor area you're allowed are all set by the zoning lot before anyone draws a room. We start there, because a beautiful plan that can't be filed is a waste of your money.",
              "Once the envelope is settled, the build is straightforward: foundation, frame, tie into the existing structure, then finish."]),
        ],
        "includes": [
            "Rear and side extensions, second-floor additions, and dormers",
            "Zoning review, architect and engineer coordination",
            "DOB filings and permit management",
            "Foundation, framing and structural tie-in to the existing house",
            "Roof, siding, windows and exterior finish to match",
            "Interior build-out — electrical, plumbing, insulation, drywall, finishes",
        ],
        "steps": [
            ("Feasibility", "We check what the lot allows and what it will cost, roughly, before you spend money on drawings."),
            ("Design & file", "Architect and engineer produce the plans; we manage the filing and the back-and-forth with the department."),
            ("Build", "Foundation through framing, with inspections at each stage. Typical builds run four to six months."),
            ("Finish", "Exterior tie-in, interior finishes, and a final inspection before close-out."),
        ],
        "price": [
            "Size and whether it's slab, crawl or pile foundation — Queens lots vary a lot on this.",
            "How much structural work is needed at the tie-in point.",
            "Finish level inside, which swings the number more than people expect.",
            "Whether the existing house needs upgrades — service panel, heating — to carry the new space.",
        ],
        "faqs": [
            ("Do I need an architect?",
             "For a filed addition, yes — the plans have to be sealed. We work with architects and engineers we've done jobs with, or we'll work with yours."),
            ("How long does the permit take?",
             "It varies by scope and borough. Straightforward rear extensions are often a few months; anything touching zoning variances takes longer. We tell you the realistic timeline up front rather than the optimistic one."),
            ("Can we live in the house during the build?",
             "Yes, in most cases. The addition gets sealed off from the living space, and we keep a clear path for you through the yard and the side of the house."),
        ],
        "related": ["kitchen-remodeling", "roofing", "siding-exterior"],
    },
    {
        "slug": "basement-finishing",
        "nav": "Basements",
        "h1": "Basement Finishing in Queens, NY",
        "title": "Basement Finishing & Remodeling in Queens, NY | Archats LLC",
        "desc": "Finished basements in Queens and Brooklyn — waterproofing first, then framing, electrical and finishes. Legal, dry, and built to last. Free estimate.",
        "img": "/images/service-basement.webp",
        "alt": "Finished basement room",
        "lede": "Every finished basement in Queens is a water management project first and a construction project second. If the water isn't handled, the finishes are just expensive sponges.",
        "body": [
            ("Dry first, pretty second",
             ["We start by finding where water actually comes in — the cove joint, a crack, hydrostatic pressure through the slab — because each one has a different fix. Sump and drainage where it's needed, crack injection where it isn't.",
              "Then the framing goes up off the floor, with foam and a vapor path that lets the assembly dry. That's how a basement stays a room instead of becoming a smell."]),
        ],
        "includes": [
            "Waterproofing — crack injection, interior drainage, sump pumps",
            "Framing with a gap at the slab, spray foam and vapor management",
            "Electrical, lighting layout and dedicated circuits",
            "Ceiling options that keep access to pipes and ducts",
            "Flooring rated for below grade, and stairs and railings",
            "Bathroom or kitchenette rough-in where the layout allows it",
        ],
        "steps": [
            ("Assess water", "We look at the walls, the cove joint and the slab after rain if we can, and recommend the fix that matches the actual cause."),
            ("Plan", "Layout, ceiling height and egress get settled before framing, since each one constrains the others."),
            ("Build", "Waterproofing, framing, rough-ins, inspection, insulation, drywall, finishes."),
            ("Finish", "Trim, paint, flooring and a walkthrough. Three to five weeks for most basements."),
        ],
        "price": [
            "Waterproofing scope — that's the variable that changes the number most.",
            "Ceiling height, which decides whether you can drop a ceiling or need to work around pipes.",
            "Whether a bathroom is added, since that brings in breaking the slab.",
            "Egress requirements if a bedroom is part of the plan.",
        ],
        "faqs": [
            ("Can I add a legal basement apartment?",
             "Sometimes, and it depends on zoning, egress, ceiling height and the certificate of occupancy for the building. We'll tell you what's realistic for your address before you spend on plans — and we won't build something that can't be legalized."),
            ("My basement smells musty but there's no visible water. Why?",
             "Usually humidity coming through the slab and walls rather than a leak. That's a vapor and drainage issue, and it has to be handled before insulation and drywall go on."),
            ("Do I lose ceiling height?",
             "Some, but less than people expect. We plan around ducts and beams rather than dropping the whole ceiling, so you keep as much height as the structure allows."),
        ],
        "related": ["bathroom-renovation", "flooring", "home-additions"],
    },
    {
        "slug": "painting",
        "nav": "Painting",
        "h1": "Interior & Exterior Painting in Queens, NY",
        "title": "Interior & Exterior Painting in Queens, NY | Archats LLC",
        "desc": "Interior and exterior painting with proper prep — patching, sanding, priming and clean cut lines. Queens and Brooklyn. Licensed and insured.",
        "img": "/images/service-painting.webp",
        "alt": "Interior painting in progress",
        "lede": "Paint fails at the prep, not the paint. A wall that was patched and never sanded will show every seam in raking light, no matter what's in the can.",
        "body": [
            ("The work is in the prep",
             ["We patch, sand, prime and caulk before a finish coat goes anywhere near the wall. Furniture gets moved and covered, floors get protected, and the trim lines are cut by hand rather than taped.",
              "Two coats, proper dry time, and a walkthrough under a work light before we call it done."]),
        ],
        "includes": [
            "Interior walls, ceilings, trim, doors and radiators",
            "Drywall patching, spackle, sanding and spot priming",
            "Exterior painting including trim, fascia and doors",
            "Caulking and sealing where water gets in",
            "Color consultation if you want a second opinion",
            "Furniture moving and full floor protection",
        ],
        "steps": [
            ("Walk", "Room by room, we note what needs patching and what needs more than paint — water stains usually mean a leak, not a color problem."),
            ("Prep", "Move, cover, patch, sand, prime. This is most of the job and it's where the schedule lives."),
            ("Paint", "Two finish coats, cut by hand, with proper dry time between."),
            ("Check", "A walkthrough under work light, touch-ups on the spot, then cleanup."),
        ],
        "price": [
            "Square footage and ceiling height — stairwells and double-height rooms take longer.",
            "How much patching and sanding is needed, which is the single biggest variable.",
            "Number of colors and whether trim and doors are included.",
            "Whether the exterior needs scraping, which is a different job than a recoat.",
        ],
        "faqs": [
            ("Do you fix the walls first?",
             "Yes. Patching and sanding are part of every interior job we quote. If there's damage that needs more than spackle, you hear about it before we start painting, not after."),
            ("What about lead paint?",
             "Homes built before 1978 can have lead paint. We follow the EPA's renovation rules for disturbing it and we'll tell you if your job needs that handled differently."),
            ("One coat or two?",
             "Two, unless it's the exact same color and sheen. One coat is how a job looks tired in a year."),
        ],
        "related": ["kitchen-remodeling", "siding-exterior", "flooring"],
    },
    {
        "slug": "flooring",
        "nav": "Flooring",
        "h1": "Flooring Installation in Queens, NY",
        "title": "Flooring Installation & Refinishing in Queens, NY | Archats LLC",
        "desc": "Hardwood refinishing, hardwood and LVP install, tile floors and subfloor repair in Queens and Brooklyn. Level subfloor, proper transitions.",
        "img": "/images/service-flooring.webp",
        "alt": "New hardwood floor installation",
        "lede": "Floors fail from underneath. If the subfloor isn't flat and dry, even a good product will cup, squeak or lift within a year — so we check that before we quote anything.",
        "body": [
            ("Refinish before you replace",
             ["If you have original hardwood under carpet, sanding it back is almost always cheaper and better than covering it with something new. We strip the old finish, repair boards, and bring the grain back.",
              "When replacement is the right call, we level the subfloor first, then install with the right underlayment for the room and the building."]),
        ],
        "includes": [
            "Hardwood sanding, staining and refinishing",
            "Solid and engineered hardwood installation",
            "Luxury vinyl plank, tile and sheet flooring",
            "Subfloor leveling and repair, squeak fixes",
            "Sound underlayment for condos and co-ops",
            "Stairs, thresholds, baseboards and shoe molding",
        ],
        "steps": [
            ("Check", "We test the subfloor for flatness and moisture, and check whether existing hardwood can be refinished or needs replacing."),
            ("Acclimate", "Wood products sit in the room before install so they don't move after. This takes days and skipping it is why floors gap."),
            ("Install", "Level, underlay, lay out, install, then sand and finish or fit the new material."),
            ("Finish", "Baseboards, transitions, and a walkthrough with you before the last coat is dry."),
        ],
        "price": [
            "Refinish vs new install — refinishing is usually cheaper if the wood is sound.",
            "Square footage, and how many rooms the layout has to run through.",
            "Subfloor condition; leveling is real work and it's not optional.",
            "Stairs, which are priced per step and take disproportionate time.",
        ],
        "faqs": [
            ("Can my old hardwood be saved?",
             "Usually, if it's solid wood and hasn't been sanded too many times. We check the thickness above the tongue before promising a refinish."),
            ("Do I need sound underlayment?",
             "In most co-ops and condos, yes — the building will require a specific acoustic rating. We'll give you the spec your board wants before we buy anything."),
            ("How long before I can walk on it?",
             "LVP and tile, the same day. Refinished wood needs 24 to 48 hours before furniture, longer for the finish to fully cure."),
        ],
        "related": ["kitchen-remodeling", "basement-finishing", "painting"],
    },
]


def head(s):
    ld_service = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": s["h1"],
        "serviceType": s["nav"],
        "description": s["desc"],
        "url": f"{SITE}/{s['slug']}/",
        "image": SITE + s["img"],
        "provider": {
            "@type": "GeneralContractor",
            "name": "Archats LLC",
            "telephone": TEL,
            "url": SITE + "/",
            "areaServed": ["Queens", "Brooklyn", "Bronx", "Manhattan", "Staten Island", "Long Island", "New Jersey"],
        },
        "areaServed": [
            {"@type": "City", "name": "Queens"},
            {"@type": "City", "name": "Brooklyn"},
            {"@type": "City", "name": "New York"},
        ],
    }
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Services", "item": SITE + "/#services"},
            {"@type": "ListItem", "position": 3, "name": s["nav"], "item": f"{SITE}/{s['slug']}/"},
        ],
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in s["faqs"]
        ],
    }
    blocks = "\n".join(
        '  <script type="application/ld+json">\n  %s\n  </script>'
        % json.dumps(x, indent=1, ensure_ascii=False)
        for x in (ld_service, crumbs, faq)
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(s['title'])}</title>
  <meta name="description" content="{html.escape(s['desc'])}" />
  <link rel="canonical" href="{SITE}/{s['slug']}/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Archats LLC" />
  <meta property="og:title" content="{html.escape(s['title'])}" />
  <meta property="og:description" content="{html.escape(s['desc'])}" />
  <meta property="og:url" content="{SITE}/{s['slug']}/" />
  <meta property="og:image" content="{SITE}{s['img']}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
{blocks}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/styles.css?v=3" />
  <link rel="stylesheet" href="/css/service.css?v=1" />
  <script src="/js/analytics.js?v=1"></script>
</head>
<body>
  <div class="topbar">
    <div class="container topbar__inner">
      <span class="topbar__note">Family owned · Licensed &amp; insured · Serving NY &amp; NJ</span>
      <div class="topbar__links">
        <a class="topbar__link" data-tel><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1Z"/></svg><span class="teltext"></span></a>
        <a class="topbar__link" data-mail><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 7 8-5H4l8 5Z"/></svg><span class="mailtext"></span></a>
      </div>
    </div>
  </div>

  <header class="nav" id="nav">
    <div class="container nav__inner">
      <a href="/" class="brand" aria-label="Archat Renovations home">
        <img src="/images/logo.png" alt="Archat Renovations" class="brand__logo" />
      </a>
      <nav class="nav__links" aria-label="Primary">
        {''.join(f'<a href="{u}">{t}</a>' for t, u in NAV)}
      </nav>
      <div class="nav__actions">
        <a href="/#contact" class="btn btn--solid">Free Estimate</a>
        <button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="nav__mobile" id="navMobile">
      {''.join(f'<a href="{u}">{t}</a>' for t, u in NAV)}
      <a href="/#contact" class="btn btn--solid">Free Estimate</a>
    </div>
  </header>
"""


def body(s):
    body_html = "".join(
        f"<h2>{h}</h2>" + "".join(f"<p>{p}</p>" for p in ps)
        for h, ps in s["body"]
    )
    includes = "".join(f"<li>{i}</li>" for i in s["includes"])
    steps = "".join(
        f'<li class="step"><span class="step__n">{n:02d}</span><div><strong>{t}</strong><p>{d}</p></div></li>'
        for n, (t, d) in enumerate(s["steps"], 1)
    )
    price = "".join(f"<li>{p}</li>" for p in s["price"])
    faqs = "".join(
        f'<details class="faq__item"><summary>{q}</summary><p>{a}</p></details>'
        for q, a in s["faqs"]
    )
    others = [c for c in CONTENT if c["slug"] in s["related"]]
    related = "".join(
        f'<a class="rel" href="/{o["slug"]}/"><img src="{o["img"]}" alt="{html.escape(o["alt"])}" loading="lazy" />'
        f'<span><strong>{o["nav"]}</strong><em>{o["h1"].split(" in ")[0]}</em></span></a>'
        for o in others
    )
    return f"""
  <main>
    <section class="sv-hero">
      <div class="container sv-hero__in">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>/</span><a href="/#services">Services</a><span>/</span><b>{s['nav']}</b>
        </nav>
        <h1>{s['h1']}</h1>
        <p class="sv-lede">{s['lede']}</p>
        <div class="sv-cta">
          <a href="/#contact" class="btn btn--solid btn--lg">Get a free estimate</a>
          <a href="tel:{TEL}" class="btn btn--ghost btn--lg">Call {PHONE}</a>
        </div>
      </div>
      <figure class="sv-hero__fig">
        <img src="{s['img']}" alt="{html.escape(s['alt'])}" width="1200" height="900" />
      </figure>
    </section>

    <section class="sv-body">
      <div class="container sv-body__in">
        <div class="sv-prose">{body_html}</div>
        <aside class="sv-facts">
          <h2 class="sv-facts__h">What's included</h2>
          <ul class="sv-check">{includes}</ul>
        </aside>
      </div>
    </section>

    <section class="sv-steps-wrap">
      <div class="container">
        <h2 class="sv-h2">How the job runs</h2>
        <ol class="sv-steps">{steps}</ol>
      </div>
    </section>

    <section class="sv-body">
      <div class="container sv-narrow">
        <h2 class="sv-h2">What moves the price</h2>
        <ul class="sv-price">{price}</ul>
        <p class="sv-note">Every quote is itemized, so you can see what each part of the job costs and decide what to keep.</p>
      </div>
    </section>

    <section class="sv-faq-wrap">
      <div class="container sv-narrow">
        <h2 class="sv-h2">Questions we get asked</h2>
        <div class="faq__list">{faqs}</div>
      </div>
    </section>

    <section class="sv-areas">
      <div class="container">
        <h2 class="sv-h2">Where we work</h2>
        <p>New York based. We take {s['nav'].lower()} jobs across Queens — Astoria, Forest Hills, Flushing, Long Island City, Jackson Heights, Bayside, Woodside, Ridgewood — and into Brooklyn, the Bronx, Manhattan and Staten Island, plus Long Island and northern New Jersey.</p>
      </div>
    </section>

    <section class="sv-related">
      <div class="container">
        <h2 class="sv-h2">Related work</h2>
        <div class="sv-rellist">{related}</div>
      </div>
    </section>

    <section class="sv-call">
      <div class="container sv-call__in">
        <div>
          <h2>Ready to talk it through?</h2>
          <p>Tell us the room and roughly what you want. We'll come out, look at it properly, and give you a written estimate — free, no obligation.</p>
        </div>
        <div class="sv-call__act">
          <a href="/#contact" class="btn btn--solid btn--lg">Get a free estimate</a>
          <a href="tel:{TEL}" class="btn btn--ghost btn--lg">Call {PHONE}</a>
        </div>
      </div>
    </section>
  </main>
"""


FOOTER = f"""
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="footer__logo-chip"><img src="/images/logo.png" alt="Archat Renovations" class="brand__logo" /></span>
        <span class="footer__tag">General Contracting &amp; Home Improvement</span>
        <span class="footer__bbb" title="Accredited by the Better Business Bureau">BBB Accredited</span>
      </div>
      <div class="footer__links">
        <a href="/#services">Services</a>
        <a href="/#about">About</a>
        <a href="/#work">Our Work</a>
        <a href="/#process">Process</a>
        <a href="/#areas">Areas</a>
        <a href="/#contact">Contact</a>
      </div>
      <p class="footer__copy">© 2026 Archats LLC. All rights reserved. · Licensed &amp; Insured</p>
    </div>
  </footer>
  <script src="/js/main.js?v=5"></script>
</body>
</html>
"""


def main():
    for s in CONTENT:
        os.makedirs(os.path.join(OUT, s["slug"]), exist_ok=True)
        page = head(s) + body(s) + FOOTER
        with open(os.path.join(OUT, s["slug"], "index.html"), "w") as f:
            f.write(page)
        print("wrote", s["slug"], len(page), "bytes")

    urls = [(SITE + "/", "1.0")] + [(f"{SITE}/{s['slug']}/", "0.8") for s in CONTENT]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, p in urls:
        xml.append(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>2026-10-28</lastmod>\n"
                   f"    <changefreq>monthly</changefreq>\n    <priority>{p}</priority>\n  </url>")
    xml.append("</urlset>")
    with open(os.path.join(OUT, "sitemap.xml"), "w") as f:
        f.write("\n".join(xml) + "\n")
    print("sitemap:", len(urls), "urls")


if __name__ == "__main__":
    main()
