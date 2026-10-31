import glob
import re

head_tags = '''  <!-- Adsterra Global Integration Scripts -->
  <script data-cfasync="false" src="https://bauval.org/14/6094cf751c70ec375eab4cd81fde7a3f"></script>
  <script data-cfasync="false" src="https://abscloud.org/1/2f53b3ecda14f095b6fb70ee5cb7be52"></script>
</head>'''

top_ad_content = '''<div class="ad-slot" data-slot="top" aria-label="Advertisement" style="min-height: 310px; display: flex; justify-content: center; align-items: center; overflow: hidden; margin: 1.5rem auto;">
        <!-- Adsterra 160x300 Banner -->
        <script type="text/javascript">
          atOptions = {
            'key' : 'c554970c58010fbcd09ddc050f9282bd',
            'format' : 'iframe',
            'height' : 300,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://bauval.org/22/c554970c58010fbcd09ddc050f9282bd"></script>
      </div>'''

mid_ad_content = '''<div class="ad-slot" data-slot="mid" aria-label="Advertisement" style="min-height: 120px; overflow: hidden; display: flex; justify-content: center; align-items: center; margin: 2rem auto;">
        <!-- Adsterra Native Banner Container -->
        <script async="async" data-cfasync="false" src="https://bauval.org/21/20c2142ec15ce5581d6f19cb82f05412"></script>
        <div id="container-20c2142ec15ce5581d6f19cb82f05412"></div>
      </div>'''

bottom_ad_content = '''<div class="ad-slot" data-slot="bottom" aria-label="Advertisement" style="min-height: 90px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.75rem; padding: 1.25rem; margin: 2rem auto;">
        <!-- Adsterra Direct Smartlink & Recommendation -->
        <a href="https://araplhn.org/4/29181b1e999e405ef65e781e74fa6933" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-secondary" style="border: 1px solid var(--accent-cyan); display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.95rem; padding: 0.75rem 1.5rem; border-radius: 9999px;">
          <span>🔥 Recommended Deals &amp; Partner Offers</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>'''

files = glob.glob('*.html') + glob.glob('tools/*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Add head tags if missing
    if 'bauval.org/14/6094cf751c70ec375eab4cd81fde7a3f' not in html:
        html = re.sub(r'</head>', head_tags, html, count=1)

    # 2. Replace top ad slot
    html = re.sub(r'<div class="ad-slot"[^>]*data-slot="top"[^>]*>.*?</div>', top_ad_content, html, flags=re.DOTALL)
    
    # 3. Replace mid ad slot
    html = re.sub(r'<div class="ad-slot"[^>]*data-slot="mid"[^>]*>.*?</div>', mid_ad_content, html, flags=re.DOTALL)

    # 4. Replace bottom ad slot
    html = re.sub(r'<div class="ad-slot"[^>]*data-slot="bottom"[^>]*>.*?</div>', bottom_ad_content, html, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Updated ads across all HTML files successfully.")
