# AI Layer Testing Checklist

Use this checklist to verify the AI Layer integration is working correctly.

---

## Pre-Testing Setup

- [ ] AI service running on http://localhost:8000
- [ ] Backend API running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] Database migration completed (`npx prisma migrate dev`)
- [ ] Environment variables configured
- [ ] User account created and logged in

---

## AI Design Assistant - Image Mode

### Basic Functionality
- [ ] Click "AI Assist" button in profile editor
- [ ] Modal opens with "From Image" and "From Description" tabs
- [ ] "From Image" tab is active by default
- [ ] Drag-and-drop zone is visible

### Image Upload
- [ ] Drag and drop an image onto the upload zone
- [ ] Image preview appears
- [ ] Click upload zone to open file picker
- [ ] Select image via file picker
- [ ] Image preview updates

### File Validation
- [ ] Upload a non-image file (e.g., .txt)
- [ ] Error message shown: "Invalid file type"
- [ ] Upload an image larger than 10MB
- [ ] Error message shown about file size

### Design Preferences
- [ ] Dark mode toggle works (on/off)
- [ ] Animation level buttons work (none/low/medium/high)
- [ ] Pixel density buttons work (minimal/normal/heavy)
- [ ] Neon intensity buttons work (low/medium/high)
- [ ] High contrast toggle works (on/off)
- [ ] Selected options are highlighted in purple

### CSS Generation
- [ ] Click "Generate CSS" button
- [ ] Loading spinner appears
- [ ] "Generating..." text shows on button
- [ ] Button is disabled during generation
- [ ] After 5-15 seconds, preview appears in right column

### Results Preview
- [ ] AI explanation text is shown
- [ ] Color palette displays (colored squares)
- [ ] CSS code appears in code block
- [ ] CSS syntax looks valid
- [ ] Copy button is visible on code block
- [ ] Click "Copy" button
- [ ] CSS copied to clipboard (paste to verify)

### Applying CSS
- [ ] Click "Apply to Profile" button
- [ ] Modal closes
- [ ] CSS is inserted into profile editor
- [ ] Success message appears

---

## AI Design Assistant - Description Mode

### Tab Switching
- [ ] Click "From Description" tab
- [ ] Tab becomes active (purple underline)
- [ ] Textarea for description appears
- [ ] Example prompts are shown below textarea

### Text Input
- [ ] Type a description (e.g., "Dark with neon purple accents")
- [ ] Text appears in textarea
- [ ] Character count updates (if implemented)
- [ ] Try various descriptions:
  - [ ] "Cyberpunk theme with neon blue and pink"
  - [ ] "Minimal black and white, high contrast"
  - [ ] "Pastel colors, soft gradients, dreamy vibes"
  - [ ] "Matrix green on black, retro terminal"

### Design Preferences
- [ ] Same preferences form appears
- [ ] All toggles and buttons work
- [ ] Preferences persist when switching tabs

### CSS Generation
- [ ] Click "Generate CSS" without description
- [ ] Error shown: "Please enter a description"
- [ ] Enter description and click "Generate CSS"
- [ ] Loading state shows
- [ ] Results appear after generation

### Results
- [ ] Generated CSS reflects the description
- [ ] Color palette matches description
- [ ] AI explanation mentions key design elements
- [ ] Can copy and apply CSS

---

## API Endpoints Testing

### From Image Endpoint
```bash
# Get your JWT token first (login via frontend)
TOKEN="your_jwt_token_here"

# Test image upload
curl -X POST http://localhost:3001/pixelpages/me/design/from-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/test-image.jpg" \
  -F 'preferences={"dark_mode": true, "animation_level": "high"}'
```

**Expected Response:**
```json
{
  "css": "/* Generated CSS code */",
  "explanation": "Generated a vibrant design...",
  "colors": ["#FF006E", "#8338EC", ...]
}
```

**Tests:**
- [ ] 200 status code received
- [ ] Response has `css` field
- [ ] Response has `explanation` field
- [ ] Response has `colors` array
- [ ] CSS is valid (no syntax errors)

### From Description Endpoint
```bash
curl -X POST http://localhost:3001/pixelpages/me/design/from-description \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dark cyberpunk theme with neon purple accents",
    "preferences": {"dark_mode": true, "neon_intensity": "high"}
  }'
```

**Tests:**
- [ ] 200 status code received
- [ ] Response structure matches image endpoint
- [ ] CSS reflects the description
- [ ] Color palette is appropriate

### Error Cases
```bash
# Missing image
curl -X POST http://localhost:3001/pixelpages/me/design/from-image \
  -H "Authorization: Bearer $TOKEN"

# Expected: 400 Bad Request
```

- [ ] Missing image returns 400
- [ ] Missing description returns 400
- [ ] Invalid token returns 401
- [ ] Invalid file type returns 400

---

## Moderation Queue

### Guestbook Entry Moderation
- [ ] Post a guestbook entry on someone's profile
- [ ] Entry is created successfully
- [ ] Check backend logs for "queued for moderation"
- [ ] Entry auto-approved (visible immediately)

### Database Verification
```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npx prisma studio
```

- [ ] Open `moderation_queue` table
- [ ] New entry exists for guestbook post
- [ ] `status` is "APPROVED"
- [ ] `aiScore` is 1.0
- [ ] `contentType` is "GUESTBOOK"

