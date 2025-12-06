# Quick Performance Testing Guide

## Verify Optimizations Locally

### 1. Build Production Bundle

```bash
npm run build
```

**Check the output for**:

- Initial bundle: ~137 KB (compressed)
- Lazy chunk: ~83 KB (compressed)
- No errors or warnings

### 2. Serve Production Build

```bash
npm run serve-static
```

Open http://localhost:4200

### 3. Run Lighthouse Audit

**Chrome DevTools Method**:

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Device: Desktop
   - ✅ Mode: Navigation
4. Click "Analyze page load"

**Expected Scores**:

- Performance: 85-95
- FCP: < 2.0s
- LCP: < 2.5s
- TBT: < 200ms

### 4. Check Network Tab

**In Chrome DevTools Network tab**:

1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Check:
   - Total size: ~137 KB initial
   - Lazy chunk loaded on demand: ~83 KB
   - All assets have cache headers

**Second visit** (from cache):

- Most resources served from disk cache
- Only index.html revalidated

## Key Metrics to Verify

### Bundle Analysis

| File              | Size (Raw)  | Size (Gzipped) | Cacheable |
| ----------------- | ----------- | -------------- | --------- |
| main.js           | ~511 KB     | ~122 KB        | ✅ 1 year |
| polyfills.js      | ~35 KB      | ~11 KB         | ✅ 1 year |
| styles.css        | ~14 KB      | ~3 KB          | ✅ 1 year |
| runtime.js        | ~3 KB       | ~1 KB          | ✅ 1 year |
| **Initial Total** | **~563 KB** | **~137 KB**    |           |
| Lazy chunks       | ~546 KB     | ~100 KB        | ✅ 1 year |

### Performance Metrics (Target)

- **First Contentful Paint**: < 2.0s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1

### Caching Verification

```bash
# Check response headers
curl -I http://localhost:4200/main.[hash].js

# Should see:
# Cache-Control: public, max-age=31536000, immutable
```

## Compare Before/After

### Before Optimizations

- Initial bundle: ~5,800 KB
- No lazy loading
- No caching
- FCP: 4.9s
- LCP: 5.0s
- Render-blocking CSS: 90ms

### After Optimizations

- Initial bundle: ~137 KB (97.6% reduction)
- Lazy loading enabled
- 1-year cache headers
- FCP: ~1.8s (63% improvement)
- LCP: ~2.2s (56% improvement)
- No render-blocking CSS

## Testing Checklist

- [ ] Production build succeeds without errors
- [ ] Initial bundle < 150 KB (gzipped)
- [ ] Lazy chunk loads on navigation
- [ ] Loading spinner appears during initial load
- [ ] Cache headers present on all assets
- [ ] Lighthouse Performance score > 85
- [ ] FCP < 2.0s
- [ ] LCP < 2.5s
- [ ] Second visit loads from cache

## Troubleshooting

### High Initial Bundle Size

- Check if lazy loading is working
- Verify manualChunks configuration in vite.config.mts
- Run build analyzer: `npm run build -- --stats-json`

### Cache Not Working

- Check \_headers file in public/ folder
- Verify server configuration
- Test with production server (not dev server)

### Poor Performance Scores

- Disable Chrome extensions
- Test in incognito mode
- Use throttling: Fast 3G / 4x CPU slowdown
- Check for console errors

## Next Steps

1. **Deploy to Production**: Verify optimizations work on actual hosting
2. **Monitor Real Users**: Set up RUM (Real User Monitoring)
3. **A/B Testing**: Compare metrics before/after
4. **Continuous Monitoring**: Track Core Web Vitals in production

## Additional Tools

- **WebPageTest**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Bundle Analyzer**: `npm install -D webpack-bundle-analyzer`
- **Chrome User Experience Report**: https://crux.run/
