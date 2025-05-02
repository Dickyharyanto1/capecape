// functions/_middleware.js - Modified for 3D cube AMP template

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // Check if request is from GoogleBot or AMP cache
  const userAgent = request.headers.get('User-Agent') || '';
  const isFromGoogle = userAgent.includes('Googlebot') || userAgent.includes('Google-AMP');
  const isFromAMPCache = url.hostname.includes('cdn.ampproject.org') || 
                         url.hostname.includes('amp.cloudflare.com');
  
  // If this is a request for target.txt, let it process normally
  if (url.pathname.endsWith('/target.txt')) {
    return next();
  }
  
  try {
    // Read target.txt file (assuming this file exists in assets or public folder)
    let targetContent;
    try {
      // Use Cloudflare KV or file system to read target.txt
      const targetResponse = await fetch(new URL('/target.txt', url.origin));
      
      if (!targetResponse.ok) {
        throw new Error(`Failed to fetch target.txt: ${targetResponse.status}`);
      }
      
      targetContent = await targetResponse.text();
    } catch (error) {
      console.error('Error loading target.txt:', error);
      // If target.txt cannot be read, use fallback data
      targetContent = 'kids 77\nkerasakti 777\nkingkong39\nkitty223\nusutoto\nstars88\nbtcplay\nkodokwin\nkubujp\nkudabet88';
    }
    
    // Parse content from target.txt into array with correct URL format
    const sitesMap = new Map(); // To store originalName -> urlFormat pairs
    
    // Array for display and processing
    const sites = targetContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Create map to look up site names and URL formats
    sites.forEach(site => {
      // URL Format: If site contains spaces, replace with hyphens
      let urlFormat = site;
      if (site.includes(' ')) {
        urlFormat = site.replace(/\s+/g, '-');
      }
      // Save to map for later reference
      sitesMap.set(urlFormat.toLowerCase(), site);
      // Also save version without hyphens, without spaces
      sitesMap.set(site.toLowerCase().replace(/\s+/g, ''), site);
    });
    
    // Find out which site is being accessed
    const pathSegments = url.pathname.split('/').filter(segment => segment);
    const currentSite = pathSegments.length > 0 ? pathSegments[0].toLowerCase() : '';
    
    // Check if accessed site is in the map
    const originalSiteName = sitesMap.get(currentSite) || 
                             sitesMap.get(currentSite.replace(/-/g, '')) ||
                             sitesMap.get(currentSite.replace(/-/g, ' '));
    
    if (originalSiteName || pathSegments.length === 0) {
      // Choose site based on path or use random if path is empty
      const siteToUse = originalSiteName || sites[Math.floor(Math.random() * sites.length)];
      
      // Create correct URL format for canonical
      let urlFormattedSite = siteToUse;
      if (siteToUse.includes(' ')) {
        urlFormattedSite = siteToUse.replace(/\s+/g, '-');
      }
      
      // Create canonical URL
      const canonicalOrigin = 'https://penelitian.stikesmuwsb.ac.id'; // Replace with your actual domain
      const canonicalUrl = `${canonicalOrigin}/${urlFormattedSite}/`;
      
      // Generate AMP HTML with 3D cube design
      const ampHtml = generate3DCubeAmpHtml(siteToUse, canonicalUrl);
      
      // Add required AMP headers
      const headers = new Headers();
      headers.set('Content-Type', 'text/html');
      headers.set('AMP-Cache-Transform', 'google;v="1..100"');
      
      // If request is from GoogleBot, include Link header for canonical
      if (isFromGoogle || isFromAMPCache) {
        headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
      }
      
      // Enable much longer cache - 30 days (a month)
      const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds
      headers.set('Cache-Control', `public, max-age=${ONE_MONTH_IN_SECONDS}, s-maxage=${ONE_MONTH_IN_SECONDS}, immutable`);
      
      // Additional headers to ensure caching across various systems
      headers.set('Expires', new Date(Date.now() + ONE_MONTH_IN_SECONDS * 1000).toUTCString());
      headers.set('Surrogate-Control', `max-age=${ONE_MONTH_IN_SECONDS}`);
      headers.set('CDN-Cache-Control', `max-age=${ONE_MONTH_IN_SECONDS}`);
      
      // Optional: Set ETag for efficient cache validation
      const etag = `"${siteToUse}-${Date.now().toString(36)}"`;
      headers.set('ETag', etag);
      
      return new Response(ampHtml, {
        headers: headers
      });
    }
    
    // If site not found, continue to next handler
    return next();
    
  } catch (error) {
    console.error('Error in middleware:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Function to generate complete AMP HTML with 3D cube design
function generate3DCubeAmpHtml(siteName, canonicalUrl) {
  // Generate random jackpot value
  const jackpotValue = generateRandomJackpot();
  
  // Generate varied descriptions and content
  const descriptions = [
    `${siteName.toUpperCase()} adalah situs slot online yang gacor dan sedang viral serta menyediakan deposit situs slot dana, slot shopeepay, dan slot pulsa rekomendasi HCAH.`,
    `${siteName.toUpperCase()} merupakan portal terpercaya untuk semua jenis permainan slot online dengan jackpot terbesar dan peluang maxwin tertinggi.`,
    `${siteName.toUpperCase()} situs slot online terpercaya dengan RTP tinggi dan pelayanan 24 jam nonstop untuk semua member baru maupun lama.`,
    `Main dan rasakan sensasi kemenangan bersama ${siteName.toUpperCase()}, situs judi slot online terbaik dengan sistem fair play dan jackpot jutaan rupiah.`
  ];
  
  const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Create array of login URLs to rotate through
  const loginUrls = [
    "https://jali.me/3vriakn"
  ];
  
  // Generate 6 images for cube faces
  const imageSources = [
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/slotdemo.webp",
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/h2hmrj6zl8ocojfa3d78.webp",
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/wezhdtvga0u3bifplimc.webp",
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/tvl3xe4sozct26i4gzcc.webp",
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409495/cfwbsx4hcpoyshpovyth.webp",
    "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409495/r1j4iwins1pnf551a1xe.webp"
  ];
  
  // Complete AMP HTML template with 3D cube design
  return `<!DOCTYPE html>
<html amp lang="id">
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${siteName}: Portal Layanan Terpadu Institut Teknologi dan Kesehatan Sumatera Utara</title>
      <meta name="description" content="Aplikasi resmi Institut Teknologi dan Kesehatan Sumatera Utara (ITKessu) menyediakan layanan akademik, administrasi, dan pembelajaran terintegrasi bagi seluruh civitas akademika. Akses mudah untuk sistem informasi mahasiswa, jadwal kuliah, perpustakaan digital, dan layanan kampus dalam satu platform."/>
      <meta name="robots" content="index, follow"/>
      <meta name="theme-color" content="#cbd000"/> 
      <link rel="canonical" href="${canonicalUrl}"/>
      <link rel="icon" type="image/x-icon" media="(prefers-color-scheme: dark)" href="https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/icon-slotgacor.webp"/>
      <meta property="og:url" content="${canonicalUrl}"/>
      <meta property="og:site_name" content="${siteName}"/>
      <meta property="og:image:alt" content="${siteName}"/>
      <meta property="og:image" content="https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/h2hmrj6zl8ocojfa3d78.webp"/>
      <meta property="og:title" content="${siteName}: Portal Layanan Terpadu Institut Teknologi dan Kesehatan Sumatera Utara"/>
      <meta property="og:description" content="Aplikasi resmi Institut Teknologi dan Kesehatan Sumatera Utara (ITKessu) menyediakan layanan akademik, administrasi, dan pembelajaran terintegrasi bagi seluruh civitas akademika. Akses mudah untuk sistem informasi mahasiswa, jadwal kuliah, perpustakaan digital, dan layanan kampus dalam satu platform."/>
      <meta property="og:locale" content="ID_id"/>
      <meta property="og:type" content="website"/>
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:title" content="${siteName}: Portal Layanan Terpadu Institut Teknologi dan Kesehatan Sumatera Utara"/>
      <meta name="twitter:description" content="Aplikasi resmi Institut Teknologi dan Kesehatan Sumatera Utara (ITKessu) menyediakan layanan akademik, administrasi, dan pembelajaran terintegrasi bagi seluruh civitas akademika. Akses mudah untuk sistem informasi mahasiswa, jadwal kuliah, perpustakaan digital, dan layanan kampus dalam satu platform."/>
      <meta name="twitter:image:src" content="https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/h2hmrj6zl8ocojfa3d78.webp"/>
      <link rel="shortcut icon" type="image/x-webp" href="https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/icon-slotgacor.webp" />
      <script type="application/ld+json">
         {
           "@context": "https://schema.org",
           "@type": "Game",
           "name": "${siteName}",
           "url": "${canonicalUrl}",
           "image": "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/h2hmrj6zl8ocojfa3d78.webp",
           "description": "${randomDesc}",
           "author": {
             "@type": "Organization",
             "name": "${siteName}"
           },
           "publisher": {
             "@type": "Organization",
             "name": "${siteName}",
             "logo": {
               "@type": "ImageObject",
               "url": "https://res.cloudinary.com/doq0uyg5g/image/upload/v1745409494/icon-slotgacor.webp"
             }
           },
           "genre": "Game Online",
           "operatingSystem": "All",
           "applicationCategory": "Game",
           "aggregateRating": {
             "@type": "AggregateRating",
             "ratingValue": "4.6",
             "ratingCount": "215"
           }
         }
      </script>
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"/>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet"/>
      <link rel="preload" as="script" href="https://cdn.ampproject.org/v0.js"/>
      <link rel="preload" as="image" href="${imageSources[0]}"/>
      <link rel="preload" as="image" href="${imageSources[1]}"/>
      <link rel="preload" as="image" href="${imageSources[2]}"/>
      <link rel="preload" as="image" href="${imageSources[3]}"/>
      <link rel="preload" as="image" href="${imageSources[4]}"/>
      <link rel="preload" as="image" href="${imageSources[5]}"/>
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript><style amp-custom>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Orbitron,sans-serif;background:#99212d;color:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;padding:20px;flex-direction:column}.container{width:100%;max-width:1024px;display:flex;flex-direction:column;align-items:center;position:relative;perspective:1000px;transform-style:preserve-3d}.cube{position:relative;width:300px;height:300px;transform-style:preserve-3d;transform:rotateX(30deg) rotateY(30deg);animation:spin 20s infinite linear;margin-top:20px}.cube div{position:absolute;width:100%;height:100%;background:#1f1f1f;border:2px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:20px;opacity:.9}.cube .front{transform:translateZ(150px)}.cube .back{transform:rotateY(180deg) translateZ(150px)}.cube .left{transform:rotateY(-90deg) translateZ(150px)}.cube .right{transform:rotateY(90deg) translateZ(150px)}.cube .top{transform:rotateX(90deg) translateZ(150px)}.cube .bottom{transform:rotateX(-90deg) translateZ(150px)}.cube amp-img{width:100%;height:100%;object-fit:cover}.static-logo{width:100px;height:100px;margin-bottom:-50px}@keyframes spin{from{transform:rotateX(30deg) rotateY(30deg)}to{transform:rotateX(30deg) rotateY(390deg)}}.cta{margin-top:40px;font-size:18px;color:#ff4081;text-align:center;animation:text-pulse 2s infinite}@keyframes text-pulse{0%,100%{opacity:1}50%{opacity:.5}}.cta a{display:inline-block;padding:12px 24px;margin:10px 5px;background:#000000;color:#99212d;text-decoration:none;border-radius:5px;transition:background .3s ease}.cta a:hover{background:#ff6363}@media (max-width:600px){.cube{width:200px;height:200px}.static-logo{width:240px;height:60px;margin-bottom:100px}.cta{font-size:16px;margin-top:80px}}.h1{margin-top:20px;font-size:medium;color:#000000}.footer{font-size:small;text-align:center}.copyright{color:#000000}
      
      /* Jackpot display */
      .jackpot-container {
        background: linear-gradient(45deg, #222222, #333333);
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        text-align: center;
        border: 1px solid rgba(255, 215, 0, 0.3);
        color: #ffffff;
        width: 80%;
        max-width: 300px;
      }
      
      .jackpot-title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      
      .jackpot-value {
        font-size: 24px;
        font-weight: 700;
        color: #ffc107;
        text-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
        letter-spacing: 1px;
      }
      </style>
   <body>
      <amp-img class="static-logo" src="${imageSources[3]}" width="150" height="150" layout="intrinsic" alt="${siteName}"></amp-img>
      <div class="container">
         <div class="cube">
            <div class="front">
               <amp-img src="${imageSources[0]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
            <div class="back">
               <amp-img src="${imageSources[2]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
            <div class="left">
               <amp-img src="${imageSources[3]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
            <div class="right">
               <amp-img src="${imageSources[1]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
            <div class="bottom">
               <amp-img src="${imageSources[4]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
            <div class="top">
               <amp-img src="${imageSources[5]}" width="400" height="400" layout="responsive" alt="${siteName}"></amp-img>
            </div>
         </div>
         
         <!-- Added jackpot display -->
         <div class="jackpot-container">
            <div class="jackpot-title">JACKPOT TERKINI:</div>
            <div class="jackpot-value">${jackpotValue}</div>
         </div>
         
         <div class="cta">
            <h1 class="h1">${siteName}: Portal Layanan Terpadu Institut Teknologi dan Kesehatan Sumatera Utara</h1>
            <a href="${loginUrls[0]}" target="_blank" rel="nofollow noreferrer noopener">LOGIN</a>
            <a href="${loginUrls[0]}" target="_blank" rel="nofollow noreferrer noopener">DAFTAR</a>
            <a href="${loginUrls[0]}" target="_blank" rel="nofollow noreferrer noopener">LIVE CHAT</a>
         </div>
         <br>
      </div>
      <footer class="footer">COPYRIGHT - <a class="${siteName}" href="${canonicalUrl}" title="${siteName}">${siteName}</a> OFFICIAL</footer>
   </body>
</html>`;
}

// Function to generate random jackpot value
function generateRandomJackpot() {
  const billions = Math.floor(Math.random() * 10); // 0-9 billion
  const millions = Math.floor(Math.random() * 1000); // 0-999 million
  const thousands = Math.floor(Math.random() * 1000); // 0-999 thousand
  const hundreds = Math.floor(Math.random() * 1000); // 0-999 hundred
  
  return `Rp ${billions},${millions.toString().padStart(3, '0')},${thousands.toString().padStart(3, '0')},${hundreds.toString().padStart(3, '0')}`;
}
