# Performance Optimization Guide for Large Datasets

## Current Optimizations Implemented

### 1. **Pagination for Grid Views** 
- Grid views now show max 60 images per page (configurable)
- List view shows 100 items per page
- Pagination controls appear when dataset exceeds these limits
- Prevents DOM from rendering 10k+ elements at once

### 2. **Efficient Sorting**
- Uses `useMemo` to avoid re-sorting on every render
- Optimized for datasets >1000 images

### 3. **Throttled Callbacks**
- Scroll and resize events are throttled to prevent excessive re-renders

### 4. **Lazy Loading**
- Images load as they come into view
- Reduces initial page load time

## Recommendations for 10k+ Image Datasets

### 1. **Upload Strategy**
- **Upload in batches**: Don't upload all 10k images at once
- **Use ZIP files**: Upload smaller ZIPs (1000 images each) separately
- **Process incrementally**: Tag 1000, export, clear, repeat

### 2. **Memory Management**
- **Clear completed batches**: After exporting, clear images to free memory
- **Use list view**: More memory-efficient than grid for large datasets
- **Close browser tabs**: Other tabs consume memory

### 3. **Browser Recommendations**
- **Use Chrome/Edge**: Better memory management than Firefox/Safari
- **Enable hardware acceleration**: Helps with rendering
- **64-bit browser**: Can access more RAM
- **Close other applications**: Free up system RAM

### 4. **System Requirements**
- **Minimum**: 8GB RAM
- **Recommended**: 16GB+ RAM for 10k+ images
- **Storage**: SSD recommended for faster file operations

### 5. **API Rate Limits**
- Gemini API has rate limits
- Use batch size 5-10 to avoid hitting limits
- Add delays between batches
- Consider upgrading API tier for large datasets

## Future Optimizations (Not Yet Implemented)

### 1. **Virtualization** (react-window)
Would render only visible items:
```typescript
// Pros: Handles 100k+ items smoothly
// Cons: Complex implementation, breaks some features
```

### 2. **Web Workers**
Offload sorting/filtering to background threads:
```typescript
// Pros: Keeps UI responsive
// Cons: Added complexity
```

### 3. **Image Compression**
Compress previews before storing:
```typescript
// Pros: 80% memory reduction
// Cons: Slight quality loss
```

### 4. **IndexedDB Storage**
Store images in browser database instead of memory:
```typescript
// Pros: Handles unlimited images
// Cons: Slower access, complex API
```

### 5. **Server-Side Processing**
Process on server instead of client:
```typescript
// Pros: No browser limitations
// Cons: Requires backend infrastructure
```

## Current Limits

With current optimizations:
- **2-3k images**: Works well on 8GB RAM
- **5k images**: Works on 16GB RAM with pagination
- **10k+ images**: Possible but requires careful management

## Best Practices

1. **Don't upload all at once** - Process in batches of 1000
2. **Use list view for large sets** - More efficient than grid
3. **Export frequently** - Don't wait for all images to complete
4. **Clear after export** - Free memory before next batch
5. **Save progress** - Export ZIPs as checkpoints
6. **Monitor memory** - Watch browser memory usage

## Memory Usage Estimates

| Images | Grid View | List View | Memory |
|--------|-----------|-----------|---------|
| 100    | OK        | OK        | ~200MB  |
| 500    | OK        | OK        | ~800MB  |
| 1000   | Slow      | OK        | ~1.5GB  |
| 5000   | Paginated | OK        | ~3GB    |
| 10000  | Paginated | Paginated | ~6GB+   |

*Estimates vary based on image sizes

## Troubleshooting

### Browser Crashes
1. Reduce batch size to 50
2. Switch to list view
3. Clear browser cache
4. Close other tabs
5. Restart browser

### Slow Performance
1. Use pagination (already enabled)
2. Sort less frequently
3. Reduce batch size
4. Disable animations

### Memory Errors
1. Process in smaller batches
2. Clear images after export
3. Use Chrome with --max-old-space-size=4096
4. Close other applications

## Configuration Tips

For 10k images, adjust these settings:
- **Batch Size**: 3-5 (lower = less memory)
- **View Mode**: List (more efficient)
- **Pagination**: Already enabled automatically
- **Sound**: Disable to save CPU
- **Animations**: Already minimal

## Summary

The app now handles large datasets much better with:
- ✅ Pagination for grid views
- ✅ Efficient sorting
- ✅ Throttled events
- ✅ Memory-conscious design

For 10k+ images, the recommended workflow is:
1. Upload 1000 images
2. Process them
3. Export ZIP
4. Clear gallery
5. Repeat for next 1000

This keeps memory usage manageable while processing unlimited images.