### Admin Endpoints (if you have admin user)
```bash
# Get moderation queue
curl http://localhost:3001/moderation/queue \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

- [ ] Returns list of moderation items
- [ ] Each item has required fields
- [ ] Can filter by status

---

## Integration Testing

### Profile Editor Flow
1. [ ] Go to profile editor
2. [ ] Click "AI Assist"
3. [ ] Upload an image
4. [ ] Adjust preferences
5. [ ] Generate CSS
6. [ ] Apply to profile
7. [ ] Save profile
8. [ ] View your profile
9. [ ] CSS is applied and visible

### Multiple Generations
- [ ] Generate CSS from image
- [ ] Don't apply, generate again with different preferences
- [ ] Both generations work
- [ ] Can switch between tabs and generate from both
- [ ] Previous results are cleared when generating new

### Edge Cases
- [ ] Upload image, then switch to description tab
- [ ] Generate from description, then switch back to image
- [ ] Close modal without applying
- [ ] Reopen modal, state is reset
- [ ] Generate CSS, close modal, reopen, previous result is gone

---

## Performance Testing

### Generation Speed
- [ ] Image generation completes in 5-15 seconds
- [ ] Description generation completes in 5-15 seconds
- [ ] Loading states show during wait
- [ ] No browser freezing or UI lag

### File Upload
- [ ] Small images (100KB) upload quickly
- [ ] Large images (5MB) upload successfully
- [ ] Very large images (10MB) upload successfully
- [ ] Images over 10MB are rejected

---

## Error Handling

### Network Errors
- [ ] Stop AI service
- [ ] Try to generate CSS
- [ ] User-friendly error message shown
- [ ] Can retry after restarting service

### Backend Errors
- [ ] Stop backend API
- [ ] Try to generate CSS
- [ ] Frontend shows connection error
- [ ] Can retry after restarting backend

### Invalid Inputs
- [ ] Empty description shows error
- [ ] No image selected shows error
- [ ] Invalid file type shows error
- [ ] Error messages are clear and helpful

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Features to verify:**
- Image drag-and-drop works
- File picker works
- Modal displays correctly
- CSS preview renders
- Colors display properly

---

## Mobile Responsiveness

Test on mobile device or browser dev tools:
- [ ] Modal is responsive
- [ ] Tabs are tappable
- [ ] Image upload works
- [ ] Preferences form is usable
- [ ] CSS preview is scrollable
- [ ] All text is readable

---

## Accessibility

- [ ] Modal can be closed with Escape key
- [ ] Buttons have hover states
- [ ] Loading states are announced
- [ ] Error messages are visible
- [ ] Color contrast is sufficient
- [ ] Keyboard navigation works

---

## AI Service Health

### Health Endpoints
```bash
# Basic health
curl http://localhost:8000/health

# Readiness check
curl http://localhost:8000/health/ready

# Design endpoint health
curl http://localhost:8000/design/health
```

- [ ] All return 200 OK
- [ ] Responses include status information

### Mock Mode
- [ ] AI service runs with `ENABLE_MOCK_RESPONSES=true`
- [ ] Returns realistic mock data
- [ ] Generation works without real Claude API key

---

## Database Integrity

### After Testing
```sql
-- Check moderation queue
SELECT * FROM moderation_queue ORDER BY created_at DESC LIMIT 10;

-- Count by status
SELECT status, COUNT(*) FROM moderation_queue GROUP BY status;

-- Check for failed moderations
SELECT * FROM moderation_queue WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '1 hour';
```

- [ ] All entries have valid data
- [ ] No orphaned entries
- [ ] Status transitions make sense

---

## Production Readiness Checklist

Before deploying to production:

### Security
- [ ] Change `AI_SERVICE_API_KEY` to secure random string
- [ ] Set up real Claude API key (disable mock mode)
- [ ] Configure CORS for production domain
- [ ] Add rate limiting to AI endpoints
- [ ] Validate all user inputs

### Performance
- [ ] Add request caching for common designs
- [ ] Implement request queuing
- [ ] Set up monitoring and alerting
- [ ] Add CDN for image uploads

### User Experience
- [ ] Add usage limits (X generations per hour)
- [ ] Show helpful error messages
- [ ] Add generation history
- [ ] Implement design refinement (future)

---

## Known Limitations (Current MVP)

These are intentional for MVP launch:

1. **Moderation Auto-Approves**
   - All content is auto-approved
   - Moderation queue tracks items for future implementation
   - Admin can manually review if needed

2. **No Design Refinement**
   - Can't iterate on generated CSS with chat
   - Must regenerate from scratch
   - Future feature

3. **No Template Caching**
   - Every request calls AI service
   - No caching of common patterns
   - Future optimization

4. **Basic Preferences**
   - Limited customization options
   - No brand color input
   - No layout preferences
   - Can be expanded later

---

## Success Criteria

The AI Layer integration is successful if:

- ✅ Users can generate CSS from images
- ✅ Users can generate CSS from descriptions
- ✅ Generated CSS is valid and applicable
- ✅ UI is intuitive and responsive
- ✅ Errors are handled gracefully
- ✅ Performance is acceptable (5-15 sec)
- ✅ Moderation infrastructure is in place

---

## Testing Complete!

Once you've checked off all the items in this checklist, the AI Layer is ready for production. The magical "show me what you want" feature is working and will amaze users!

**Next Steps:**
1. Deploy to staging environment
2. Get feedback from beta users
3. Iterate on UX improvements
4. Implement actual AI moderation (future)
5. Launch to production! 🚀
